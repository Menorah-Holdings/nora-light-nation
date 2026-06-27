import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-worship.jpg";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      navigate("/welcome", { state: { fullName: fullName || "Friend" } });
    } else {
      navigate("/app");
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
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Light for Every Nation</p>
            <h1 className="mt-4 font-display text-4xl leading-tight max-w-md">A trusted home for the content that shapes your faith.</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 md:p-16 bg-background">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo /></div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{mode === "signin" ? "Welcome back" : "Join Nora"}</p>
          <h2 className="mt-3 font-display text-3xl">{mode === "signin" ? "Sign in to continue" : "Create your account"}</h2>

          <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Full name</label>
                <input className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input type="email" className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold" placeholder="you@nora.tv" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Password</label>
                {mode === "signin" && (
                  <Link to="/forgot-password" className="text-xs text-gold hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input type="password" className="mt-1 w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold" placeholder="••••••••" />
            </div>
            <Link to="/app" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient py-3 text-sm font-medium text-primary-foreground shadow-red-glow">
              {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
            </Link>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="rounded-lg border border-border py-2.5 text-sm hover:border-gold/40">Google</button>
            <button className="rounded-lg border border-border py-2.5 text-sm hover:border-gold/40">Apple</button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Nora?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
