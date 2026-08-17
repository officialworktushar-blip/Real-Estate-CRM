import { useState } from "react";
import {
  Save,
  Globe,
  Mail,
  Shield,
  Database,
  Bell,
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Server,
  Lock,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";

type SettingsTab = "general" | "security" | "notifications" | "integrations";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Globe className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "integrations", label: "Integrations", icon: <Webhook className="h-4 w-4" /> },
];

export function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    platformName: "Oryntal Estate",
    supportEmail: "support@oryntal.com",
    defaultCurrency: "USD",
    timezone: "America/Los_Angeles",
    maintenanceMode: false,
    allowRegistration: true,
    defaultTrialDays: 14,
  });

  const [security, setSecurity] = useState({
    requireEmailVerification: true,
    enforce2FA: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    allowOAuth: true,
  });

  const [notifications, setNotifications] = useState({
    emailOnNewUser: true,
    emailOnSubscription: true,
    emailOnPaymentFailed: true,
    emailOnTrialExpiring: true,
    slackWebhook: "",
    dailyDigest: true,
  });

  const [integrations, setIntegrations] = useState({
    googleMapsKey: "AIza••••••••••••••••",
    sendgridKey: "SG.••••••••••••••••",
    supabaseUrl: "https://••••••••.supabase.co",
    supabaseAnonKey: "eyJ••••••••••••••••",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">System Settings</h1>
          <p className="text-sm text-dark-400 mt-1">Configure platform-wide settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-dark-800 text-gold-400 border border-dark-700"
                    : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-dark-100">General Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Platform Name" value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
                  <Input label="Support Email" type="email" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark-200">Default Currency</label>
                    <select
                      value={general.defaultCurrency}
                      onChange={(e) => setGeneral({ ...general, defaultCurrency: e.target.value })}
                      className="block w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-100 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <Input label="Trial Period (days)" type="number" value={general.defaultTrialDays.toString()} onChange={(e) => setGeneral({ ...general, defaultTrialDays: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="space-y-3 pt-4 border-t border-dark-700">
                  {[
                    { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Put the platform in maintenance mode" },
                    { key: "allowRegistration" as const, label: "Allow Registration", desc: "Allow new users to register" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-dark-100">{item.label}</p>
                        <p className="text-xs text-dark-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setGeneral({ ...general, [item.key]: !general[item.key] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          general[item.key] ? "bg-gold-500" : "bg-dark-600"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          general[item.key] ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-dark-100">Security Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Session Timeout (minutes)" type="number" value={security.sessionTimeout.toString()} onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 0 })} />
                  <Input label="Max Login Attempts" type="number" value={security.maxLoginAttempts.toString()} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) || 0 })} />
                  <Input label="Min Password Length" type="number" value={security.passwordMinLength.toString()} onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="space-y-3 pt-4 border-t border-dark-700">
                  {[
                    { key: "requireEmailVerification" as const, label: "Require Email Verification", desc: "Users must verify email before accessing the platform" },
                    { key: "enforce2FA" as const, label: "Enforce 2FA", desc: "Require two-factor authentication for all users" },
                    { key: "allowOAuth" as const, label: "Allow OAuth Login", desc: "Allow Google/GitHub OAuth authentication" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-dark-100">{item.label}</p>
                        <p className="text-xs text-dark-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setSecurity({ ...security, [item.key]: !security[item.key] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          security[item.key] ? "bg-gold-500" : "bg-dark-600"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          security[item.key] ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-dark-100">Admin Notifications</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { key: "emailOnNewUser" as const, label: "New User Registration", desc: "Get notified when a new user signs up" },
                    { key: "emailOnSubscription" as const, label: "Subscription Changes", desc: "Get notified on upgrades, downgrades, and cancellations" },
                    { key: "emailOnPaymentFailed" as const, label: "Payment Failures", desc: "Get notified when a payment fails" },
                    { key: "emailOnTrialExpiring" as const, label: "Trial Expiring", desc: "Get notified when trials are about to expire" },
                    { key: "dailyDigest" as const, label: "Daily Digest", desc: "Receive a daily summary of platform activity" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-dark-100">{item.label}</p>
                        <p className="text-xs text-dark-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[item.key] ? "bg-gold-500" : "bg-dark-600"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key] ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dark-700">
                  <Input label="Slack Webhook URL" value={notifications.slackWebhook} onChange={(e) => setNotifications({ ...notifications, slackWebhook: e.target.value })} placeholder="https://hooks.slack.com/services/..." />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-dark-100">API Keys & Integrations</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Google Maps API Key" value={integrations.googleMapsKey} onChange={(e) => setIntegrations({ ...integrations, googleMapsKey: e.target.value })} className="font-mono text-xs" />
                <Input label="SendGrid API Key" value={integrations.sendgridKey} onChange={(e) => setIntegrations({ ...integrations, sendgridKey: e.target.value })} className="font-mono text-xs" />
                <Input label="Supabase URL" value={integrations.supabaseUrl} onChange={(e) => setIntegrations({ ...integrations, supabaseUrl: e.target.value })} className="font-mono text-xs" />
                <Input label="Supabase Anon Key" value={integrations.supabaseAnonKey} onChange={(e) => setIntegrations({ ...integrations, supabaseAnonKey: e.target.value })} className="font-mono text-xs" />

                <div className="pt-4 border-t border-dark-700">
                  <h4 className="text-sm font-medium text-dark-200 mb-3">Connection Status</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Supabase", status: "connected" },
                      { name: "SendGrid", status: "connected" },
                      { name: "Google Maps", status: "error" },
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between py-2 px-3 bg-dark-700/30 rounded-lg">
                        <span className="text-sm text-dark-200">{service.name}</span>
                        <div className="flex items-center gap-1.5">
                          {service.status === "connected" ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-xs text-emerald-400">Connected</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                              <span className="text-xs text-red-400">Error</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
