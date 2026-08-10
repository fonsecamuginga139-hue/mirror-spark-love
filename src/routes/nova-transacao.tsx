import { createFileRoute } from "@tanstack/react-router";

import NovaTransacaoPage from "@/pages/NovaTransacaoPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/nova-transacao")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <NovaTransacaoPage />
    </ProtectedRoute>
  );
}
