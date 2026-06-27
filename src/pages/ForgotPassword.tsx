import { Link } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ArrowRight, Loader2, Mail, ArrowLeft } from "lucide-react";
import hero from "@/assets/hero-worship.jpg";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resentNotice, setResentNotice] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResentNotice(false);
    // Simulated secure reset request — replace with Supabase auth when ready.
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  const handleResend = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResentNotice(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img
          src={hero}
          alt="Worship gathering"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-background/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              Light for Every Nation
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight max-w-md">
              A trusted home for the content that shapes your faith.
            </h1>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 md:p-16 bg-background overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red/10 blur-[100px]" />

        <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card-gradient p-8 md:p-10 shadow-elegant">
          <div className="md:hidden mb-8">
            <Logo />
          </div>

          {!sent ? (
            <>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">
                Account recovery
              </p>
              <h2 className="mt-3 font-display text-3xl">Forgot Password</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Enter the email address linked to your NoraPlus account and we’ll
                send you a secure reset link.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full rounded-lg border border-border bg-secondary/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition"
                      placeholder="you@noraplus.io"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-xs text-red-soft">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient py-3 text-sm font-medium text-primary-foreground shadow-red-glow transition hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Your reset link will expire for your security.
              </p>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 text-gold hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-gradient/20 ring-1 ring-red/30">
                <Mail className="h-6 w-6 text-gold" />
              </div>
              <h2 className="mt-6 text-center font-display text-3xl">
                Check Your Email
              </h2>
              <p className="mt-3 text-center text-sm text-muted-foreground leading-relaxed">
                We’ve sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Follow the link to create a new password and return to NoraPlus.
              </p>

              {resentNotice && (
                <p className="mt-4 text-center text-xs text-gold">
                  Reset link resent successfully.
                </p>
              )}

              <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                  to="/auth"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient py-3 text-sm font-medium text-primary-foreground shadow-red-glow transition hover:shadow-glow"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-gold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Resend Email"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
