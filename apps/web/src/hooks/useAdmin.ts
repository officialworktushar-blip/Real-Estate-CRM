import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import type { AdminUser, SystemStats, AuditLog } from "@/services/admin.service";
import type { PaginatedResponse } from "@/types";

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function collectRejectionMessages(results: PromiseSettledResult<unknown>[]): string {
  return results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => {
      const reason = r.reason as { message?: string } | null | undefined;
      return reason?.message;
    })
    .filter(Boolean)
    .join("; ");
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!hasLoaded) setIsLoading(true);
    setError(null);

    adminService.users
      .list({ page, limit: 20, search })
      .then((res) => {
        if (!active) return;
        setUsers(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to fetch users"));
      })
      .finally(() => {
        if (active) {
          setHasLoaded(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, search, loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  const setSearch = useCallback((q: string) => {
    setSearchInput(q);
    setPage(1);
  }, []);

  const deactivateUser = useCallback(async (userId: string) => {
    try {
      await adminService.users.deactivate(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to deactivate user"));
    }
  }, []);

  return {
    users,
    meta,
    isLoading,
    error,
    search,
    setSearch,
    page,
    setPage,
    refetch,
    deactivateUser,
  };
}

export function useAdminSystem() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!hasLoaded) setIsLoading(true);
    setError(null);

    Promise.allSettled([
      adminService.system.stats(),
      adminService.system.auditLogs({ limit: 50 }),
    ])
      .then((results) => {
        if (!active) return;
        const [statsRes, logsRes] = results;
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (logsRes.status === "fulfilled") setAuditLogs(logsRes.value.data);
        const message = collectRejectionMessages(results);
        if (message) setError(message);
      })
      .catch((err) => {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to fetch system data"));
      })
      .finally(() => {
        if (active) {
          setHasLoaded(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  return {
    stats,
    auditLogs,
    isLoading,
    error,
    refetch,
  };
}
