import { createFileRoute } from "@tanstack/react-router";

import CategoriaDetailPage from "@/pages/CategoriaDetailPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/categoria/$id")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <CategoriaDetailPage />
    </ProtectedRoute>
  );
}
