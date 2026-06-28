import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/user";

export const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        <div className="inline-flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-gold" /> Loading NoraPlus...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
