import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/transacoes")({
  beforeLoad: () => {
    throw redirect({ to: "/transactions", replace: true });
  },
});
