import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "@/lib/authSession";

/**
 * Route guard: unauthenticated visitors are sent to /login and brought back
 * to the page they tried to open after signing in (via the `next` query
 * param, which Login reads). Only internal paths are allowed as targets.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!getAuthToken()) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
