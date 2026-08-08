import { createFileRoute } from "@tanstack/react-router";

import ParcelasPage from "@/pages/ParcelasPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/parcelas")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <ParcelasPage />
    </ProtectedRoute>
  );
}
