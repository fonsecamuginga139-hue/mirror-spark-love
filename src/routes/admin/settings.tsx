import { createFileRoute } from "@tanstack/react-router";

import AdminSettingsPage from "@/pages/AdminSettingsPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/settings")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <AdminSettingsPage />
    </ProtectedRoute>
  );
}
