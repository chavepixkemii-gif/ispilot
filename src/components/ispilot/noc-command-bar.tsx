import { ClientOnly, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Filter,
  Gauge,
  Layers,
  Map as MapIcon,
  Radio,
  Search,
  Siren,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IncidentBoard } from "@/components/ispilot/incident-board";
import { DEFAULT_MAP_LAYERS, type MapLayers } from "@/components/ispilot/noc-map";
import { useIncidents } from "@/lib/incident-store";
import {
  CABLE_ROUTES,
  CTO_OPTIONS,
  CTOS,
  DISTRICTS,
  FIBER_BREAKS,
  HEALTH_LABEL,
  NET_CLIENTS,
  OLT_OPTIONS,
  PON_OPTIONS,
  POPS,
  SPLICE_BOXES,
  clientsWithoutSignal,
  opticalBudget,
  type Incident,
} from "@/lib/network";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CUSTOMERS } from "@/lib/customers";
import { cn } from "@/lib/utils";

const NocMap = lazy(() => import("@/components/ispilot/noc-map"));

/* ---------------------------------- Mapa NOC ---------------------------------- */

function NocMapDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_MAP_LAYERS);
  const [showFilters, setShowFilters] = useState(true);
  const { incidents } = useIncidents();

  const toggle = (key: keyof MapLayers) => (value: boolean) =>
    setLayers((current) => ({ ...current, [key]: value }));
  const select = (key: keyof MapLayers) => (value: string) =>
    setLayers((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none"
      >
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <DialogTitle className="flex items-center gap-2 font-display text-sm">
              <MapIcon className="size-4 text-primary" />
              Mapa geográfico da rede — NOC
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              {POPS.length} POPs/OLTs · {SPLICE_BOXES.length} caixas de emenda · {CTOS.length} CTOs ·{" "}
              {CABLE_ROUTES.length} rotas de cabo · {NET_CLIENTS.length} assinantes mapeados
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {FIBER_BREAKS.length > 0 ? (
              <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
                {FIBER_BREAKS.length} rompimento(s) de fibra
              </Badge>
            ) : null}
            <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
              {incidents.filter((incident) => incident.status !== "RESOLVIDO").length} incidentes ativos
            </Badge>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} aria-label="Fechar mapa">
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_380px]">
          <div className="relative min-h-[320px]">
            <ClientOnly fallback={<Skeleton className="size-full rounded-none" />}>
              <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
                <NocMap layers={layers} />
              </Suspense>
            </ClientOnly>

            <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2">
              <Button
                size="sm"
                variant="glass"
                className="pointer-events-auto w-fit"
                onClick={() => setShowFilters((value) => !value)}
              >
                <Filter className="size-4" />
                Camadas
              </Button>
              {showFilters ? (
                <div className="pointer-events-auto max-h-[calc(100dvh-160px)] w-[262px] space-y-2.5 overflow-y-auto rounded-xl border border-border bg-background/80 p-3 backdrop-blur-xl">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Layers className="size-3.5" /> Camadas geoespaciais
                  </p>
                  {(
                    [
                      ["pops", "POPs & OLTs"],
                      ["spliceBoxes", "Caixas de emenda (CE)"],
                      ["ctos", "CTOs"],
                      ["cableRoutes", "Rota de cabos"],
                      ["fiber", "Traçado de fibra"],
                      ["clients", "Clientes finais"],
                      ["breaks", "Rompimentos detectados"],
                      ["onlyFaulty", "Somente com defeito"],
                      ["noSignalOnly", "Somente clientes sem sinal"],
                    ] as Array<[keyof MapLayers, string]>
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Switch checked={Boolean(layers[key])} onCheckedChange={toggle(key)} />
                    </div>
                  ))}

                  <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Filtros avançados
                  </p>
                  {(
                    [
                      ["district", "Bairro / região", DISTRICTS],
                      ["olt", "OLT / POP", OLT_OPTIONS],
                      ["pon", "PON", PON_OPTIONS],
                      ["cto", "CTO específica", CTO_OPTIONS],
                    ] as Array<[keyof MapLayers, string, string[]]>
                  ).map(([key, label, options]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
                      <Select value={String(layers[key])} onValueChange={select(key)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-[11px]"
                    onClick={() => setLayers(DEFAULT_MAP_LAYERS)}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-xl border border-border bg-background/80 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-xl">
              {(["ok", "warn", "critical"] as const).map((health) => (
                <span key={health} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      health === "ok" ? "bg-emerald-500" : health === "warn" ? "bg-amber-500" : "bg-destructive",
                    )}
                  />
                  {HEALTH_LABEL[health]}
                </span>
              ))}
            </div>
          </div>

          <aside className="min-h-0 overflow-y-auto border-t border-border p-4 lg:border-l lg:border-t-0">
            <Tabs defaultValue="incidentes">
              <TabsList className="w-full">
                <TabsTrigger value="incidentes" className="flex-1 text-xs">
                  Incidentes
                </TabsTrigger>
                <TabsTrigger value="rede" className="flex-1 text-xs">
                  Rede & rompimentos
                </TabsTrigger>
                <TabsTrigger value="atenuacao" className="flex-1 text-xs">
                  Atenuação
                </TabsTrigger>
              </TabsList>
              <TabsContent value="incidentes" className="mt-4">
                <IncidentBoard />
              </TabsContent>
              <TabsContent value="rede" className="mt-4">
                <NetworkStatusPanel />
              </TabsContent>
              <TabsContent value="atenuacao" className="mt-4">
                <AttenuationPanel />
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- Medidor de sinal óptico -------------------------- */

function NetworkStatusPanel() {
  const noSignal = clientsWithoutSignal();
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-destructive">
          <AlertTriangle className="size-4" /> Rompimentos de fibra detectados
        </p>
        <div className="mt-2 space-y-2">
          {FIBER_BREAKS.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-background/50 p-2.5">
              <p className="text-[11px] font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                OTDR {item.otdrDistanceKm} km · {item.district} · {item.affected.toLocaleString("pt-BR")} clientes ·{" "}
                {item.detectedAt}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Ocupação das CTOs
        </p>
        <div className="mt-2 space-y-2">
          {CTOS.map((cto) => {
            const pct = Math.round((cto.usedPorts / cto.totalPorts) * 100);
            return (
              <div key={cto.id}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-foreground">{cto.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {cto.usedPorts}/{cto.totalPorts} · RX {cto.avgRx} dBm
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      cto.health === "ok" ? "bg-emerald-500" : cto.health === "warn" ? "bg-amber-500" : "bg-destructive",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Caixas de emenda (CE)
        </p>
        <div className="mt-2 space-y-1.5">
          {SPLICE_BOXES.map((box) => (
            <div key={box.id} className="flex items-start justify-between gap-2 text-[11px]">
              <span className="font-mono text-foreground">{box.name}</span>
              <span className="text-right text-muted-foreground">
                {box.fusionsUsed}/{box.fusionsTotal} fusões · {HEALTH_LABEL[box.health]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Clientes sem sinal ({noSignal.length})
        </p>
        <div className="mt-2 space-y-1.5">
          {noSignal.map((client) => (
            <div key={client.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate text-foreground">{client.name}</span>
              <span className="shrink-0 font-mono text-destructive">RX {client.rx} dBm</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AttenuationPanel() {
  const [form, setForm] = useState({ txPower: 3, distanceKm: 4.2, splitters: 1, fusions: 6, connectors: 4 });
  const result = opticalBudget(form);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Cálculo teórico de atenuação do enlace para comparar com a leitura real da ONT e identificar perda oculta no
        trajeto.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["txPower", "TX da OLT (dBm)", 0.1],
            ["distanceKm", "Distância (km)", 0.1],
            ["splitters", "Splitters (1:8)", 1],
            ["fusions", "Fusões", 1],
            ["connectors", "Conectores", 1],
          ] as Array<[keyof typeof form, string, number]>
        ).map(([key, label, step]) => (
          <div key={key} className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
            <Input
              type="number"
              step={step}
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
              className="h-8 font-mono text-xs"
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">RX teórico</span>
          <span
            className={cn(
              "font-mono text-base font-bold",
              result.tone === "ok" ? "text-emerald-400" : result.tone === "warn" ? "text-amber-400" : "text-destructive",
            )}
          >
            {result.rx.toFixed(2)} dBm
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Perda total -{result.total.toFixed(2)} dB · {HEALTH_LABEL[result.tone]}
        </p>
      </div>
    </div>
  );
}

function SignalMeterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState({ txPower: 3, distanceKm: 4.2, splitters: 1, fusions: 6, connectors: 4 });
  const result = opticalBudget(form);

  const field = (key: keyof typeof form, label: string, step = 1) => (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={step}
        value={form[key]}
        onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
        className="h-9 font-mono text-xs"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            Medidor de sinal óptico
          </DialogTitle>
          <DialogDescription>Calculadora rápida de atenuação do enlace GPON.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {field("txPower", "TX da OLT (dBm)", 0.1)}
          {field("distanceKm", "Distância (km)", 0.1)}
          {field("splitters", "Splitters (1:8)")}
          {field("fusions", "Fusões")}
          {field("connectors", "Conectores")}
        </div>

        <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3 text-xs">
          <div className="flex justify-between font-mono text-muted-foreground">
            <span>Fibra</span>
            <span>-{result.fiberLoss.toFixed(2)} dB</span>
          </div>
          <div className="flex justify-between font-mono text-muted-foreground">
            <span>Splitters</span>
            <span>-{result.splitterLoss.toFixed(2)} dB</span>
          </div>
          <div className="flex justify-between font-mono text-muted-foreground">
            <span>Fusões + conectores</span>
            <span>-{(result.fusionLoss + result.connectorLoss).toFixed(2)} dB</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">RX estimado</span>
            <span
              className={cn(
                "font-mono text-base font-bold",
                result.tone === "ok"
                  ? "text-emerald-400"
                  : result.tone === "warn"
                    ? "text-amber-400"
                    : "text-destructive",
              )}
            >
              {result.rx.toFixed(2)} dBm
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Perda total do enlace: -{result.total.toFixed(2)} dB · {HEALTH_LABEL[result.tone]}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Pesquisa global ------------------------------- */

function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const pool = [
      ...CUSTOMERS.map((customer) => ({
        id: customer.id,
        title: customer.name,
        hint: `${customer.document} · ${customer.pppoe} · ${customer.ip} · ${customer.contractId}`,
        kind: "Assinante",
      })),
      ...NET_CLIENTS.map((client) => ({
        id: client.id,
        title: client.name,
        hint: `${client.plan} · ${client.district} · RX ${client.rx} dBm`,
        kind: client.status,
      })),
      ...CTOS.map((cto) => ({
        id: cto.id,
        title: cto.name,
        hint: `${cto.pon} · ${cto.usedPorts}/${cto.totalPorts} portas · ${HEALTH_LABEL[cto.health]}`,
        kind: "CTO",
      })),
      ...POPS.map((pop) => ({ id: pop.id, title: pop.name, hint: pop.vendor, kind: "POP/OLT" })),
    ];
    if (!term) return pool.slice(0, 6);
    return pool.filter((item) => `${item.title} ${item.hint}`.toLowerCase().includes(term)).slice(0, 12);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Search className="size-4 text-primary" />
            Pesquisa global inteligente
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            Nome, CPF, IP, PPPoE, contrato, serial de ONT, CTO ou OLT.
          </DialogDescription>
        </DialogHeader>
        <div className="border-b border-border px-4 py-2">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar em toda a operação…"
            className="h-9 text-xs"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">Nenhum resultado encontrado.</p>
          ) : (
            results.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/clientes" });
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{item.hint}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {item.kind}
                </Badge>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Alerta rápido de incidente ------------------------ */

function QuickAlertDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addIncident } = useIncidents();
  const [form, setForm] = useState({
    scope: "OLT-CENTRO-01 · PON 0/1/5",
    district: "Centro",
    affected: 320,
    title: "ROMPIMENTO DE FIBRA - Av. São João",
  });

  function submit() {
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      type: "LINK LOSS",
      title: form.title.toUpperCase(),
      scope: form.scope,
      district: form.district,
      affected: Number(form.affected) || 0,
      severity: "critical",
      detectedAt: "agora",
      status: "EM ANÁLISE",
      notified: false,
    };
    addIncident(incident);
    onOpenChange(false);
    toast.success("Incidente registrado no painel do NOC");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Siren className="size-4 text-destructive" />
            Alerta rápido de incidente
          </DialogTitle>
          <DialogDescription>Registre manualmente uma quebra de fibra ou falha estrutural.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Título do evento</Label>
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Escopo (OLT / PON / CTO)
            </Label>
            <Input
              value={form.scope}
              onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}
              className="h-9 font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Bairro</Label>
              <Select
                value={form.district}
                onValueChange={(value) => setForm((current) => ({ ...current, district: value }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.filter((district) => district !== "Todos").map((district) => (
                    <SelectItem key={district} value={district} className="text-xs">
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Clientes impactados
              </Label>
              <Input
                type="number"
                value={form.affected}
                onChange={(event) => setForm((current) => ({ ...current, affected: Number(event.target.value) }))}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={submit}>
            <AlertTriangle className="size-4" />
            Registrar incidente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Command bar -------------------------------- */

export function NocCommandBar() {
  const [openMap, setOpenMap] = useState(false);
  const [openMeter, setOpenMeter] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const { incidents } = useIncidents();
  const activeCritical = incidents.filter(
    (incident) => incident.severity === "critical" && incident.status !== "RESOLVIDO",
  ).length;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && /^(INPUT|TEXTAREA)$/.test(target.tagName);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpenSearch(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-2.5 z-[60] flex justify-center px-3">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/80 bg-background/70 p-1 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <Button size="sm" variant="hero" className="rounded-full" onClick={() => setOpenMap(true)}>
            <MapIcon className="size-4" />
            <span className="hidden sm:inline">Mapa geográfico da rede (NOC)</span>
            <span className="sm:hidden">NOC</span>
            {activeCritical > 0 ? (
              <span className="ml-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {activeCritical}
              </span>
            ) : null}
          </Button>

          <span className="mx-0.5 h-5 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="rounded-full" onClick={() => setOpenMeter(true)} aria-label="Medidor de sinal óptico">
                <Gauge className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Medidor de sinal óptico</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="rounded-full" onClick={() => setOpenSearch(true)} aria-label="Pesquisa global">
                <Search className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pesquisa global — atalho /</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={() => setOpenAlert(true)}
                aria-label="Alerta rápido de incidente"
              >
                <Radio className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alerta rápido de incidente</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <NocMapDialog open={openMap} onOpenChange={setOpenMap} />
      <SignalMeterDialog open={openMeter} onOpenChange={setOpenMeter} />
      <GlobalSearchDialog open={openSearch} onOpenChange={setOpenSearch} />
      <QuickAlertDialog open={openAlert} onOpenChange={setOpenAlert} />
    </>
  );
}
