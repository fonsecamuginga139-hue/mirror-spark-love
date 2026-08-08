import { createFileRoute } from "@tanstack/react-router";

import RecorrentesPage from "@/pages/RecorrentesPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/recurring")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <RecorrentesPage />
    </ProtectedRoute>
  );
}
