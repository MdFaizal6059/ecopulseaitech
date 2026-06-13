import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · EcoPulse AI" },
      { name: "description", content: "Sign in or create an EcoPulse AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("🌱");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setPendingEmail(email.trim());
        toast.error("Email not verified", { description: "We sent a new verification link." });
        await supabase.auth.resend({ type: "signup", email: email.trim() });
        return;
      }
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    toast.success("Welcome back 🌱");
    navigate({ to: "/" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { full_name: fullName.trim(), avatar, bio: bio.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    // No session yet because email verification is required
    if (!data.session) {
      setPendingEmail(email.trim());
      toast.success("Check your inbox", { description: "We sent a verification link." });
      return;
    }
    toast.success("Account created");
    navigate({ to: "/" });
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    setResending(false);
    if (error) toast.error("Couldn't resend", { description: error.message });
    else toast.success("Verification email sent");
  };

  const avatars = ["🌱", "🌿", "🌍", "🦊", "🐼", "🌸", "🦋", "🌟", "⚡", "🌊"];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0B132B] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-emerald-950/40 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground">EcoPulse AI</div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-400/70">
              Carbon awareness platform
            </div>
          </div>
        </div>

        {pendingEmail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200">
              <MailCheck className="h-5 w-5 shrink-0" />
              <div className="text-sm">Verify your email to continue</div>
            </div>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{pendingEmail}</span>. Click it, then
              come back here and sign in. Check your spam folder if you don't see it.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={resend}
                disabled={resending}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend email"}
              </Button>
              <Button
                onClick={() => {
                  setPendingEmail(null);
                  setTab("signin");
                }}
                variant="outline"
                className="border-white/15 bg-white/5"
              >
                Sign in instead
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="mt-6 space-y-4">
                <Field
                  id="si-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
                <Field
                  id="si-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-6 space-y-4">
                <Field
                  id="su-name"
                  label="Full name"
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  required
                  placeholder="Ada Lovelace"
                />
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">
                    Pick an avatar
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {avatars.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAvatar(a)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${avatar === a ? "border-emerald-400 bg-emerald-400/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  id="su-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
                <Field
                  id="su-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
                <Field
                  id="su-bio"
                  label="Short bio (optional)"
                  type="text"
                  value={bio}
                  onChange={setBio}
                  placeholder="Climate-curious dev"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  We'll send a verification email before you can sign in. We don't sell your data.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">
            Trouble signing in?
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type,
  required,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="bg-white/5"
      />
    </div>
  );
}
