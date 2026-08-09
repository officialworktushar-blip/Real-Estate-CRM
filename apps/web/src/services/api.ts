import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

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
      throw new Error(error.message || `HTTP ${response.status}`);
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
    const key = this.cacheKey(method, endpoint);

    if (method === "GET" && cacheTtlMs > 0) {
      const cached = this.getCachedValue<T>(key);
      if (cached !== undefined) return Promise.resolve(cached);
    }

    const existing = inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = this.performRequest<T>(endpoint, options, cacheTtlMs).finally(
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
}

export const api = new ApiClient(API_URL);
