import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding", replace: true });
  },
});
