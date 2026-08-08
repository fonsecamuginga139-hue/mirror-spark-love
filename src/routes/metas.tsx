import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/metas")({
  beforeLoad: () => {
    throw redirect({ to: "/goals", replace: true });
  },
});
