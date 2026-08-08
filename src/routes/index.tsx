import { createFileRoute } from "@tanstack/react-router";

import AuthRoute from "@/components/AuthRoute";

export const Route = createFileRoute("/")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthRoute />
  );
}
