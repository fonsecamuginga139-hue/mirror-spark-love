import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound - Redirects all 404 routes to the appropriate page
 * No 404 page is shown - automatic redirect based on auth state
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("Redirect: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Always redirect to root, which will handle proper routing via AuthRoute
  return <Navigate to="/" replace />;
};

export default NotFound;
