import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/select-currency")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding", replace: true });
  },
});
