import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "letmein"; // Change this to something secure in production

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const pw = window.prompt("Enter admin password:");
      if (pw === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      } else if (pw !== null) {
        window.alert("Incorrect password");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // Still checking authentication
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}
