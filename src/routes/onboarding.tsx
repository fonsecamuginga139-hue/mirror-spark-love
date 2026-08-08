import { createFileRoute } from "@tanstack/react-router";

import OnboardingPage from "@/pages/OnboardingPage";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  );
}
