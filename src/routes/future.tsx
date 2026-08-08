import { createFileRoute } from "@tanstack/react-router";

import FuturasPage from "@/pages/FuturasPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/future")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <FuturasPage />
    </ProtectedRoute>
  );
}
