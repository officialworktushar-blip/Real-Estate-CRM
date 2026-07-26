import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

type SettingsTab = "profile" | "notifications" | "security" | "account";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "account", label: "Account", icon: <Building className="h-4 w-4" /> },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Thompson",
    email: "alex.thompson@oryntal.com",
    phone: "(310) 555-0100",
    company: "Oryntal Estate",
    website: "www.oryntal.com",
    location: "Los Angeles, CA",
    bio: "Real estate professional with 10+ years of experience in residential and commercial properties.",
  });

  const [notifications, setNotifications] = useState({
    emailLeads: true,
    emailDeals: true,
    emailReports: false,
    pushLeads: true,
    pushDeals: false,
    pushCalendar: true,
    smsLeads: false,
    smsUrgent: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Settings</h1>
          <p className="text-sm text-dark-400 mt-1">Manage your account preferences</p>
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
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Personal Information</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gold-500/10 flex items-center justify-center text-2xl font-bold text-gold-400">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </div>
                      <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-100">{profile.firstName} {profile.lastName}</p>
                      <p className="text-xs text-dark-400">{profile.email}</p>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                    <Input label="Last Name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                    <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    <Input label="Company" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                    <Input label="Website" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                    <div className="sm:col-span-2">
                      <Input label="Location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-dark-200">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="block w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-100 shadow-sm placeholder:text-dark-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Email Notifications</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "emailLeads" as const, label: "New Lead Assigned", desc: "Get notified when a new lead is assigned to you" },
                    { key: "emailDeals" as const, label: "Deal Updates", desc: "Receive updates when deal stages change" },
                    { key: "emailReports" as const, label: "Weekly Reports", desc: "Get a weekly performance summary" },
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Push Notifications</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "pushLeads" as const, label: "New Lead Assigned", desc: "Push notification for new leads" },
                    { key: "pushDeals" as const, label: "Deal Updates", desc: "Push notification for deal changes" },
                    { key: "pushCalendar" as const, label: "Calendar Reminders", desc: "Reminders for upcoming events" },
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">SMS Notifications</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "smsLeads" as const, label: "New Lead Assigned", desc: "SMS notification for new leads" },
                    { key: "smsUrgent" as const, label: "Urgent Alerts", desc: "Critical notifications via SMS" },
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
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "security" && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Change Password</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Current Password" type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                  <Input label="New Password" type={showPassword ? "text" : "password"} placeholder="Enter new password" />
                  <Input label="Confirm New Password" type={showPassword ? "text" : "password"} placeholder="Confirm new password" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPassword ? "Hide" : "Show"} passwords
                    </button>
                  </div>
                  <Button variant="secondary">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Two-Factor Authentication</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-dark-200">Add an extra layer of security to your account</p>
                      <p className="text-xs text-dark-400 mt-1">Currently disabled</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Active Sessions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: "MacBook Pro - Chrome", location: "Los Angeles, CA", current: true, lastActive: "Now" },
                    { device: "iPhone 15 Pro - Safari", location: "Los Angeles, CA", current: false, lastActive: "2 hours ago" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-dark-700 flex items-center justify-center">
                          {session.device.includes("iPhone") ? (
                            <Phone className="h-4 w-4 text-dark-400" />
                          ) : (
                            <Building className="h-4 w-4 text-dark-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-100">
                            {session.device}
                            {session.current && <Badge variant="success">Current</Badge>}
                          </p>
                          <p className="text-xs text-dark-400">{session.location} · {session.lastActive}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "account" && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Subscription</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-dark-700/30 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-dark-100">Professional Plan</p>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="text-xs text-dark-400 mt-1">$49/month · Renews Aug 1, 2026</p>
                    </div>
                    <Button variant="secondary" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-dark-100">Danger Zone</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-dark-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-dark-100">Sign Out</p>
                      <p className="text-xs text-dark-400">Sign out from all devices</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                    <div>
                      <p className="text-sm font-medium text-red-400">Delete Account</p>
                      <p className="text-xs text-dark-400">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
