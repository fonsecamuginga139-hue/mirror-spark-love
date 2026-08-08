import { createFileRoute } from "@tanstack/react-router";

import AdminSuportePage from "@/pages/AdminSuportePage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/support")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <AdminSuportePage />
    </ProtectedRoute>
  );
}
