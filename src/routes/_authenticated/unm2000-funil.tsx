import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Filter,
  Network,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Sparkle,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ispilot/app-shell";
import { FunnelConnector, FunnelStageCard, RouterGuide, ScopeBadge } from "@/components/ispilot/unm-funnel";
import {
  OLTS,
  PON_PORTS,
  ROUTER_MODELS,
  UNM_CASES,
  UNM_TOOLS,
  routerById,
  toneClasses,
} from "@/lib/unm2000";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/unm2000-funil")({
  head: () => ({
    meta: [
      { title: "Funil UNM2000 — descomplicação FiberHome | ISPilot" },
      {
        name: "description",
        content:
          "Funil visual de 5 camadas que traduz o UNM2000 (FiberHome) e a configuração de roteadores em passos simples de reparo.",
      },
      { property: "og:title", content: "Funil UNM2000 — descomplicação FiberHome | ISPilot" },
      {
        property: "og:description",
        content: "Diagnóstico guiado de OLT, PON, ONT, WAN e Wi-Fi com resumo por IA e passo a passo por modelo de roteador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UnmFunnelPage,
});

function UnmFunnelPage() {
  const [caseId, setCaseId] = useState(UNM_CASES[0]!.id);
  const active = UNM_CASES.find((item) => item.id === caseId) ?? UNM_CASES[0]!;

  const [oltId, setOltId] = useState(active.oltId);
  const [pon, setPon] = useState(active.pon);
  const [routerId, setRouterId] = useState(active.routerId);
  const [query, setQuery] = useState("");
  const [toolsOpen, setToolsOpen] = useState(true);
  const [pendingTool, setPendingTool] = useState<{ label: string; confirm: string; danger?: boolean } | null>(null);

  const router = routerById(routerId);
  const tone = toneClasses(active.overallTone);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return UNM_CASES;
    return UNM_CASES.filter((item) =>
      [item.customer, item.pppoe, item.ip, item.contract, item.serial].join(" ").toLowerCase().includes(term),
    );
  }, [query]);

  function selectCase(id: string) {
    const found = UNM_CASES.find((item) => item.id === id);
    if (!found) return;
    setCaseId(found.id);
    setOltId(found.oltId);
    setPon(found.pon);
    setRouterId(found.routerId);
  }

  return (
    <div>
      <PageHeader
        icon={Network}
        title="Hub UNM2000 & funil guiado de reparo"
        description="Traduzimos OLT, PON, ONT, autenticação e Wi-Fi em um funil de 5 camadas com passo a passo por modelo de roteador."
        actions={
          <Button variant="outline" size="sm" onClick={() => setToolsOpen((value) => !value)}>
            {toolsOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
            Ferramentas UNM
          </Button>
        }
      />

      <div className="border-b border-border bg-card/40 px-4 py-3 md:px-6">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">OLT & placa PON</Label>
            <div className="flex gap-2">
              <Select value={oltId} onValueChange={setOltId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OLTS.map((olt) => (
                    <SelectItem key={olt.id} value={olt.id} className="text-xs">
                      {olt.name} · {olt.cards}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={pon} onValueChange={setPon}>
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PON_PORTS.map((port) => (
                    <SelectItem key={port} value={port} className="text-xs">
                      {port}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1 lg:col-span-2">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Equipamento do cliente (nome, PPPoE, serial FSAN/MAC ou IP)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: joao.silva@net, FHTT2b1f04c9, 177.12.44.89"
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Roteador Wi-Fi do cliente</Label>
            <Select value={routerId} onValueChange={setRouterId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {ROUTER_MODELS.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.brand} {item.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Filter className="size-3" /> Casos monitorados
          </span>
          {matches.map((item) => {
            const itemTone = toneClasses(item.overallTone);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCase(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                  item.id === caseId
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", itemTone.dot)} />
                {item.customer}
                <span className="font-mono text-[10px] text-muted-foreground">{item.pppoe}</span>
              </button>
            );
          })}
          {matches.length === 0 ? (
            <span className="text-xs text-muted-foreground">Nenhum equipamento encontrado para “{query}”.</span>
          ) : null}
        </div>
      </div>

      <div className={cn("grid gap-4 p-4 md:p-6", toolsOpen ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "")}>
        <div className="min-w-0 space-y-4">
          <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{active.customer}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {active.contract} · {active.serial}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Reclamação: {active.complaint}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {OLTS.find((olt) => olt.id === oltId)?.name} · {pon}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {router.brand} {router.model} · {router.wanPort}
              </Badge>
              <Badge variant="outline" className={cn("gap-1.5 text-[10px] uppercase", tone.border, tone.text)}>
                <span className={cn("size-1.5 rounded-full", tone.dot)} />
                {tone.label}
              </Badge>
            </div>
          </div>

          <div>
            {active.stages.map((stage, index) => (
              <div key={stage.id}>
                <FunnelStageCard stage={stage} index={index} />
                {index < active.stages.length - 1 ? <FunnelConnector tone={active.stages[index + 1]!.tone} /> : null}
              </div>
            ))}
          </div>

          <div className="panel space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <Sparkle className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Resolução inteligente</p>
                  <p className="text-[11px] text-muted-foreground">Resumo humanizado dos dados brutos do UNM2000</p>
                </div>
              </div>
              <ScopeBadge scope={active.aiScope} />
            </div>

            <p className="rounded-xl border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-foreground">
              {active.aiSummary}
            </p>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-primary">Causa raiz</p>
              <p className="mt-1 text-xs text-foreground">{active.aiRootCause}</p>
            </div>

            <ul className="space-y-1.5">
              {active.aiActions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {action}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="hero"
                onClick={() => toast.success("Resumo copiado para o atendimento", { description: active.aiRootCause })}
              >
                <Sparkle className="size-4" />
                Enviar resumo ao atendimento
              </Button>
              {active.aiScope === "fibra" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success("Reparo de fibra agendado", {
                      description: "Equipe de rede externa notificada para refusão do splitter na CTO.",
                    })
                  }
                >
                  <CalendarClock className="size-4" />
                  Agendar reparo técnico de fibra
                </Button>
              ) : null}
            </div>
          </div>

          <RouterGuide steps={active.guide} routerLabel={`${router.brand} ${router.model} (${router.gateway} · app ${router.app})`} />
        </div>

        {toolsOpen ? (
          <aside className="panel h-fit space-y-4 p-4 xl:sticky xl:top-20">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Ferramentas nativas UNM2000</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ações de 1 clique com confirmação em tela, sem abrir a interface Java do NMS.
            </p>
            {UNM_TOOLS.map((group) => (
              <div key={group.group} className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">{group.group}</p>
                {group.tools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setPendingTool(tool)}
                    className={cn(
                      "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-left transition-colors hover:border-primary/40",
                      tool.danger && "hover:border-red-500/50",
                    )}
                  >
                    <p className={cn("text-xs font-semibold text-foreground", tool.danger && "text-red-400")}>{tool.label}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{tool.description}</p>
                  </button>
                ))}
              </div>
            ))}
          </aside>
        ) : null}
      </div>

      <AlertDialog open={pendingTool !== null} onOpenChange={(open) => !open && setPendingTool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">{pendingTool?.label}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">{pendingTool?.confirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs"
              onClick={() => {
                const label = pendingTool?.label ?? "Ação";
                setPendingTool(null);
                toast.success(`${label} executada no UNM2000`, {
                  description: `${active.customer} · ${OLTS.find((olt) => olt.id === oltId)?.name} ${pon}`,
                });
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}