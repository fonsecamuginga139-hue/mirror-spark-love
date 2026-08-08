import { createFileRoute } from "@tanstack/react-router";

import SuportePage from "@/pages/SuportePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/support")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <SuportePage />
    </ProtectedRoute>
  );
}
