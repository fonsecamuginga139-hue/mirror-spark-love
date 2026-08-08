import { createFileRoute } from "@tanstack/react-router";

import PlansPage from "@/pages/PlansPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/plans")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <PlansPage />
    </ProtectedRoute>
  );
}
