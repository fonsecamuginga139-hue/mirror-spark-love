import { createFileRoute } from "@tanstack/react-router";

import PreOnboardingPage from "@/pages/PreOnboardingPage";

export const Route = createFileRoute("/pre-onboarding")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PreOnboardingPage />
  );
}
