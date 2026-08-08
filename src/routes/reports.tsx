import { createFileRoute } from "@tanstack/react-router";

import RelatoriosPage from "@/pages/RelatoriosPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/reports")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <RelatoriosPage />
    </ProtectedRoute>
  );
}
