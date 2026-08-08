import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scan/history")({
  beforeLoad: () => {
    throw redirect({ to: "/scan", replace: true });
  },
});
