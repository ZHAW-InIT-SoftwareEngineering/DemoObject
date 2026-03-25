import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { DemoSessionProvider } from "@/hooks";
import { Toaster } from "@/components/ui";

function RootLayout() {
  return (
    <DemoSessionProvider>
      <RootShell />
    </DemoSessionProvider>
  );
}

function RootShell() {
  return (
    <>
      <Toaster />
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
