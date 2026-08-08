import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fundo")({
  beforeLoad: () => {
    throw redirect({ to: "/emergency", replace: true });
  },
});
