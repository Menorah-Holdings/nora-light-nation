import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from "lucide-react";
import hero from "@/assets/hero-worship.jpg";
import { authApi, AuthClientError } from "@/lib/api/auth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing a token. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/auth", { replace: true }), 1400);
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-background/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Account recovery</p>
            <h1 className="mt-4 font-display text-4xl leading-tight max-w-md">Choose a new password and return to NoraPlus.</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo /></div>
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-gradient/20 ring-1 ring-red/30">
            <KeyRound className="h-5 w-5 text-gold" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold text-center">Reset password</p>
          <h2 className="mt-3 text-center font-display text-3xl">Create a new password</h2>

          {success ? (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">Your password has been updated. Taking you back to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-xs text-red-soft">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient py-3 text-sm font-medium text-primary-foreground shadow-red-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update password <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="inline-flex items-center gap-1.5 text-gold hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
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

export default ResetPassword;
