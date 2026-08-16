import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Command,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  Network,
  PanelsTopLeft,
  Sparkle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ispilot/logo";
import { NocCommandBar } from "@/components/ispilot/noc-command-bar";
import { toggleSidebarCollapsed, useSidebarCollapsed } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; icon: LucideIcon };

const primaryNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Assistente IA", to: "/assistente", icon: Sparkle },
  { label: "Atendimentos", to: "/atendimentos", icon: Inbox },
  { label: "Clientes", to: "/clientes", icon: Users },
  { label: "Funil UNM2000", to: "/unm2000-funil", icon: Network },
  { label: "Respostas Rápidas", to: "/respostas-rapidas", icon: MessageSquarePlus },
];

const secondaryNav: NavItem[] = [
  { label: "Produtividade", to: "/produtividade", icon: BarChart3 },
];

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return null;

      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, phone, job_title, avatar_url, company_id")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      const { data: company } = profile
        ? await supabase
            .from("companies")
            .select("id, name, slug, plan, logo_url")
            .eq("id", profile.company_id)
            .maybeSingle()
        : { data: null };

      return {
        profile: profile ?? null,
        company: company ?? null,
        roles: (roles ?? []).map((row) => row.role),
      };
    },
    staleTime: 30_000,
  });
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);

  const link = (
    <Link
      to={item.to}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active ? (
        <motion.span
          layoutId="nav-active"
          className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary"
        />
      ) : null}
      <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useSidebarCollapsed();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useWorkspace();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (data?.profile?.full_name ?? data?.profile?.email ?? "IS")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <NocCommandBar />
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex",
          collapsed ? "w-[68px]" : "w-[248px]",
        )}
      >
        <div className={cn("flex h-14 items-center px-3", collapsed && "justify-center px-0")}>
          <Logo to="/dashboard" withWordmark={!collapsed} subtitle="Operational AI" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {!collapsed ? (
            <p className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
              Operação
            </p>
          ) : (
            <div className="h-3" />
          )}
          {primaryNav.map((item) => (
            <NavLink key={item.to} item={item} collapsed={collapsed} />
          ))}

          {!collapsed ? (
            <p className="px-2.5 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
              Workspace
            </p>
          ) : (
            <div className="h-4" />
          )}
          {secondaryNav.map((item) => (
            <NavLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-1.5 py-1.5",
              collapsed && "justify-center px-0",
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-[11px] font-bold text-primary-foreground">
              {initials}
            </span>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <Skeleton className="h-3.5 w-24" />
                ) : (
                  <p className="truncate text-xs font-semibold text-foreground">
                    {data?.profile?.full_name ?? "Usuário"}
                  </p>
                )}
                <p className="truncate text-[11px] text-muted-foreground">
                  {data?.company?.name ?? "Provedor"}
                </p>
              </div>
            ) : null}
            {!collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={handleSignOut} aria-label="Sair">
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSidebarCollapsed()}
            className={cn("mt-1 w-full justify-start text-muted-foreground", collapsed && "justify-center")}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed ? <span className="text-xs">Recolher menu</span> : null}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Logo to="/dashboard" />
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <Building2 className="size-3.5" />
            <span className="font-medium text-foreground">{data?.company?.name ?? "Provedor"}</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider">
              {data?.company?.plan ?? "trial"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs text-muted-foreground lg:flex">
              <Command className="size-3.5" />
              <span>Copiloto sempre ativo</span>
            </div>
            <Button asChild variant="hero" size="sm">
              <Link to="/assistente">
                <Sparkle className="size-4" />
                Perguntar à IA
              </Link>
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {[...primaryNav, ...secondaryNav].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon: Icon = PanelsTopLeft,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 place-items-center rounded-xl border border-border bg-secondary/50 text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}