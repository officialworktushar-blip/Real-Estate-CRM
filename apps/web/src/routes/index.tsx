import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { HomeRedirect } from "./HomeRedirect";
import { PageLoader } from "@/components/common/PageLoader";

const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/auth/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const AuthCallbackPage = lazy(() =>
  import("@/pages/auth/AuthCallbackPage").then((m) => ({
    default: m.AuthCallbackPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const LeadsPage = lazy(() =>
  import("@/pages/dashboard/LeadsPage").then((m) => ({ default: m.LeadsPage }))
);
const PropertiesPage = lazy(() =>
  import("@/pages/dashboard/PropertiesPage").then((m) => ({
    default: m.PropertiesPage,
  }))
);
const ClientsPage = lazy(() =>
  import("@/pages/dashboard/ClientsPage").then((m) => ({
    default: m.ClientsPage,
  }))
);
const DealsPage = lazy(() =>
  import("@/pages/dashboard/DealsPage").then((m) => ({ default: m.DealsPage }))
);
const CalendarPage = lazy(() =>
  import("@/pages/dashboard/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  }))
);
const ReportsPage = lazy(() =>
  import("@/pages/dashboard/ReportsPage").then((m) => ({
    default: m.ReportsPage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/dashboard/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const UsersPage = lazy(() =>
  import("@/pages/admin/UsersPage").then((m) => ({ default: m.UsersPage }))
);
const SystemSettingsPage = lazy(() =>
  import("@/pages/admin/SystemSettingsPage").then((m) => ({
    default: m.SystemSettingsPage,
  }))
);
const AuditLogsPage = lazy(() =>
  import("@/pages/admin/AuditLogsPage").then((m) => ({
    default: m.AuditLogsPage,
  }))
);

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthLayout />
          </Suspense>
        }
      >
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        path="/auth/callback"
        element={
          <Suspense fallback={<PageLoader />}>
            <AuthCallbackPage />
          </Suspense>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="leads"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeadsPage />
            </Suspense>
          }
        />
        <Route
          path="properties"
          element={
            <Suspense fallback={<PageLoader />}>
              <PropertiesPage />
            </Suspense>
          }
        />
        <Route
          path="clients"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientsPage />
            </Suspense>
          }
        />
        <Route
          path="deals"
          element={
            <Suspense fallback={<PageLoader />}>
              <DealsPage />
            </Suspense>
          }
        />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<PageLoader />}>
              <CalendarPage />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SystemSettingsPage />
            </Suspense>
          }
        />
        <Route
          path="audit-logs"
          element={
            <Suspense fallback={<PageLoader />}>
              <AuditLogsPage />
            </Suspense>
          }
        />
      </Route>

      <Route path="/" element={<HomeRedirect />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
