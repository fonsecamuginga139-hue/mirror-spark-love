import { createFileRoute } from "@tanstack/react-router";

import BuscaPage from "@/pages/BuscaPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/busca")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <BuscaPage />
    </ProtectedRoute>
  );
}
