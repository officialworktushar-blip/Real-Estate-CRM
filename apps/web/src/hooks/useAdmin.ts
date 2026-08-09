import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import type { AdminUser, AdminSubscription, SubscriptionStats, SystemStats, AuditLog, BillingRecord, RevenueData } from "@/services/admin.service";
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

export function useAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!hasLoaded) setIsLoading(true);
    setError(null);

    Promise.allSettled([
      adminService.subscriptions.list({ page, limit: 20 }),
      adminService.subscriptions.stats(),
    ])
      .then((results) => {
        if (!active) return;
        const [subsRes, statsRes] = results;
        if (subsRes.status === "fulfilled") {
          setSubscriptions(subsRes.value.data);
          setMeta(subsRes.value.meta);
        }
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        const message = collectRejectionMessages(results);
        if (message) setError(message);
      })
      .catch((err) => {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to fetch subscriptions"));
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
  }, [page, loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  return {
    subscriptions,
    stats,
    meta,
    isLoading,
    error,
    page,
    setPage,
    refetch,
  };
}

export function useAdminBilling() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!hasLoaded) setIsLoading(true);
    setError(null);

    Promise.allSettled([
      adminService.billing.list({ page, limit: 20 }),
      adminService.billing.revenue(),
    ])
      .then((results) => {
        if (!active) return;
        const [billingRes, revenueRes] = results;
        if (billingRes.status === "fulfilled") {
          setRecords(billingRes.value.data);
          setMeta(billingRes.value.meta);
        }
        if (revenueRes.status === "fulfilled") setRevenue(revenueRes.value.data);
        const message = collectRejectionMessages(results);
        if (message) setError(message);
      })
      .catch((err) => {
        if (!active) return;
        setError(toErrorMessage(err, "Failed to fetch billing data"));
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
  }, [page, loadKey]);

  const refetch = useCallback(() => setLoadKey((k) => k + 1), []);

  return {
    records,
    revenue,
    meta,
    isLoading,
    error,
    page,
    setPage,
    refetch,
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
