import { createFileRoute } from "@tanstack/react-router";

import ScanPage from "@/pages/ScanPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/scan/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <ScanPage />
    </ProtectedRoute>
  );
}
