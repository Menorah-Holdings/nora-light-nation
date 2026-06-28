import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { ArrowRight, Loader2 } from "lucide-react";
import hero from "@/assets/hero-worship.jpg";
import { authApi, AuthClientError } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/queryKeys";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "verify">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const redirectTo = useMemo(() => searchParams.get("redirect") || "/app", [searchParams]);
  const isVerifying = mode === "verify";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode !== "verify" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (mode === "verify" && otp.trim().length < 4) {
      setError("Enter the verification code from your email.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await authApi.signUpEmail({ name: fullName.trim(), email: email.trim(), password });
        setMode("verify");
        setNotice("We sent a verification code to your email.");
        return;
      }

      if (mode === "verify") {
        await authApi.verifyEmailOtp({ email: email.trim(), otp: otp.trim() });
        await refreshAuthState();
        navigate("/welcome", { replace: true, state: { fullName: fullName || email } });
        return;
      }

      await authApi.signInEmail({ email: email.trim(), password });
      await refreshAuthState();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof AuthClientError && err.code === "EMAIL_NOT_VERIFIED") {
        setMode("verify");
        setNotice("Please verify your email before signing in. We can send a fresh code if needed.");
        return;
      }
      setError(toAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshAuthState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    ]);
  };

  const resendOtp = async () => {
    setError(null);
    setNotice(null);
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address first.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendVerificationOtp({ email: email.trim(), type: "email-verification" });
      setNotice("A new verification code has been sent.");
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "apple") => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const result = await authApi.signInSocial({
        provider,
        callbackURL: `${window.location.origin}${redirectTo}`,
        errorCallbackURL: `${window.location.origin}/auth`,
      });
      if (result.url) window.location.href = result.url;
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setNotice(null);
    setOtp("");
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-background/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Light for Every Nation</p>
            <h1 className="mt-4 font-display text-4xl leading-tight max-w-md">A trusted home for the content that shapes your faith.</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 md:p-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo /></div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            {isVerifying ? "Email verification" : mode === "signin" ? "Welcome back" : "Join NoraPlus"}
          </p>
          <h2 className="mt-3 font-display text-3xl">
            {isVerifying ? "Verify your email" : mode === "signin" ? "Sign in to continue" : "Create your account"}
          </h2>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="you@noraplus.io"
                autoComplete="email"
              />
            </div>
            {isVerifying ? (
              <div>
                <label className="text-xs text-muted-foreground">Verification code</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm tracking-[0.35em] focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Password</label>
                  {mode === "signin" && (
                    <Link to="/forgot-password" className="text-xs text-gold hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-soft">{error}</p>}
            {notice && <p className="text-xs text-gold">{notice}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient py-3 text-sm font-medium text-primary-foreground shadow-red-glow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isVerifying ? "Verify email" : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {isVerifying ? (
            <button onClick={resendOtp} disabled={loading} className="mt-4 w-full text-sm text-gold hover:underline disabled:opacity-60">
              Resend verification code
            </button>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => signInWithProvider("google")} disabled={loading} className="rounded-lg border border-border py-2.5 text-sm hover:border-gold/40 disabled:opacity-60">Google</button>
                <button type="button" onClick={() => signInWithProvider("apple")} disabled={loading} className="rounded-lg border border-border py-2.5 text-sm hover:border-gold/40 disabled:opacity-60">Apple</button>
              </div>
            </>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isVerifying ? "Already verified?" : mode === "signin" ? "New to NoraPlus?" : "Already have an account?"}{" "}
            <button onClick={toggleMode} className="text-gold hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

function toAuthErrorMessage(err: unknown): string {
  if (err instanceof AuthClientError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export default Auth;
