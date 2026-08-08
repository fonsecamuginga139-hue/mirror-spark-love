import { createFileRoute } from "@tanstack/react-router";

import LocaleSetupPage from "@/pages/LocaleSetupPage";

export const Route = createFileRoute("/locale-setup")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LocaleSetupPage />
  );
}
