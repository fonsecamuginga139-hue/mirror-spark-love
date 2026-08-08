import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/recorrentes")({
  beforeLoad: () => {
    throw redirect({ to: "/recurring", replace: true });
  },
});
