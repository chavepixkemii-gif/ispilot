import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Clock, ClipboardCheck, Star, Timer, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ispilot/app-shell";
import { StatCard } from "@/components/ispilot/stat-card";
import { PERIODS, metricsFor, type PeriodId } from "@/lib/support";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtividade")({
  head: () => ({
    meta: [
      { title: "Produtividade do atendimento — ISPilot" },
      {
        name: "description",
        content: "KPIs da equipe de atendimento: TME, TMA, resolução no N1 e desempenho individual por período.",
      },
      { property: "og:title", content: "Produtividade do atendimento — ISPilot" },
      {
        property: "og:description",
        content: "Relatórios de chamados, ordens de serviço e avaliação dos clientes por atendente.",
      },
    ],
  }),
  component: ProdutividadePage,
});

function ProdutividadePage() {
  const [period, setPeriod] = useState<PeriodId>("hoje");
  const metrics = metricsFor(period);

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Produtividade & métricas"
        description="Desempenho do atendimento por período, com auditoria individual da equipe."
      />

      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-wrap items-end gap-2">
          {PERIODS.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={period === item.id ? "hero" : "outline"}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </Button>
          ))}
          {period === "custom" ? (
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">De</Label>
                <Input type="date" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Até</Label>
                <Input type="date" className="h-8 text-xs" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Chamados atendidos" value={metrics.handled.toLocaleString("pt-BR")} hint="Total no período" />
          <StatCard icon={Clock} label="Tempo médio de espera (TME)" value={metrics.tme} hint="Fila geral" />
          <StatCard icon={Timer} label="Tempo médio de atendimento (TMA)" value={metrics.tma} hint="Por conversa" />
          <StatCard icon={ClipboardCheck} label="Resolução no N1" value={`${metrics.n1Rate}%`} hint="Sem necessidade de O.S." />
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <p className="mb-3 text-xs font-semibold text-foreground">Atendimentos x ordens de serviço</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
                <ReTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="atendimentos" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="os" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold text-foreground">Desempenho por atendente</p>
            <Badge variant="outline" className="text-[10px]">
              {metrics.agents.length} colaboradores
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Funcionário</TableHead>
                <TableHead className="text-xs">Setor</TableHead>
                <TableHead className="text-xs">Atendimentos concluídos</TableHead>
                <TableHead className="text-xs">O.S. geradas</TableHead>
                <TableHead className="text-xs">Avaliação média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="text-xs font-medium text-foreground">{agent.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{agent.sector}</TableCell>
                  <TableCell className="font-mono text-xs">{agent.handled}</TableCell>
                  <TableCell className="font-mono text-xs">{agent.orders}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "flex items-center gap-1 font-mono text-xs",
                        agent.rating >= 4.7 ? "text-emerald-400" : "text-amber-400",
                      )}
                    >
                      <Star className="size-3" />
                      {agent.rating.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
