import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAdmin = useQuery(api.auth.isAdmin);
  const { signIn } = useAuthActions();

  // Show loading while checking admin status
  if (isAdmin === undefined) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "40px",
        fontFamily: "Georgia, serif",
        color: "#666"
      }}>
        Checking permissions...
      </div>
    );
  }

  // If not admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // If admin, render the protected content
  return <>{children}</>;
} 