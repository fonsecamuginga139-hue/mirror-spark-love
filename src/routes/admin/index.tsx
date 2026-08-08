import { createFileRoute } from "@tanstack/react-router";

import AdminPage from "@/pages/AdminPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
}
