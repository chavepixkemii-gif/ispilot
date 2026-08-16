import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/ispilot/app-shell";
import { Logo } from "@/components/ispilot/logo";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Logo size={40} withWordmark={false} />
          <p className="text-xs text-muted-foreground">Carregando seu ambiente…</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}