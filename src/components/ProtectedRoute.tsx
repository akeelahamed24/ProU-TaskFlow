import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, appUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
        return;
      }

      // Check role-based access if requiredRole is specified
      if (requiredRole && appUser?.role !== requiredRole) {
        if (appUser?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
        return;
      }
    }
  }, [user, loading, appUser, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role-based access
  if (requiredRole && appUser?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
