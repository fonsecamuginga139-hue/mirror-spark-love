import { createFileRoute } from "@tanstack/react-router";

import MetasPage from "@/pages/MetasPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/goals")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MetasPage />
    </ProtectedRoute>
  );
}
