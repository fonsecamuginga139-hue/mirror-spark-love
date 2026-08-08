import { createFileRoute } from "@tanstack/react-router";

import SetupPage from "@/pages/SetupPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/setup")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <SetupPage />
    </ProtectedRoute>
  );
}
