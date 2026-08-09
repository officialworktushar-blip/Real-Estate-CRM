import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
