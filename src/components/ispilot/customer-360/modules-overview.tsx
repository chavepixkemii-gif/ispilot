import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  ClipboardList,
  Coins,
  FileSignature,
  History,
  Lock,
  Mail,
  MapPin,
  Phone,
  PieChart as PieIcon,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { brl, DataRow, Panel, StatTile, tone } from "@/components/ispilot/customer-360/shared";
import type { Customer } from "@/lib/customers";
import type { Contact, Customer360, HistoryCategory } from "@/lib/customer-360";
import { ticketsByCategory, ticketsByStatus } from "@/lib/customer-360";
import { pushTabItem, setTabDraft, type CustomerTab } from "@/lib/customer-tabs";
import { cn } from "@/lib/utils";

const CustomerMap = lazy(() => import("@/components/ispilot/customer-map"));

export type ModuleProps = { customer: Customer; data: Customer360; tab: CustomerTab; canEditRegistry: boolean };

/* ------------------------------ 1 · Dashboard ------------------------------ */

export function DashboardModule({ customer, data, tab }: ModuleProps) {
  const [window, setWindow] = useState(tab.drafts["billingWindow"] ?? "30");
  const selected = data.finance.windows.find((row) => String(row.days) === window) ?? data.finance.windows[0]!;
  const statusData = useMemo(() => ticketsByStatus(data.tickets), [data.tickets]);
  const categoryData = useMemo(() => ticketsByCategory(data.tickets), [data.tickets]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="CTO vinculada e localização" icon={MapPin} className="overflow-hidden">
          <div className="h-[230px] overflow-hidden rounded-xl border border-border">
            <ClientOnly fallback={<Skeleton className="size-full" />}>
              <Suspense fallback={<Skeleton className="size-full" />}>
                <CustomerMap customer={customer} />
              </Suspense>
            </ClientOnly>
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            {customer.cto.name} · porta {customer.cto.port}/{customer.cto.totalPorts} · {customer.cto.olt} {customer.cto.pon}
          </p>
        </Panel>

        <Panel title="Dados rápidos do assinante" icon={UserRound}>
          <h2 className="font-display text-base font-semibold text-foreground">{customer.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {customer.address.street}, {customer.address.number}
            {customer.address.complement && customer.address.complement !== "—" ? ` — ${customer.address.complement}` : ""} ·{" "}
            {customer.address.district} · CEP {customer.address.zip} · {customer.address.city}
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Phone className="size-3.5 text-primary" /> {customer.phone}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px]", customer.financialStatus === "Em atraso" ? tone.critical : tone.ok)}
            >
              <BadgeCheck className="size-3" />
              Serviço {customer.accountStatus} · {customer.financialStatus === "Em atraso" ? "Em Débito" : "Em Dia"}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px]", data.finance.installmentPlan ? tone.warn : tone.muted)}>
              Parcelamento ativo: {data.finance.installmentPlan ? "Sim" : "Não"}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px]", data.finance.canSuspend ? tone.critical : tone.info)}>
              <ShieldCheck className="size-3" />
              Pode ser suspenso: {data.finance.canSuspend ? "Sim" : "Não"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile icon={Coins} label="Ticket médio" value={brl(data.finance.averageTicket)} />
            <StatTile icon={ClipboardList} label="Planos ativos" value={String(data.finance.activePlans)} />
            <StatTile icon={TrendingUp} label="Faturamento gerado" value={brl(data.finance.revenueGenerated)} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel
          title="Faturamento por período"
          icon={CalendarClock}
          actions={
            <Select
              value={window}
              onValueChange={(value) => {
                setWindow(value);
                setTabDraft(tab.id, "billingWindow", value);
              }}
            >
              <SelectTrigger className="h-7 w-[160px] text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.finance.windows.map((row) => (
                  <SelectItem key={row.days} value={String(row.days)} className="text-xs">
                    {row.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Plano" value={brl(selected.plan)} hint={selected.label} />
            <StatTile label="Adicionais" value={brl(selected.extras)} hint="Seanet Play / pontos extras" />
            <StatTile
              label="Total"
              value={brl(selected.plan + selected.extras)}
              valueClass="text-primary"
              hint="Receita reconhecida"
            />
          </div>
        </Panel>

        <Panel title="Inadimplência" icon={Wallet}>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile icon={Wallet} label="Total em aberto" value={brl(data.finance.openTotal)} valueClass="text-amber-400" />
            <StatTile icon={CalendarClock} label="A vencer" value={brl(data.finance.upcoming)} />
            <StatTile
              icon={AlertTriangle}
              label="Vencidos"
              value={brl(data.finance.overdue)}
              valueClass="text-destructive"
              hint={data.finance.overdue > 0 ? "Elegível a cobrança ativa" : "Nenhum título vencido"}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Atendimentos por status" icon={PieIcon}>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4">
            {statusData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: entry.color }} />
                {entry.name} · {entry.value}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Atendimentos por tipo / categoria" icon={BarChart3}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} width={150} tickLine={false} axisLine={false} />
                <ChartTooltip
                  contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12, fontSize: 11 }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------- 2 · Cadastro ------------------------------ */

export function CadastroModule({ customer, data, tab, canEditRegistry }: ModuleProps) {
  const [editing, setEditing] = useState(false);
  const draft = (key: string, fallback: string) => tab.drafts[key] ?? fallback;

  const fields: Array<[string, string, string]> = [
    ["Nome / Razão social", "reg_name", customer.name],
    ["CPF / CNPJ", "reg_doc", customer.document],
    ["RG / Inscrição estadual", "reg_rg", data.registry.rg],
    ["Nascimento / Abertura", "reg_birth", data.registry.birthDate],
    ["Nome da mãe", "reg_mother", data.registry.motherName],
    ["Telefone principal", "reg_phone", customer.phone],
    ["E-mail", "reg_email", customer.email],
    ["Endereço de cobrança", "reg_billing", data.registry.billingAddress],
  ];

  return (
    <div className="space-y-4">
      {!canEditRegistry ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
          <Lock className="size-3.5" />
          Somente perfis dos setores <strong>Financeiro</strong> e <strong>Comercial</strong> podem editar a ficha cadastral. Você
          está em modo leitura.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={`Ficha cadastral — ${data.registry.personType}`}
          icon={UserRound}
          actions={
            canEditRegistry ? (
              <Button
                variant={editing ? "hero" : "outline"}
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => {
                  if (editing) toast.success("Cadastro atualizado", { description: "Alterações registradas no histórico." });
                  setEditing(!editing);
                }}
              >
                {editing ? <Save className="size-3.5" /> : null}
                {editing ? "Salvar alterações" : "Editar cadastro"}
              </Button>
            ) : (
              <Badge variant="outline" className={cn("text-[10px]", tone.muted)}>
                Somente leitura
              </Badge>
            )
          }
        >
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map(([label, key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
                  <Input
                    className="h-8 text-xs"
                    value={draft(key, value)}
                    onChange={(event) => setTabDraft(tab.id, key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {fields.map(([label, key, value]) => (
                <DataRow key={key} label={label} value={draft(key, value)} copyable />
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Contratos assinados" icon={FileSignature}>
            <div className="space-y-2">
              {data.registry.contracts.map((contract) => (
                <div key={contract.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">{contract.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {contract.kind} · {contract.signedAt}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[11px]" onClick={() => toast.success("Contrato aberto em nova guia")}>
                    Abrir PDF
                  </Button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Observações da instalação original" icon={ClipboardList}>
            <p className="text-xs leading-relaxed text-muted-foreground">{data.registry.installationNotes}</p>
            <DataRow label="Instalado em" value={data.registry.installedAt} />
            <DataRow label="Contrato" value={customer.contractId} copyable />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- 3 · Contatos ------------------------------ */

const CONTACT_ICON = {
  "Celular / WhatsApp": Smartphone,
  "Telefone fixo": Phone,
  "E-mail": Mail,
} as const;

export function ContatosModule({ data, tab }: ModuleProps) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<Contact["kind"]>("Celular / WhatsApp");
  const [category, setCategory] = useState<Contact["category"]>("Autorizado");
  const [gender, setGender] = useState<Contact["gender"]>("Não informado");
  const extra = tab.added["contacts"] ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="Contatos vinculados ao assinante" icon={Phone}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Nome</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Meio</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Contato</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Categoria</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.12em]">Sexo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.contacts.map((contact) => {
              const Icon = CONTACT_ICON[contact.kind];
              return (
                <TableRow key={contact.id}>
                  <TableCell className="text-xs font-medium text-foreground">
                    {contact.name}
                    {contact.note ? <p className="text-[10px] text-muted-foreground">{contact.note}</p> : null}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Icon className="size-3.5 text-primary" />
                      {contact.kind}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">{contact.value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", tone.info)}>
                      {contact.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{contact.gender}</TableCell>
                </TableRow>
              );
            })}
            {extra.map((row) => (
              <TableRow key={row}>
                <TableCell colSpan={5} className="text-xs text-foreground">
                  <Badge variant="outline" className={cn("mr-2 text-[10px]", tone.ok)}>
                    Novo
                  </Badge>
                  {row}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-300">
          Na abertura de O.S. de visita técnica, a seleção de um destes contatos é obrigatória — o técnico usa esse número ao
          chegar ao local.
        </p>
      </Panel>

      <Panel title="Adicionar contato / observação" icon={Plus}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Nome do contato</Label>
            <Input className="h-8 text-xs" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria (esposa)" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Meio</Label>
              <Select value={kind} onValueChange={(next) => setKind(next as Contact["kind"])}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Celular / WhatsApp", "Telefone fixo", "E-mail"] as const).map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Categoria</Label>
              <Select value={category} onValueChange={(next) => setCategory(next as Contact["category"])}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Titular", "Financeiro", "Autorizado", "Técnico"] as const).map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Telefone / e-mail</Label>
              <Input className="h-8 text-xs" value={value} onChange={(event) => setValue(event.target.value)} placeholder="+55 11 …" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Sexo</Label>
              <Select value={gender} onValueChange={(next) => setGender(next as Contact["gender"])}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Masculino", "Feminino", "Não informado"] as const).map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Observação do contato</Label>
            <Textarea
              className="min-h-[70px] text-xs"
              value={tab.drafts["contactNote"] ?? ""}
              onChange={(event) => setTabDraft(tab.id, "contactNote", event.target.value)}
              placeholder="Ex.: só atende após as 18h."
            />
          </div>
          <Button
            variant="hero"
            size="sm"
            className="w-full"
            onClick={() => {
              if (!name.trim() || !value.trim()) {
                toast.error("Informe nome e contato");
                return;
              }
              pushTabItem(
                tab.id,
                "contacts",
                `${name} · ${kind} · ${value} · ${category} · ${gender}${tab.drafts["contactNote"] ? ` — ${tab.drafts["contactNote"]}` : ""}`,
              );
              setName("");
              setValue("");
              setTabDraft(tab.id, "contactNote", "");
              toast.success("Contato adicionado ao cliente");
            }}
          >
            <Plus className="size-4" /> Adicionar contato
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Qualquer colaborador pode adicionar contatos e observações — sem restrição de setor.
          </p>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------- 4 · Histórico ----------------------------- */

const HISTORY_FILTERS: Array<HistoryCategory | "Todos"> = [
  "Todos",
  "Instalação",
  "Retirada de equipamento",
  "Reclamação",
  "Troca de endereço",
  "Alteração de velocidade",
  "Ligação telefônica",
  "Observação",
];

export function HistoricoModule({ data, tab }: ModuleProps) {
  const [filter, setFilter] = useState<HistoryCategory | "Todos">("Todos");
  const notes = tab.added["history"] ?? [];
  const rows = data.history.filter((entry) => filter === "Todos" || entry.category === filter);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Panel
        title="Linha do tempo de interações"
        icon={History}
        actions={
          <Select value={filter} onValueChange={(value) => setFilter(value as HistoryCategory | "Todos")}>
            <SelectTrigger className="h-7 w-[190px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HISTORY_FILTERS.map((option) => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <ol className="relative space-y-3 border-l border-border pl-4">
          {(filter === "Todos" || filter === "Observação") &&
            notes.map((note) => (
              <li key={note} className="relative">
                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/15" />
                <Badge variant="outline" className={cn("text-[10px]", tone.ok)}>
                  Observação · agora
                </Badge>
                <p className="mt-1 text-xs text-foreground">{note}</p>
              </li>
            ))}
          {rows.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px]", tone.info)}>
                  {entry.category}
                </Badge>
                <span className="font-mono text-[10px] text-muted-foreground">{entry.at}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-foreground">{entry.title}</p>
              <p className="text-[11px] text-muted-foreground">{entry.detail}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">por {entry.author}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Adicionar nota ao histórico" icon={Plus}>
        <Textarea
          className="min-h-[130px] text-xs"
          value={tab.drafts["historyNote"] ?? ""}
          onChange={(event) => setTabDraft(tab.id, "historyNote", event.target.value)}
          placeholder="Registre a interação, combinado ou informação relevante…"
        />
        <Button
          variant="hero"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            const note = tab.drafts["historyNote"]?.trim();
            if (!note) {
              toast.error("Escreva a nota antes de registrar");
              return;
            }
            pushTabItem(tab.id, "history", note);
            setTabDraft(tab.id, "historyNote", "");
            toast.success("Nota registrada no histórico do cliente");
          }}
        >
          Registrar no histórico
        </Button>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Qualquer operador pode registrar notas — o autor e o horário ficam anexados automaticamente.
        </p>
      </Panel>
    </div>
  );
}
