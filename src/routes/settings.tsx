import { createFileRoute } from "@tanstack/react-router";

import PerfilPage from "@/pages/PerfilPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <PerfilPage />
    </ProtectedRoute>
  );
}
