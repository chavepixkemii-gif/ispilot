import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Banknote,
  Copy,
  FileText,
  Gauge,
  MapPin,
  MessageCircle,
  Network,
  RefreshCw,
  Router,
  Search,
  Signal,
  Sparkles,
  TrendingUp,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ispilot/app-shell";
import { EmptyState } from "@/components/ispilot/ui-states";
import { CustomerTabsBar } from "@/components/ispilot/customer-360/tabs-bar";
import { CustomerWorkspace } from "@/components/ispilot/customer-360/workspace";
import { clearActiveCustomerTab, openCustomerTab, useCustomerTabs } from "@/lib/customer-tabs";
import { setSidebarCollapsed } from "@/lib/ui-store";
import {
  ACCOUNT_STATUSES,
  CUSTOMERS,
  accountStatusTone,
  openInvoiceTotal,
  rxLevel,
  searchCustomers,
  type Customer,
} from "@/lib/customers";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Central do Assinante — ISPilot" },
      {
        name: "description",
        content:
          "Lista completa de assinantes com busca avançada e perfil 360°: NOC, financeiro, comercial e ordens de serviço.",
      },
      { property: "og:title", content: "Central do Assinante — ISPilot" },
      {
        property: "og:description",
        content: "Consulta em tempo real de conexão, geolocalização de CTO, faturas e ordens de serviço do assinante.",
      },
    ],
    links: [{ rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" }],
  }),
  component: CustomersPage,
});

const toneClass = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-secondary/40 text-muted-foreground",
} as const;

const brl = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

function copy(label: string, value: string) {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} copiado`, { description: value });
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: typeof Signal;
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={cn("mt-1.5 font-mono text-sm text-foreground", className)}>{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Field({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-xs font-medium text-foreground">
        {value}
        {copyable ? (
          <button type="button" onClick={() => copy(label, value)} aria-label={`Copiar ${label}`}>
            <Copy className="size-3 text-muted-foreground transition-colors hover:text-primary" />
          </button>
        ) : null}
      </span>
    </div>
  );
}

/* ---------------------------------- Lista ---------------------------------- */

type SortKey = "name" | "rx" | "plan" | "debt";

function CustomersPage() {
  const { tabs, activeId } = useCustomerTabs();
  const active = tabs.find((tab) => tab.id === activeId) ?? null;
  const customer = active ? CUSTOMERS.find((item) => item.id === active.id) ?? null : null;

  useEffect(() => {
    setSidebarCollapsed(Boolean(active));
  }, [active]);

  return (
    <div className="space-y-4">
      <CustomerTabsBar tabs={tabs} activeId={activeId} />
      <PageHeader
        title={customer ? customer.name : "Central do Assinante"}
        description={
          customer
            ? `${customer.contractId} · ${customer.plan} · ${customer.address.district}`
            : `${CUSTOMERS.length} assinantes na base — busca por nome, CPF/CNPJ, PPPoE, IP, MAC, contrato ou endereço.`
        }
        actions={
          customer ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearActiveCustomerTab();
                setSidebarCollapsed(false);
              }}
            >
              <ArrowLeft className="size-4" /> Voltar à lista
            </Button>
          ) : null
        }
      />
      {customer && active ? (
        <CustomerWorkspace customer={customer} tab={active} canEditRegistry />
      ) : (
        <CustomerTable onSelect={(item) => openCustomerTab(item.id, item.name)} />
      )}
    </div>
  );
}

function CustomerTable({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [connection, setConnection] = useState("Todos");
  const [district, setDistrict] = useState("Todos");
  const [sort, setSort] = useState<SortKey>("name");

  const districts = useMemo(
    () => ["Todos", ...Array.from(new Set(CUSTOMERS.map((customer) => customer.address.district)))],
    [],
  );

  const rows = useMemo(() => {
    const list = searchCustomers(query).filter(
      (customer) =>
        (status === "Todos" || customer.accountStatus === status) &&
        (connection === "Todos" || customer.status === connection) &&
        (district === "Todos" || customer.address.district === district),
    );
    return [...list].sort((a, b) => {
      if (sort === "rx") return a.rx - b.rx;
      if (sort === "plan") return b.planSpeed - a.planSpeed;
      if (sort === "debt") return openInvoiceTotal(b) - openInvoiceTotal(a);
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [query, status, connection, district, sort]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, CPF/CNPJ, PPPoE, IP, MAC, contrato, CEP…"
            className="h-9 pl-9 text-xs"
          />
        </div>
        {(
          [
            ["Situação", status, setStatus, ["Todos", ...ACCOUNT_STATUSES]],
            ["Conexão", connection, setConnection, ["Todos", "Online", "Offline"]],
            ["Bairro", district, setDistrict, districts],
          ] as Array<[string, string, (value: string) => void, string[]]>
        ).map(([label, value, setValue, options]) => (
          <div key={label} className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
            <Select value={value} onValueChange={setValue}>
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
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Ordenar</Label>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" className="text-xs">Nome (A–Z)</SelectItem>
              <SelectItem value="rx" className="text-xs">Pior sinal óptico</SelectItem>
              <SelectItem value="plan" className="text-xs">Maior plano</SelectItem>
              <SelectItem value="debt" className="text-xs">Maior débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Users className="size-3.5" /> {rows.length} de {CUSTOMERS.length} assinantes
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {rows.filter((row) => row.status === "Online").length} online ·{" "}
            {rows.filter((row) => row.financialStatus === "Em atraso").length} em atraso
          </p>
        </div>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="Nenhum assinante encontrado"
              description="Ajuste os filtros ou revise o termo pesquisado."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Assinante</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Plano</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Situação</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Conexão</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Sinal (RX)</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">CTO / PON</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.12em]">Financeiro</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((customer) => {
                  const rx = rxLevel(customer.rx);
                  const debt = openInvoiceTotal(customer);
                  return (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => onSelect(customer)}
                    >
                      <TableCell>
                        <p className="text-xs font-semibold text-foreground">{customer.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {customer.contractId} · {customer.document}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-foreground">{customer.plan}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{brl(customer.planPrice)}/mês</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", toneClass[accountStatusTone(customer.accountStatus)])}>
                          {customer.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 font-mono text-[11px]",
                            customer.status === "Online" ? "text-emerald-400" : "text-destructive",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              customer.status === "Online" ? "bg-emerald-400" : "bg-destructive",
                            )}
                          />
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-mono text-[11px]",
                            rx.tone === "ok" ? "text-emerald-400" : rx.tone === "warn" ? "text-amber-400" : "text-destructive",
                          )}
                        >
                          {customer.rx} dBm
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {customer.cto.name}
                        <br />
                        {customer.cto.pon}
                      </TableCell>
                      <TableCell>
                        {debt > 0 ? (
                          <span className="font-mono text-[11px] text-amber-400">{brl(debt)} em aberto</span>
                        ) : (
                          <span className="font-mono text-[11px] text-emerald-400">Em dia</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-[11px]">
                          Abrir 360°
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
