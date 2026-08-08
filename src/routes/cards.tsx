import { createFileRoute } from "@tanstack/react-router";

import CartoesPage from "@/pages/CartoesPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/cards")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <CartoesPage />
    </ProtectedRoute>
  );
}
