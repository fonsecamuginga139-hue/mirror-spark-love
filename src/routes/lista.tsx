import { createFileRoute } from "@tanstack/react-router";

import ListaPage from "@/pages/ListaPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/lista")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <ListaPage />
    </ProtectedRoute>
  );
}
