import { createFileRoute } from "@tanstack/react-router";

import FundoPage from "@/pages/FundoPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/emergency")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <FundoPage />
    </ProtectedRoute>
  );
}
