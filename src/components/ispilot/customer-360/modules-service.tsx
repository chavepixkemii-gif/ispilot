import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Cpu,
  Folder,
  FolderOpen,
  Gauge,
  HardDrive,
  Link2,
  MapPin,
  MessageCircle,
  Network,
  PhoneCall,
  PlayCircle,
  Plus,
  Power,
  Router as RouterIcon,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Trash2,
  Tv,
  Wifi,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { brl, DataRow, Panel, StatTile, tone } from "@/components/ispilot/customer-360/shared";
import type { ModuleProps } from "@/components/ispilot/customer-360/modules-overview";
import {
  TICKET_CATEGORIES,
  TICKET_SECTORS,
  type CustomerPlan,
  type CustomerTicket,
  type Equipment,
  type PlanStatus,
} from "@/lib/customer-360";
import { pushTabItem, setTabDraft } from "@/lib/customer-tabs";
import { cn } from "@/lib/utils";

const CustomerMap = lazy(() => import("@/components/ispilot/customer-map"));

/* --------------------------------- 5 · Planos -------------------------------- */

const PLAN_TABS: PlanStatus[] = ["Ativo", "Inativo", "Cancelado", "Em retenção"];
const PLAN_TAB_LABEL: Record<PlanStatus, string> = {
  Ativo: "Ativos",
  Inativo: "Inativos",
  Cancelado: "Cancelados",
  "Em retenção": "Em Retenção",
};

export function PlanosModule({ customer, data, tab }: ModuleProps) {
  const [openPlan, setOpenPlan] = useState<string | null>(data.plans[0]?.id ?? null);
  const [pppoeOpen, setPppoeOpen] = useState<string | null>(null);
  const [tvOpen, setTvOpen] = useState<string | null>(null);
  const [addressPlan, setAddressPlan] = useState<CustomerPlan | null>(null);

  return (
    <>
      <Tabs defaultValue="Ativo">
        <TabsList className="w-full flex-wrap justify-start">
          {PLAN_TABS.map((status) => (
            <TabsTrigger key={status} value={status} className="text-xs">
              {PLAN_TAB_LABEL[status]}
              <span className="ml-1 rounded-full bg-secondary px-1.5 text-[10px] text-muted-foreground">
                {data.plans.filter((plan) => plan.status === status).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {PLAN_TABS.map((status) => {
          const plans = data.plans.filter((plan) => plan.status === status);
          return (
            <TabsContent key={status} value={status} className="mt-4 space-y-3">
              {plans.length === 0 ? (
                <Panel>
                  <p className="text-xs text-muted-foreground">Nenhum plano nesta situação.</p>
                </Panel>
              ) : null}

              {plans.map((plan) => {
                const expanded = openPlan === plan.id;
                return (
                  <div key={plan.id} className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => setOpenPlan(expanded ? null : plan.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                    >
                      {expanded ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-muted-foreground" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{plan.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {plan.speed} Mbps · {brl(plan.price)}/mês · desde {plan.since}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          plan.status === "Ativo" ? tone.ok : plan.status === "Em retenção" ? tone.warn : tone.muted,
                        )}
                      >
                        {plan.status}
                      </Badge>
                      <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                    </button>

                    {expanded ? (
                      <div className="space-y-3 border-t border-border p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant={pppoeOpen === plan.id ? "hero" : "outline"}
                            size="sm"
                            className="text-[11px]"
                            onClick={() => setPppoeOpen(pppoeOpen === plan.id ? null : plan.id)}
                          >
                            <Network className="size-3.5" /> PPPoE {plan.pppoe.login}
                          </Button>
                          {plan.tv ? (
                            <Button
                              variant={tvOpen === plan.id ? "hero" : "outline"}
                              size="sm"
                              className="text-[11px]"
                              onClick={() => setTvOpen(tvOpen === plan.id ? null : plan.id)}
                            >
                              <Tv className="size-3.5" /> Seanet Play
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setAddressPlan(plan)}>
                            <MapPin className="size-3.5" /> Endereço
                          </Button>
                          {plan.status === "Inativo" ? (
                            <>
                              <Button
                                variant="soft"
                                size="sm"
                                className="text-[11px]"
                                onClick={() =>
                                  toast.success("Liberação em confiança aplicada", {
                                    description: `${plan.name} habilitado provisoriamente por 48 h.`,
                                  })
                                }
                              >
                                <Zap className="size-3.5" /> Habilitar plano provisório
                              </Button>
                              <Select onValueChange={(value) => toast.success("Status alterado", { description: `${plan.name} → ${value}` })}>
                                <SelectTrigger className="h-8 w-[170px] text-[11px]">
                                  <SelectValue placeholder="Mudar status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ativo" className="text-xs">Ativo</SelectItem>
                                  <SelectItem value="Cancelado" className="text-xs">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          ) : null}
                        </div>

                        {pppoeOpen === plan.id ? (
                          <div className="rounded-xl border border-border bg-secondary/30 p-3">
                            <div className="grid gap-3 sm:grid-cols-4">
                              <StatTile
                                icon={Activity}
                                label="Conexão"
                                value={plan.pppoe.status}
                                valueClass={plan.pppoe.status === "Online" ? "text-emerald-400" : "text-destructive"}
                              />
                              <StatTile icon={Gauge} label="Uptime" value={plan.pppoe.uptime} />
                              <StatTile icon={Network} label={`IP ${plan.pppoe.ipType}`} value={plan.pppoe.ip} hint={`NAS ${plan.pppoe.nas}`} />
                              <StatTile
                                icon={ShieldAlert}
                                label="Suspensão por débito"
                                value={plan.pppoe.suspensionRisk ? "Iminente" : "Sem risco"}
                                valueClass={plan.pppoe.suspensionRisk ? "text-amber-400" : "text-emerald-400"}
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <p className="font-mono text-[11px] text-muted-foreground">
                                Senha: {plan.pppoe.password}
                              </p>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-destructive/40 text-[11px] text-destructive">
                                    <Trash2 className="size-3.5" /> Excluir login PPPoE
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir o login {plan.pppoe.login}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      A sessão atual será derrubada e o assinante perderá o acesso imediatamente. Essa ação é
                                      registrada no histórico com seu usuário.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        toast.success("Login PPPoE excluído", { description: `${plan.pppoe.login} removido do RADIUS.` })
                                      }
                                    >
                                      Confirmar exclusão
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ) : null}

                        {tvOpen === plan.id && plan.tv ? (
                          <div className="rounded-xl border border-border bg-secondary/30 p-3">
                            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              <PlayCircle className="size-3.5 text-primary" /> Subpasta Seanet Play (TV / streaming)
                            </p>
                            <div className="mt-2">
                              <DataRow label="Login" value={plan.tv.login} copyable />
                              <DataRow label="Senha" value={plan.tv.password} copyable />
                              <DataRow label="Telas simultâneas" value={String(plan.tv.screens)} />
                              <DataRow
                                label="Status do serviço"
                                value={plan.tv.status}
                                className={plan.tv.status === "Ativo" ? "text-emerald-400" : "text-destructive"}
                              />
                            </div>
                          </div>
                        ) : null}

                        {plan.retention ? (
                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                                Tentativas de cancelamento ({plan.retention.attempts})
                              </p>
                              <p className="mt-1 text-xs text-foreground">{plan.retention.reason}</p>
                              <ul className="mt-2 space-y-1">
                                {plan.retention.contactLog.map((line) => (
                                  <li key={line} className="font-mono text-[10px] text-muted-foreground">
                                    {line}
                                  </li>
                                ))}
                              </ul>
                              <Textarea
                                className="mt-2 min-h-[60px] text-xs"
                                placeholder="Nova observação de retenção…"
                                value={tab.drafts[`retention_${plan.id}`] ?? ""}
                                onChange={(event) => setTabDraft(tab.id, `retention_${plan.id}`, event.target.value)}
                              />
                            </div>
                            <div className="rounded-xl border border-border bg-secondary/30 p-3">
                              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" /> Copiloto — argumentos de retenção
                              </p>
                              <ul className="mt-2 space-y-1.5">
                                {plan.retention.aiTips.map((tip) => (
                                  <li key={tip} className="flex gap-2 text-[11px] text-foreground">
                                    <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-primary" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Ofertas sugeridas
                              </p>
                              <div className="mt-1.5 space-y-1.5">
                                {plan.retention.offers.map((offer) => (
                                  <div key={offer} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 p-2">
                                    <span className="text-[11px] text-foreground">{offer}</span>
                                    <Button variant="soft" size="sm" className="h-6 text-[10px]" onClick={() => toast.success("Oferta registrada", { description: offer })}>
                                      Ofertar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={Boolean(addressPlan)} onOpenChange={(open) => !open && setAddressPlan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Endereço do contrato</DialogTitle>
            <DialogDescription className="text-xs">{addressPlan?.name}</DialogDescription>
          </DialogHeader>
          <p className="text-xs text-foreground">{addressPlan?.address}</p>
          <div className="h-[220px] overflow-hidden rounded-xl border border-border">
            <ClientOnly fallback={<Skeleton className="size-full" />}>
              <Suspense fallback={<Skeleton className="size-full" />}>
                <CustomerMap customer={customer} />
              </Suspense>
            </ClientOnly>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------ 6 · Atendimentos ----------------------------- */

export function AtendimentosModule({ customer, data, tab }: ModuleProps) {
  const [newOpen, setNewOpen] = useState(false);
  const [closing, setClosing] = useState<CustomerTicket | null>(null);
  const [planId, setPlanId] = useState("");
  const [sector, setSector] = useState("");
  const [category, setCategory] = useState("");
  const [contactId, setContactId] = useState("");
  const [solution, setSolution] = useState("");
  const [channel, setChannel] = useState("");
  const created = tab.added["tickets"] ?? [];

  const planName = (id: string) => data.plans.find((plan) => plan.id === id)?.name ?? "—";

  function closeTicket() {
    if (!closing) return;
    if (!solution.trim() || !channel) {
      toast.error("Solução aplicada e meio de resolução são obrigatórios");
      return;
    }
    if (channel === "Resolvido via N1") {
      if (closing.callRecording) {
        toast.success("Atendimento encerrado", { description: `Ligação ${closing.callRecording} vinculada ao protocolo.` });
      } else {
        toast.warning("Sem histórico de chamadas vinculado", {
          description: "Notificação enviada para a fila do Supervisor.",
        });
      }
    } else {
      toast.success("Atendimento encerrado", { description: "Conversa de WhatsApp vinculada ao protocolo." });
    }
    setClosing(null);
    setSolution("");
    setChannel("");
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Atendimentos do assinante"
        icon={MessageCircle}
        actions={
          <Button variant="hero" size="sm" className="h-7 text-[11px]" onClick={() => setNewOpen(true)}>
            <Plus className="size-3.5" /> Novo atendimento
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Protocolo</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Setor</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Categoria</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Plano / endereço</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Abertura</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-[0.12em]">Resolução</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {created.map((row) => (
                <TableRow key={row}>
                  <TableCell colSpan={8} className="text-xs text-foreground">
                    <Badge variant="outline" className={cn("mr-2 text-[10px]", tone.ok)}>
                      Novo
                    </Badge>
                    {row}
                  </TableCell>
                </TableRow>
              ))}
              {data.tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-[11px]">{ticket.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", tone.info)}>
                      {ticket.sector}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{ticket.category}</TableCell>
                  <TableCell className="max-w-[190px] truncate text-[11px] text-muted-foreground">
                    {planName(ticket.planId)}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{ticket.openedAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", ticket.status === "Concluído" ? tone.ok : tone.warn)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {ticket.channel ? (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{ticket.channel}</p>
                        {ticket.channel === "Resolvido via N1" ? (
                          ticket.callRecording ? (
                            <button
                              type="button"
                              className="flex items-center gap-1 font-mono text-[10px] text-primary"
                              onClick={() => toast.success("Gravação carregada", { description: ticket.callRecording ?? "" })}
                            >
                              <PhoneCall className="size-3" /> {ticket.callRecording}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-destructive">
                              <AlertTriangle className="size-3" /> Sem histórico de chamadas vinculado
                            </span>
                          )
                        ) : (
                          <a
                            href={ticket.whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-emerald-400"
                          >
                            <Link2 className="size-3" /> Abrir conversa no protocolo
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {ticket.status === "Em Resolução" ? (
                      <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setClosing(ticket)}>
                        Encerrar
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Novo atendimento — {customer.name}</DialogTitle>
            <DialogDescription className="text-xs">
              A vinculação de plano/endereço é obrigatória para rastrear o atendimento corretamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Plano / endereço *</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione o plano do atendimento" />
                </SelectTrigger>
                <SelectContent>
                  {data.plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="text-xs">
                      {plan.name} — {plan.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Setor *</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_SECTORS.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(category === "Solicitação de Visita" || sector === "Técnico" || sector === "Agendamento") ? (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Contato para o técnico acionar no local *
                </Label>
                <Select value={contactId} onValueChange={setContactId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione um contato salvo" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id} className="text-xs">
                        {contact.name} — {contact.value} ({contact.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Relato do cliente</Label>
              <Textarea
                className="min-h-[70px] text-xs"
                value={tab.drafts["newTicket"] ?? ""}
                onChange={(event) => setTabDraft(tab.id, "newTicket", event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => {
                const needsContact = category === "Solicitação de Visita" || sector === "Técnico" || sector === "Agendamento";
                if (!planId || !sector || !category || (needsContact && !contactId)) {
                  toast.error("Preencha plano, setor, categoria e o contato da visita");
                  return;
                }
                pushTabItem(
                  tab.id,
                  "tickets",
                  `${sector} · ${category} · ${planName(planId)}${contactId ? ` · contato: ${data.contacts.find((c) => c.id === contactId)?.value}` : ""}`,
                );
                setNewOpen(false);
                setPlanId("");
                setSector("");
                setCategory("");
                setContactId("");
                setTabDraft(tab.id, "newTicket", "");
                toast.success("Atendimento aberto e vinculado ao plano");
              }}
            >
              Abrir atendimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(closing)} onOpenChange={(open) => !open && setClosing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Encerrar {closing?.code}</DialogTitle>
            <DialogDescription className="text-xs">
              A solução aplicada e o meio de resolução são obrigatórios para o fechamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Solução aplicada *</Label>
              <Textarea
                className="min-h-[90px] text-xs"
                value={solution}
                onChange={(event) => setSolution(event.target.value)}
                placeholder="Descreva o que foi feito para resolver…"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Meio de resolução *</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resolvido via N1" className="text-xs">Resolvido via N1</SelectItem>
                  <SelectItem value="Resolvido via WhatsApp" className="text-xs">Resolvido via WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {channel === "Resolvido via N1" ? (
              closing?.callRecording ? (
                <p className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-300">
                  <PhoneCall className="size-3.5" /> Última ligação gravada: {closing.callRecording}
                </p>
              ) : (
                <p className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
                  <AlertTriangle className="size-3.5" /> Sem histórico de chamadas vinculado — o Supervisor será notificado.
                </p>
              )
            ) : null}
            {channel === "Resolvido via WhatsApp" ? (
              <a
                href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=Protocolo%20${closing?.code ?? ""}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300"
              >
                <Link2 className="size-3.5" /> Abrir conversa no momento exato do protocolo
              </a>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setClosing(null)}>
              Voltar
            </Button>
            <Button variant="hero" size="sm" onClick={closeTicket}>
              Encerrar atendimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------- 7 · Extratos ------------------------------- */

export function ExtratosModule({ customer, data }: ModuleProps) {
  const online = customer.status === "Online";

  return (
    <Panel title="Extrato de conexões RADIUS" icon={Activity}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">IP atribuído</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Conexão</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Desconexão</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Duração</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Download</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Upload</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Last-IP</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sessions.map((session, index) => {
              const active = index === 0 && online;
              const alert = index === 0 && !online;
              return (
                <TableRow
                  key={session.id}
                  className={cn(
                    active && "bg-emerald-500/10 hover:bg-emerald-500/15",
                    alert && "bg-destructive/10 hover:bg-destructive/15",
                  )}
                >
                  <TableCell className="font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      {active ? <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> : null}
                      {session.ip}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{session.connectedAt}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {session.disconnectedAt ?? <span className="text-emerald-400">Sessão ativa</span>}
                  </TableCell>
                  <TableCell className={cn("font-mono text-[11px]", active && "text-emerald-400")}>{session.duration}</TableCell>
                  <TableCell className="font-mono text-[11px]">{session.down.toFixed(1)} GB</TableCell>
                  <TableCell className="font-mono text-[11px]">{session.up.toFixed(1)} GB</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{session.lastIp}</TableCell>
                  <TableCell>
                    {alert ? (
                      <div className="space-y-1.5">
                        <Badge variant="outline" className={cn("text-[10px]", tone.critical)}>
                          {session.reason}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 border-amber-500/40 text-[10px] text-amber-300"
                          onClick={() =>
                            toast.info("Diagnóstico iniciado", {
                              description: `Verificando incidentes físicos na ${customer.cto.name} e acionando o cliente.`,
                            })
                          }
                        >
                          <AlertTriangle className="size-3" /> Verificar incidente físico / contatar
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className={cn("text-[10px]", active ? tone.ok : tone.muted)}>
                        {session.reason}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}

/* ------------------------------ 8 · Equipamentos ---------------------------- */

const EQUIP_ICON = {
  ONU: Wifi,
  ONT: Wifi,
  "Roteador Wi-Fi": RouterIcon,
  "Decodificador / STB": Tv,
  Routerboard: HardDrive,
} as const;

export function EquipamentosModule({ data }: ModuleProps) {
  const [rb, setRb] = useState<Equipment | null>(null);
  const planName = useMemo(
    () => (id: string) => data.plans.find((plan) => plan.id === id)?.name ?? "—",
    [data.plans],
  );

  return (
    <>
      <Panel title="Inventário de equipamentos" icon={HardDrive}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.equipment.map((item) => {
            const Icon = EQUIP_ICON[item.kind];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.rb ? setRb(item) : toast.info("Sem telemetria remota", { description: `${item.brand} ${item.model}` }))}
                className="rounded-xl border border-border bg-secondary/30 p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    {item.brand} {item.model}
                  </p>
                  {item.rb ? (
                    <Badge variant="outline" className={cn("ml-auto text-[9px]", tone.info)}>
                      RB · telemetria
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                  {item.kind} · SN {item.serial}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">MAC {item.mac}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", item.regime === "Comodato" ? tone.info : item.regime === "Próprio" ? tone.muted : tone.warn)}
                  >
                    {item.regime}
                  </Badge>
                  <span className="max-w-[130px] truncate text-[10px] text-muted-foreground">{planName(item.planId)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Sheet open={Boolean(rb)} onOpenChange={(open) => !open && setRb(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-sm">
              {rb?.brand} {rb?.model}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Telemetria em tempo real · RouterOS {rb?.rb?.routerOs} · placa {rb?.rb?.board}
            </SheetDescription>
          </SheetHeader>
          {rb?.rb ? (
            <div className="space-y-4 px-4 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Power} label="Uptime" value={rb.rb.uptime} />
                <StatTile
                  icon={Thermometer}
                  label="Temperatura"
                  value={`${rb.rb.temperature} °C`}
                  {...(rb.rb.temperature > 52 ? { valueClass: "text-amber-400" } : {})}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="size-3.5" /> CPU
                    </span>
                    <span className="font-mono text-foreground">{rb.rb.cpu}%</span>
                  </p>
                  <Progress value={rb.rb.cpu} className="mt-1 h-1.5" />
                </div>
                <div>
                  <p className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="size-3.5" /> Memória
                    </span>
                    <span className="font-mono text-foreground">{rb.rb.memory}%</span>
                  </p>
                  <Progress value={rb.rb.memory} className="mt-1 h-1.5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Interfaces</p>
                <div className="mt-2 space-y-1.5">
                  {rb.rb.interfaces.map((iface) => (
                    <div key={iface.name} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/30 p-2">
                      <span className="flex items-center gap-1.5 text-[11px] text-foreground">
                        <span className={cn("size-1.5 rounded-full", iface.status === "up" ? "bg-emerald-400" : "bg-destructive")} />
                        {iface.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ↓ {iface.rx} · ↑ {iface.tx}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tabela ARP</p>
                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px]">IP</TableHead>
                        <TableHead className="text-[10px]">MAC</TableHead>
                        <TableHead className="text-[10px]">Interface</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rb.rb.arp.map((row) => (
                        <TableRow key={row.ip}>
                          <TableCell className="font-mono text-[10px]">{row.ip}</TableCell>
                          <TableCell className="font-mono text-[10px]">{row.mac}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{row.iface}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
