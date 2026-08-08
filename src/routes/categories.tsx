import { createFileRoute } from "@tanstack/react-router";

import CategoriasPage from "@/pages/CategoriasPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/categories")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <CategoriasPage />
    </ProtectedRoute>
  );
}
