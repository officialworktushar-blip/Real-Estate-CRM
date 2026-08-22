import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const API_URL = resolveApiBaseUrl();

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  code?: string;
  details?: Record<string, string[]>;

  constructor(message: string, code?: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    if (err instanceof ApiError && err.details) {
      const fieldMessages = Object.entries(err.details)
        .map(([field, list]) => `${field}: ${list.join(", ")}`);
      if (fieldMessages.length > 0) {
        return fieldMessages.join("; ");
      }
    }
    return err.message;
  }
  return fallback;
}

class ApiClient {
  private baseUrl: string;
  private noOrgRetried = new Set<string>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        return data.session.access_token;
      }
    } catch {
      // Session lookup failed; fall back to the cached token below.
    }
    return localStorage.getItem("access_token");
  }

  private cacheKey(method: string, endpoint: string): string {
    return `${method} ${endpoint}`;
  }

  private getCachedValue<T>(key: string): T | undefined {
    const entry = responseCache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      responseCache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  private async performRequest<T>(
    endpoint: string,
    options: RequestInit,
    cacheTtlMs: number
  ): Promise<T> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));

      // ── 403 NO_ORGANIZATION recovery ──────────────────────────────────
      // If the user has no linked org, call ensure-org once and retry.
      // This is the frontend "suspender" — the backend auth middleware is
      // the primary belt that auto-provisions orgs.
      if (
        response.status === 403 &&
        error.code === "NO_ORGANIZATION" &&
        !this.noOrgRetried.has(endpoint)
      ) {
        this.noOrgRetried.add(endpoint);
        console.warn(
          "[API] 403 NO_ORGANIZATION on",
          endpoint,
          "— calling ensure-org then retrying once"
        );
        try {
          await this.post("/auth/ensure-org");

          // Refresh the user in the auth store so withOrgScope picks up
          // the new org_id for subsequent requests.
          const { user: currentUser } = useAuthStore.getState();
          if (currentUser && !currentUser.org_id) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("org_id")
                .eq("id", session.user.id)
                .maybeSingle();
              if (profile?.org_id) {
                useAuthStore
                  .getState()
                  .setUser({ ...currentUser, org_id: profile.org_id });
              }
            }
          }

          // Retry the request with a fresh token (org may have changed).
          return this.performRequest<T>(endpoint, options, cacheTtlMs);
        } catch (retryErr) {
          console.error("[API] ensure-org + retry failed:", retryErr);
        }
      }

      throw new ApiError(
        error.message || `HTTP ${response.status}`,
        error.code,
        error.details
      );
    }

    const data = await response.json();

    if (cacheTtlMs > 0) {
      responseCache.set(this.cacheKey("GET", endpoint), {
        data,
        expiresAt: Date.now() + cacheTtlMs,
      });
    }

    return data as T;
  }

  request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTtlMs = 0
  ): Promise<T> {
    const method = options.method || "GET";
    const url = method === "GET" ? this.withOrgScope(endpoint) : endpoint;
    const key = this.cacheKey(method, url);

    if (method === "GET" && cacheTtlMs > 0) {
      const cached = this.getCachedValue<T>(key);
      if (cached !== undefined) return Promise.resolve(cached);
    }

    const existing = inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = this.performRequest<T>(url, options, cacheTtlMs).finally(
      () => {
        inFlight.delete(key);
      }
    );
    inFlight.set(key, promise);
    return promise;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  getCached<T>(endpoint: string, ttlMs = 15_000) {
    return this.request<T>(endpoint, {}, ttlMs);
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  clearGetCache(prefix?: string) {
    if (!prefix) {
      responseCache.clear();
      return;
    }
    for (const key of responseCache.keys()) {
      if (key.startsWith(`GET ${prefix}`)) {
        responseCache.delete(key);
      }
    }
  }

  /**
   * Normal (non super_admin) users are scoped to their own organization: an
   * `org_id` query param is appended to every GET so the backend only returns
   * rows belonging to that org. Super admins omit it so they see all data.
   */
  private withOrgScope(endpoint: string): string {
    const { user } = useAuthStore.getState();
    const orgId = user?.org_id;
    if (!orgId || user?.role === "super_admin") return endpoint;
    const sep = endpoint.includes("?") ? "&" : "?";
    return `${endpoint}${sep}org_id=${encodeURIComponent(orgId)}`;
  }
}

export const api = new ApiClient(API_URL);
