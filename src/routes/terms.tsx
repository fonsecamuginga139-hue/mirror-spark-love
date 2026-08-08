import { createFileRoute } from "@tanstack/react-router";

import TermsPage from "@/pages/TermsPage";

export const Route = createFileRoute("/terms")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TermsPage />
  );
}
