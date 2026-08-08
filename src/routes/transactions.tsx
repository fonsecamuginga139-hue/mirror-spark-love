import { createFileRoute } from "@tanstack/react-router";

import HistoricoPage from "@/pages/HistoricoPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/transactions")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <HistoricoPage />
    </ProtectedRoute>
  );
}
