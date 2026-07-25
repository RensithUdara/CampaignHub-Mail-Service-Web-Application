"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Cloud, Database, KeyRound, MailCheck, Save, Send, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ToastProvider";

type SettingsInfo = {
  smtpEmail: string | null;
  smtpConfigured: boolean;
  cloudinaryCloudName: string | null;
  cloudinaryConfigured: boolean;
  mongoConfigured: boolean;
};

type TestResult = { success: boolean; message: string } | null;

export default function SettingsPage() {
  const { showToast } = useToast();
  const [info, setInfo] = useState<SettingsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpAppPassword, setSmtpAppPassword] = useState("");
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpSaveError, setSmtpSaveError] = useState<string | null>(null);
  const [clearingSmtp, setClearingSmtp] = useState(false);
  const [confirmClearSmtpOpen, setConfirmClearSmtpOpen] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<TestResult>(null);

  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [savingCloudinary, setSavingCloudinary] = useState(false);
  const [cloudinarySaveError, setCloudinarySaveError] = useState<string | null>(null);
  const [clearingCloudinary, setClearingCloudinary] = useState(false);
  const [confirmClearCloudinaryOpen, setConfirmClearCloudinaryOpen] = useState(false);
  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<TestResult>(null);

  async function load() {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      setInfo(data);
      setSmtpEmail(data.smtpEmail ?? "");
      setCloudName(data.cloudinaryCloudName ?? "");
    } catch {
      showToast("Failed to load settings.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveSmtp(e: FormEvent) {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpSaveError(null);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtpEmail, smtpAppPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");
      setInfo(data);
      setSmtpAppPassword("");
      showToast("SMTP settings saved.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings.";
      setSmtpSaveError(message);
      showToast(message, "error");
    } finally {
      setSavingSmtp(false);
    }
  }

  async function handleClearSmtp() {
    setClearingSmtp(true);
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove credentials.");
      setInfo(data);
      setSmtpEmail("");
      setSmtpAppPassword("");
      setSmtpTestResult(null);
      showToast("SMTP credentials removed.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove credentials.", "error");
    } finally {
      setClearingSmtp(false);
      setConfirmClearSmtpOpen(false);
    }
  }

  async function handleTestSmtp() {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/settings/test", { method: "POST" });
      const data = await res.json();
      setSmtpTestResult(data);
      showToast(
        data.success ? "Test email sent. Check your inbox." : `Test failed: ${data.message}`,
        data.success ? "success" : "error"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to test connection.";
      setSmtpTestResult({ success: false, message });
      showToast(message, "error");
    } finally {
      setTestingSmtp(false);
    }
  }

  async function handleSaveCloudinary(e: FormEvent) {
    e.preventDefault();
    setSavingCloudinary(true);
    setCloudinarySaveError(null);
    setCloudinaryTestResult(null);
    try {
      const res = await fetch("/api/settings/cloudinary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloudName, apiKey, apiSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save Cloudinary settings.");
      setInfo(data);
      setApiKey("");
      setApiSecret("");
      showToast("Cloudinary settings saved.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save Cloudinary settings.";
      setCloudinarySaveError(message);
      showToast(message, "error");
    } finally {
      setSavingCloudinary(false);
    }
  }

  async function handleClearCloudinary() {
    setClearingCloudinary(true);
    try {
      const res = await fetch("/api/settings/cloudinary", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove Cloudinary credentials.");
      setInfo(data);
      setCloudName("");
      setApiKey("");
      setApiSecret("");
      setCloudinaryTestResult(null);
      showToast("Cloudinary credentials removed.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove Cloudinary credentials.", "error");
    } finally {
      setClearingCloudinary(false);
      setConfirmClearCloudinaryOpen(false);
    }
  }

  async function handleTestCloudinary() {
    setTestingCloudinary(true);
    setCloudinaryTestResult(null);
    try {
      const res = await fetch("/api/settings/cloudinary-test", { method: "POST" });
      const data = await res.json();
      setCloudinaryTestResult(data);
      showToast(
        data.success ? "Cloudinary connection verified." : `Test failed: ${data.message}`,
        data.success ? "success" : "error"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to test connection.";
      setCloudinaryTestResult({ success: false, message });
      showToast(message, "error");
    } finally {
      setTestingCloudinary(false);
    }
  }

  if (loading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div>
      <PageHeader
        kicker="Workspace setup"
        title="Settings"
        description="Connect the sending account, attachment storage, and database that power the local mail workflow."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="metric-card border-rose-100 bg-gradient-to-br from-white to-rose-50">
          <p className="text-xs font-black uppercase text-rose-700" style={{ letterSpacing: "0.06em" }}>SMTP</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{info?.smtpConfigured ? "On" : "Off"}</p>
          <p className="text-sm text-stone-500">sending account</p>
        </div>
        <div className="metric-card border-sky-100 bg-gradient-to-br from-white to-sky-50">
          <p className="text-xs font-black uppercase text-sky-700" style={{ letterSpacing: "0.06em" }}>Cloud</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{info?.cloudinaryConfigured ? "On" : "Off"}</p>
          <p className="text-sm text-stone-500">attachment storage</p>
        </div>
        <div className="metric-card border-violet-100 bg-gradient-to-br from-white to-violet-50">
          <p className="text-xs font-black uppercase text-violet-700" style={{ letterSpacing: "0.06em" }}>Database</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{info?.mongoConfigured ? "On" : "Off"}</p>
          <p className="text-sm text-stone-500">MongoDB link</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <SettingsPanel
            icon={<MailCheck className="h-5 w-5" />}
            title="Gmail SMTP"
            description="Used to send every outgoing email through your Gmail account."
            connected={!!info?.smtpConfigured}
          >
            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div>
                <label className="field-label">Gmail address</label>
                <input
                  required
                  type="email"
                  value={smtpEmail}
                  onChange={(e) => setSmtpEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="text-field"
                />
              </div>
              <div>
                <label className="field-label">App Password</label>
                <input
                  required
                  type="password"
                  autoComplete="off"
                  value={smtpAppPassword}
                  onChange={(e) => setSmtpAppPassword(e.target.value)}
                  placeholder={info?.smtpConfigured ? "Enter to replace the saved password" : "16-character app password"}
                  className="text-field"
                />
                <p className="field-hint">
                  Generate an app password from your Google account security settings. Credentials are saved to MongoDB and never shown again after saving.
                </p>
              </div>
              {smtpSaveError && <p className="text-sm font-medium text-red-700">{smtpSaveError}</p>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button type="submit" loading={savingSmtp}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={handleTestSmtp} loading={testingSmtp} disabled={!info?.smtpConfigured}>
                  <Send className="h-4 w-4" />
                  Test Connection
                </Button>
                {info?.smtpConfigured && (
                  <Button type="button" variant="ghost" className="ml-auto text-red-700 hover:bg-red-50" onClick={() => setConfirmClearSmtpOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </form>
            {smtpTestResult && <ResultMessage result={smtpTestResult} />}
          </SettingsPanel>

          <SettingsPanel
            icon={<Cloud className="h-5 w-5" />}
            title="Cloudinary"
            description="Stores persistent copies of attachments and saves links with send history."
            connected={!!info?.cloudinaryConfigured}
          >
            <form onSubmit={handleSaveCloudinary} className="space-y-4">
              <div>
                <label className="field-label">Cloud Name</label>
                <input required value={cloudName} onChange={(e) => setCloudName(e.target.value)} placeholder="your-cloud-name" className="text-field" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">API Key</label>
                  <input required type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={info?.cloudinaryConfigured ? "Enter to replace" : "123456789012345"} className="text-field" />
                </div>
                <div>
                  <label className="field-label">API Secret</label>
                  <input required type="password" autoComplete="off" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder={info?.cloudinaryConfigured ? "Enter to replace" : "your api secret"} className="text-field" />
                </div>
              </div>
              <p className="field-hint">Find these in your Cloudinary dashboard under Account Details.</p>
              {cloudinarySaveError && <p className="text-sm font-medium text-red-700">{cloudinarySaveError}</p>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button type="submit" loading={savingCloudinary}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={handleTestCloudinary} loading={testingCloudinary} disabled={!info?.cloudinaryConfigured}>
                  <Cloud className="h-4 w-4" />
                  Test Connection
                </Button>
                {info?.cloudinaryConfigured && (
                  <Button type="button" variant="ghost" className="ml-auto text-red-700 hover:bg-red-50" onClick={() => setConfirmClearCloudinaryOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </form>
            {cloudinaryTestResult && <ResultMessage result={cloudinaryTestResult} />}
          </SettingsPanel>
        </div>

        <aside className="space-y-4">
          <section className="surface p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-teal-100 text-teal-800" style={{ borderRadius: 8 }}>
                <Database className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-stone-950">MongoDB</h2>
                <p className="text-xs text-stone-500">Primary app database</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <span className="text-sm text-stone-500">Status</span>
              {info?.mongoConfigured ? <Badge tone="success">Configured</Badge> : <Badge tone="error">Not configured</Badge>}
            </div>
            <p className="mt-4 text-xs leading-5 text-stone-500">
              Set <code className="bg-stone-100 px-1 py-0.5">MONGODB_URI</code> in <code className="bg-stone-100 px-1 py-0.5">.env.local</code>, then restart the app.
            </p>
          </section>
          <section className="surface-muted p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <KeyRound className="h-4 w-4 text-teal-700" />
              Credential storage
            </div>
            <p className="text-sm leading-6 text-stone-600">
              SMTP and Cloudinary values are saved in the database. The environment file only needs MongoDB to let the app reach that database.
            </p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClearSmtpOpen}
        title="Remove SMTP credentials"
        message="This disconnects the Gmail account. You won't be able to send email until you reconnect."
        confirmLabel="Remove"
        onConfirm={handleClearSmtp}
        onCancel={() => setConfirmClearSmtpOpen(false)}
        loading={clearingSmtp}
      />

      <ConfirmDialog
        open={confirmClearCloudinaryOpen}
        title="Remove Cloudinary credentials"
        message="New attachments won't be uploaded to Cloudinary until you reconnect. Existing links in Send History keep working."
        confirmLabel="Remove"
        onConfirm={handleClearCloudinary}
        onCancel={() => setConfirmClearCloudinaryOpen(false)}
        loading={clearingCloudinary}
      />
    </div>
  );
}

function SettingsPanel({
  icon,
  title,
  description,
  connected,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  connected: boolean;
  children: ReactNode;
}) {
  return (
    <section className="surface p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-teal-100 text-teal-800" style={{ borderRadius: 8 }}>
            {icon}
          </span>
          <div>
            <h2 className="font-semibold text-stone-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
          </div>
        </div>
        {connected ? <Badge tone="success">Connected</Badge> : <Badge tone="error">Not connected</Badge>}
      </div>
      {children}
    </section>
  );
}

function ResultMessage({ result }: { result: Exclude<TestResult, null> }) {
  return (
    <p className={`mt-3 text-sm font-medium ${result.success ? "text-emerald-700" : "text-red-700"}`}>
      {result.message}
    </p>
  );
}
