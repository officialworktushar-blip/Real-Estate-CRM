import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import type { AdminUser, AdminSubscription, SubscriptionStats, SystemStats, AuditLog, BillingRecord, RevenueData } from "@/services/admin.service";
import type { PaginatedResponse } from "@/types";

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (pageNum = 1, searchQuery = search) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.users.list({ page: pageNum, limit: 20, search: searchQuery });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search, fetchUsers]);

  const refetch = useCallback(() => fetchUsers(page, search), [fetchUsers, page, search]);

  const deactivateUser = useCallback(async (userId: string) => {
    try {
      await adminService.users.deactivate(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user");
    }
  }, []);

  return {
    users,
    meta,
    isLoading,
    error,
    search,
    setSearch: (q: string) => { setSearch(q); setPage(1); },
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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const [subsRes, statsRes] = await Promise.allSettled([
        adminService.subscriptions.list({ page: pageNum, limit: 20 }),
        adminService.subscriptions.stats(),
      ]);

      if (subsRes.status === "fulfilled") {
        setSubscriptions(subsRes.value.data);
        setMeta(subsRes.value.meta);
      }
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);

      const errors = [subsRes, statsRes]
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message);
      if (errors.length > 0) setError(errors.filter(Boolean).join("; "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscriptions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const refetch = useCallback(() => fetchData(page), [fetchData, page]);

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const [billingRes, revenueRes] = await Promise.allSettled([
        adminService.billing.list({ page: pageNum, limit: 20 }),
        adminService.billing.revenue(),
      ]);

      if (billingRes.status === "fulfilled") {
        setRecords(billingRes.value.data);
        setMeta(billingRes.value.meta);
      }
      if (revenueRes.status === "fulfilled") setRevenue(revenueRes.value.data);

      const errors = [billingRes, revenueRes]
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message);
      if (errors.length > 0) setError(errors.filter(Boolean).join("; "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billing data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const refetch = useCallback(() => fetchData(page), [fetchData, page]);

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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, logsRes] = await Promise.allSettled([
        adminService.system.stats(),
        adminService.system.auditLogs({ limit: 50 }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (logsRes.status === "fulfilled") setAuditLogs(logsRes.value.data);

      const errors = [statsRes, logsRes]
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message);
      if (errors.length > 0) setError(errors.filter(Boolean).join("; "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch system data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    auditLogs,
    isLoading,
    error,
    refetch: fetchData,
  };
}
