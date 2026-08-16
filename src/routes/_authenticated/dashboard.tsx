import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Clock,
  MessagesSquare,
  Sparkle,
  Stethoscope,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ispilot/app-shell";
import { StatCard } from "@/components/ispilot/stat-card";
import { EmptyState, ErrorState, SkeletonCards, SkeletonRows } from "@/components/ispilot/ui-states";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard operacional — ISPilot" },
      {
        name: "description",
        content: "Visão geral de atendimentos, diagnósticos e conhecimento do seu provedor.",
      },
      { property: "og:title", content: "Dashboard operacional — ISPilot" },
      {
        property: "og:description",
        content: "Indicadores de suporte, NOC e IA em um único painel.",
      },
    ],
  }),
  component: DashboardPage,
});

const quickActions = [
  {
    to: "/assistente" as const,
    icon: Sparkle,
    title: "Perguntar à IA",
    text: "Tire dúvidas técnicas com contexto do seu provedor.",
  },
  {
    to: "/assistente" as const,
    icon: Stethoscope,
    title: "Diagnosticar sinal",
    text: "Descreva RX, TX e status PON e receba causas prováveis.",
  },
  {
    to: "/assistente" as const,
    icon: BookOpen,
    title: "Padronizar atendimento",
    text: "Gere scripts de fala e procedimentos aprovados.",
  },
];

function DashboardPage() {
  const overview = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [conversations, messages, diagnostics, articles, recent, activity] = await Promise.all([
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("diagnostics").select("id, confidence, priority, created_at"),
        supabase.from("kb_articles").select("id", { count: "exact", head: true }),
        supabase
          .from("conversations")
          .select("id, title, model, updated_at")
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("activity_logs")
          .select("id, action, entity, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const diagnosticRows = diagnostics.data ?? [];
      const avgConfidence = diagnosticRows.length
        ? Math.round(
            (diagnosticRows.reduce((sum, row) => sum + (row.confidence ?? 0), 0) /
              diagnosticRows.length) *
              100,
          ) / 100
        : 0;

      const days = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
        const label = date.toLocaleDateString("pt-BR", { weekday: "short" });
        const count = diagnosticRows.filter(
          (row) => new Date(row.created_at).toDateString() === date.toDateString(),
        ).length;
        return { label, diagnosticos: count };
      });

      return {
        conversations: conversations.count ?? 0,
        messages: messages.count ?? 0,
        diagnostics: diagnosticRows.length,
        articles: articles.count ?? 0,
        avgConfidence,
        recent: recent.data ?? [],
        activity: activity.data ?? [],
        series: days,
      };
    },
  });

  return (
    <div className="pb-14">
      <PageHeader
        icon={Activity}
        title="Visão operacional"
        description="Acompanhe o uso do copiloto, diagnósticos executados e o conhecimento consolidado da sua operação."
        actions={
          <Button asChild variant="hero" size="sm">
            <Link to="/assistente">
              <Sparkle className="size-4" />
              Nova conversa
            </Link>
          </Button>
        }
      />

      <div className="space-y-5 px-4 py-6 md:px-6">
        {overview.isError ? (
          <ErrorState
            description="Não conseguimos carregar seus indicadores agora."
            onRetry={() => void overview.refetch()}
          />
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {overview.isLoading ? (
                <SkeletonCards count={4} />
              ) : (
                <>
                  <StatCard
                    index={0}
                    label="Conversas com IA"
                    value={String(overview.data?.conversations ?? 0)}
                    icon={MessagesSquare}
                    hint="Total de conversas criadas pela equipe deste provedor."
                  />
                  <StatCard
                    index={1}
                    label="Mensagens (7 dias)"
                    value={String(overview.data?.messages ?? 0)}
                    icon={TrendingUp}
                    hint="Volume de interações na última semana."
                  />
                  <StatCard
                    index={2}
                    label="Diagnósticos"
                    value={String(overview.data?.diagnostics ?? 0)}
                    icon={Stethoscope}
                    hint="Análises de sinal e conectividade registradas."
                  />
                  <StatCard
                    index={3}
                    label="Artigos publicados"
                    value={String(overview.data?.articles ?? 0)}
                    icon={BookOpen}
                    hint="Procedimentos disponíveis na base de conhecimento."
                  />
                </>
              )}
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Link
                    to={action.to}
                    className="panel group flex h-full items-start gap-3 p-4 transition-colors hover:border-primary/30"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary/50 text-primary">
                      <action.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                        {action.title}
                        <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {action.text}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </section>

            <section className="grid gap-3 lg:grid-cols-5">
              <div className="panel p-5 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Diagnósticos nos últimos 7 dias
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Confiança média das análises: {overview.data?.avgConfidence ?? 0}
                    </p>
                  </div>
                  <Timer className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-5 h-52">
                  {overview.isLoading ? (
                    <SkeletonRows count={3} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.data?.series ?? []}>
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--color-border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                        />
                        <ChartTooltip
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 10,
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="diagnosticos"
                          stroke="var(--color-chart-1)"
                          strokeWidth={2}
                          fill="url(#areaFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="panel p-5 lg:col-span-2">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Conversas recentes
                </h2>
                <div className="mt-4">
                  {overview.isLoading ? (
                    <SkeletonRows count={4} />
                  ) : overview.data?.recent.length ? (
                    <ul className="space-y-1.5">
                      {overview.data.recent.map((conversation) => (
                        <li key={conversation.id}>
                          <Link
                            to="/assistente"
                            className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary/60"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-medium text-foreground">
                                {conversation.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {conversation.model ?? "IA"}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="size-3" />
                              {new Date(conversation.updated_at).toLocaleDateString("pt-BR")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      icon={MessagesSquare}
                      title="Nenhuma conversa ainda"
                      description="Comece perguntando algo ao copiloto para ver o histórico aqui."
                      action={
                        <Button asChild variant="soft" size="sm">
                          <Link to="/assistente">Abrir assistente</Link>
                        </Button>
                      }
                      className="border-0 bg-none p-0 py-8"
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="panel p-5">
              <h2 className="font-display text-sm font-semibold text-foreground">
                Atividade da equipe
              </h2>
              <div className="mt-4">
                {overview.isLoading ? (
                  <SkeletonRows count={3} />
                ) : overview.data?.activity.length ? (
                  <ul className="divide-y divide-border">
                    {overview.data.activity.map((log) => (
                      <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-xs text-foreground">
                          {log.action}
                          {log.entity ? (
                            <span className="text-muted-foreground"> · {log.entity}</span>
                          ) : null}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("pt-BR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Activity}
                    title="Sem atividades registradas"
                    description="As ações da sua equipe aparecerão aqui conforme o uso do ISPilot."
                    className="border-0 bg-none p-0 py-8"
                  />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}