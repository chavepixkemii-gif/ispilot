import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  ClipboardCheck,
  Clock,
  Gauge,
  Inbox,
  Lock,
  LogOut,
  MapPin,
  Send,
  Signal,
  Sparkles,
  UserCheck,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ispilot/app-shell";
import { QuickReplyPicker } from "@/components/ispilot/quick-reply-picker";
import { ServiceOrderDialog } from "@/components/ispilot/service-order-dialog";
import {
  CLASSIFICATIONS,
  CLOSE_REASONS,
  CURRENT_AGENT,
  INITIAL_TICKETS,
  SECTORS,
  type SectorId,
  type Ticket,
} from "@/lib/support";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/atendimentos")({
  head: () => ({
    meta: [
      { title: "Atendimentos multi-setor — ISPilot" },
      {
        name: "description",
        content:
          "Filas de atendimento por setor, chat com contexto técnico do assinante e geração de O.S. assistida por IA.",
      },
      { property: "og:title", content: "Atendimentos multi-setor — ISPilot" },
      {
        property: "og:description",
        content: "Fila geral, minha fila, transferência de setor e ordens de serviço automáticas com IA.",
      },
    ],
  }),
  component: AtendimentosPage,
});

function waitLabel(minutes: number) {
  if (minutes <= 0) return "Em atendimento";
  if (minutes < 60) return `Aguardando há ${minutes} min`;
  return `Aguardando há ${Math.floor(minutes / 60)} h`;
}

function ContextMetric({ icon: Icon, label, value, tone }: { icon: typeof Signal; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-2.5">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xs text-foreground", tone)}>{value}</p>
    </div>
  );
}

function AtendimentosPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [sector, setSector] = useState<SectorId>("suporte");
  const [queue, setQueue] = useState<"mine" | "general">("mine");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [osOpen, setOsOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const active = tickets.find((ticket) => ticket.id === activeId) ?? null;
  const sectorMeta = SECTORS.find((item) => item.id === sector)!;

  const list = useMemo(() => {
    const bySector = tickets.filter((ticket) => ticket.sector === sector);
    return queue === "mine"
      ? bySector.filter((ticket) => ticket.ownerId === CURRENT_AGENT.id)
      : bySector.filter((ticket) => !ticket.ownerId);
  }, [tickets, sector, queue]);

  function patch(id: string, changes: Partial<Ticket>) {
    setTickets((current) => current.map((ticket) => (ticket.id === id ? { ...ticket, ...changes } : ticket)));
  }

  function assume(ticket: Ticket) {
    patch(ticket.id, { ownerId: CURRENT_AGENT.id, ownerName: CURRENT_AGENT.name, waitingMinutes: 0 });
    setQueue("mine");
    toast.success(`Atendimento ${ticket.protocol} assumido`);
  }

  function release(ticket: Ticket) {
    patch(ticket.id, { ownerId: null, ownerName: null, waitingMinutes: 1 });
    setActiveId(null);
    toast.info(`${ticket.protocol} devolvido para a fila geral`);
  }

  function send(content: string) {
    if (!active || !content.trim()) return;
    patch(active.id, {
      messages: [
        ...active.messages,
        {
          id: `m-${Date.now()}`,
          from: "agent",
          at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          content: content.trim(),
        },
      ],
    });
    setDraft("");
  }

  return (
    <div>
      <PageHeader
        icon={Inbox}
        title="Atendimentos"
        description="Caixas de entrada por setor com isolamento de permissões, filas de espera e trabalho em equipe."
        actions={
          <Badge variant="outline" className="text-[10px]">
            {tickets.filter((ticket) => ticket.sector === "suporte" && !ticket.ownerId).length} na fila do suporte
          </Badge>
        }
      />

      <div className="px-4 pt-4 md:px-6">
        <Tabs value={sector} onValueChange={(value) => setSector(value as SectorId)}>
          <TabsList className="flex-wrap">
            {SECTORS.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="text-xs">
                {!item.allowed ? <Lock className="mr-1 size-3" /> : null}
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {!sectorMeta.allowed ? (
        <div className="m-4 rounded-2xl border border-border bg-card/60 p-10 text-center md:m-6">
          <Lock className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">Caixa isolada para a sua equipe</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            O setor <strong>{sectorMeta.label}</strong> é restrito por permissão. Você só visualiza estas conversas
            quando um colega transferir o atendimento para o seu setor.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[340px_1fr]">
          <section className="rounded-2xl border border-border bg-card/60">
            <Tabs value={queue} onValueChange={(value) => setQueue(value as "mine" | "general")}>
              <TabsList className="w-full rounded-t-2xl">
                <TabsTrigger value="mine" className="flex-1 text-xs">
                  Minha fila
                </TabsTrigger>
                <TabsTrigger value="general" className="flex-1 text-xs">
                  Fila geral do suporte
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-1.5 p-2">
              {list.length === 0 ? (
                <p className="px-2 py-10 text-center text-xs text-muted-foreground">Nenhuma conversa nesta fila.</p>
              ) : (
                list.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveId(ticket.id)}
                    className={cn(
                      "w-full rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-secondary/60",
                      activeId === ticket.id && "border-border bg-secondary/70",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-foreground">{ticket.customerName}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px]",
                          ticket.status === "Online"
                            ? "border-emerald-500/30 text-emerald-400"
                            : "border-destructive/30 text-destructive",
                        )}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{ticket.subject}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      {waitLabel(ticket.waitingMinutes)} · {ticket.channel} · {ticket.protocol}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="text-xs text-muted-foreground">
              Selecione uma conversa na fila para abrir o atendimento em modo foco, com o contexto técnico do
              assinante ao lado das mensagens.
            </p>
            <ul className="mt-4 space-y-2 text-[11px] text-muted-foreground">
              <li>• Assumir atendimento, devolver para a fila e transferir de setor.</li>
              <li>• Sinal RX/TX, IP, PPPoE, CTO e endereço em tempo real.</li>
              <li>• Detecção de falha física e geração de O.S. com IA.</li>
            </ul>
          </section>
        </div>
      )}

      {/* Focus mode */}
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent
          className="max-h-[94dvh] w-[min(1100px,96vw)] max-w-none overflow-hidden p-0 backdrop-blur-md"
        >
          {active ? (
            <div className="flex max-h-[94dvh] flex-col">
              <DialogHeader className="border-b border-border px-4 py-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <DialogTitle className="font-display text-sm">
                      {active.customerName} · {active.protocol}
                    </DialogTitle>
                    <DialogDescription className="text-[11px]">
                      {active.plan} · {active.channel} ·{" "}
                      {active.ownerName ? `em atendimento por ${active.ownerName}` : waitLabel(active.waitingMinutes)}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {!active.ownerId ? (
                      <Button size="sm" variant="hero" onClick={() => assume(active)}>
                        <UserCheck className="size-4" />
                        Assumir atendimento
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => release(active)}>
                        <LogOut className="size-4" />
                        Devolver para a fila
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setTransferOpen(true)}>
                      <ArrowLeftRight className="size-4" />
                      Transferir de setor
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setCloseOpen(true)}>
                      Encerrar atendimento
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_300px]">
                <div className="flex min-h-0 flex-col">
                  {active.physicalFailure || active.rx <= -30 ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="m-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3"
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold text-destructive">
                        <AlertTriangle className="size-4" />
                        ⚠ Falha física detectada. Necessário envio de técnico de campo.
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        IA correlacionou o relato do cliente com RX {active.rx} dBm e status {active.status} na{" "}
                        {active.cto.split("·")[0]?.trim()}.
                      </p>
                      <Button size="sm" variant="hero" className="mt-2.5" onClick={() => setOsOpen(true)}>
                        <Sparkles className="size-4" />
                        Gerar ordem de serviço com IA
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="m-3 rounded-xl border border-border bg-secondary/30 p-3">
                      <p className="text-[11px] text-muted-foreground">
                        IA: métricas dentro da faixa operacional — provável ajuste remoto (N1). Gere O.S. apenas se
                        necessário.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => setOsOpen(true)}>
                        <ClipboardCheck className="size-4" />
                        Gerar ordem de serviço
                      </Button>
                    </div>
                  )}

                  <div className="min-h-[220px] flex-1 space-y-2.5 overflow-y-auto px-4 pb-3">
                    {active.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[86%] rounded-xl px-3 py-2 text-xs",
                          message.from === "agent"
                            ? "ml-auto bg-primary/15 text-foreground"
                            : message.from === "system"
                              ? "mx-auto border border-border bg-secondary/40 font-mono text-[10px] text-muted-foreground"
                              : "bg-secondary/60 text-foreground",
                        )}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className="mt-1 text-right text-[10px] text-muted-foreground">{message.at}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-end gap-2 border-t border-border p-3">
                    <QuickReplyPicker
                      onSelect={(content) =>
                        setDraft((current) =>
                          `${current}${current ? "\n" : ""}${content
                            .replaceAll("{nome_cliente}", active.customerName)
                            .replaceAll("{plano}", active.plan)
                            .replaceAll("{sinal_rx}", `${active.rx} dBm`)}`,
                        )
                      }
                    />
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          send(draft);
                        }
                      }}
                      rows={2}
                      placeholder="Escreva para o cliente…"
                      className="min-h-[44px] flex-1 resize-none text-xs"
                    />
                    <Button size="icon-lg" variant="hero" onClick={() => send(draft)} aria-label="Enviar">
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>

                <aside className="min-h-0 space-y-2 overflow-y-auto border-t border-border p-3 lg:border-l lg:border-t-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Contexto técnico
                  </p>
                  <ContextMetric
                    icon={Signal}
                    label="Sinal óptico"
                    value={`RX ${active.rx} dBm / TX ${active.tx} dBm`}
                    tone={active.rx <= -30 ? "text-destructive" : active.rx <= -28 ? "text-amber-400" : "text-emerald-400"}
                  />
                  <ContextMetric icon={Wifi} label="Status Radius" value={active.status} />
                  <ContextMetric icon={Gauge} label="PPPoE / IP" value={`${active.pppoe}\n${active.ip}`} />
                  <ContextMetric icon={MapPin} label="Endereço" value={active.address} />
                  <ContextMetric icon={Signal} label="CTO / OLT" value={active.cto} />
                  <ContextMetric icon={Clock} label="Contrato" value={`${active.contractId} · ${active.plan}`} />
                </aside>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ServiceOrderDialog
        ticket={active}
        open={osOpen}
        onOpenChange={setOsOpen}
        onCreated={() => {
          if (active) {
            patch(active.id, {
              messages: [
                ...active.messages,
                {
                  id: `os-${Date.now()}`,
                  from: "system",
                  at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                  content: "Ordem de serviço gerada e agendada. Cliente notificado via WhatsApp.",
                },
              ],
            });
          }
        }}
      />

      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onConfirm={(target, note) => {
          if (!active) return;
          patch(active.id, { sector: target, ownerId: null, ownerName: null, waitingMinutes: 1 });
          setActiveId(null);
          toast.success(`Atendimento transferido para ${SECTORS.find((item) => item.id === target)?.label}`, {
            description: note ? `Nota interna: ${note}` : undefined,
          });
        }}
      />

      <CloseDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        onConfirm={() => {
          if (!active) return;
          setTickets((current) => current.filter((ticket) => ticket.id !== active.id));
          setActiveId(null);
          toast.success("Atendimento encerrado e pesquisa de satisfação enviada");
        }}
      />
    </div>
  );
}

function TransferDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sector: SectorId, note: string) => void;
}) {
  const [target, setTarget] = useState<SectorId>("financeiro");
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir de setor</DialogTitle>
          <DialogDescription>O colega recebe o histórico completo e a sua nota interna.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Setor destino</Label>
            <Select value={target} onValueChange={(value) => setTarget(value as SectorId)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Nota interna</Label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="hero"
            onClick={() => {
              onConfirm(target, note);
              onOpenChange(false);
              setNote("");
            }}
          >
            <ArrowLeftRight className="size-4" />
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CloseDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [classification, setClassification] = useState(CLASSIFICATIONS[0]!);
  const [reason, setReason] = useState(CLOSE_REASONS[0]!);
  const [resolution, setResolution] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar atendimento</DialogTitle>
          <DialogDescription>Formulário obrigatório de fechamento e pesquisa de satisfação.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Classificação da chamada
            </Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSIFICATIONS.map((item) => (
                  <SelectItem key={item} value={item} className="text-xs">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Resolução</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLOSE_REASONS.map((item) => (
                  <SelectItem key={item} value={item} className="text-xs">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Descrição da resolução
            </Label>
            <Textarea
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              rows={3}
              placeholder="O que foi feito para resolver…"
              className="text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="hero"
            disabled={resolution.trim().length < 5}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
              setResolution("");
            }}
          >
            Encerrar e enviar pesquisa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
