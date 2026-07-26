import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { GuestGuard } from "./GuestGuard";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LeadsPage } from "@/pages/dashboard/LeadsPage";
import { PropertiesPage } from "@/pages/dashboard/PropertiesPage";
import { ClientsPage } from "@/pages/dashboard/ClientsPage";
import { DealsPage } from "@/pages/dashboard/DealsPage";
import { CalendarPage } from "@/pages/dashboard/CalendarPage";
import { ReportsPage } from "@/pages/dashboard/ReportsPage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { SubscriptionsPage } from "@/pages/admin/SubscriptionsPage";
import { SystemSettingsPage } from "@/pages/admin/SystemSettingsPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";
import { BillingPage } from "@/pages/admin/BillingPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route
          path="subscriptions"
          element={
            <GuestGuard>
              <SubscriptionsPage />
            </GuestGuard>
          }
        />
        <Route
          path="billing"
          element={
            <GuestGuard>
              <BillingPage />
            </GuestGuard>
          }
        />
        <Route path="settings" element={<SystemSettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
