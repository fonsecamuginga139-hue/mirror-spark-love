import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/futuras")({
  beforeLoad: () => {
    throw redirect({ to: "/future", replace: true });
  },
});
