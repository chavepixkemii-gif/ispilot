import { motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  Contact2,
  Gauge,
  HardDrive,
  History,
  LayoutDashboard,
  Signal,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tone } from "@/components/ispilot/customer-360/shared";
import {
  CadastroModule,
  ContatosModule,
  DashboardModule,
  HistoricoModule,
} from "@/components/ispilot/customer-360/modules-overview";
import {
  AtendimentosModule,
  EquipamentosModule,
  ExtratosModule,
  PlanosModule,
} from "@/components/ispilot/customer-360/modules-service";
import { customer360 } from "@/lib/customer-360";
import { setTabModule, type CustomerTab, type ModuleId } from "@/lib/customer-tabs";
import { accountStatusTone, rxLevel, type Customer } from "@/lib/customers";
import { cn } from "@/lib/utils";

const MODULES: Array<{ id: ModuleId; label: string; hint: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", hint: "Visão 360°", icon: LayoutDashboard },
  { id: "cadastro", label: "Cadastro", hint: "Dados e contratos", icon: UserRound },
  { id: "contatos", label: "Contatos", hint: "Vínculo com O.S.", icon: Contact2 },
  { id: "historico", label: "Histórico", hint: "Timeline completa", icon: History },
  { id: "planos", label: "Planos", hint: "PPPoE · TV · retenção", icon: Wallet },
  { id: "atendimentos", label: "Atendimentos", hint: "Protocolos e trava", icon: ClipboardList },
  { id: "extratos", label: "Extratos", hint: "RADIUS e quedas", icon: Activity },
  { id: "equipamentos", label: "Equipamentos", hint: "Telemetria RB", icon: HardDrive },
];

export function CustomerWorkspace({
  customer,
  tab,
  canEditRegistry,
}: {
  customer: Customer;
  tab: CustomerTab;
  canEditRegistry: boolean;
}) {
  const data = customer360(customer);
  const rx = rxLevel(customer.rx);
  const statusTone = accountStatusTone(customer.accountStatus);
  const props = { customer, data, tab, canEditRegistry };

  return (
    <div className="grid gap-4 lg:grid-cols-[212px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-14 lg:self-start">
        <div className="rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-xl">
          <div className="px-2 pb-2 pt-1">
            <p className="truncate text-xs font-semibold text-foreground">{customer.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{customer.contractId}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="outline" className={cn("text-[9px]", tone[statusTone])}>
                {customer.accountStatus}
              </Badge>
              <Badge variant="outline" className={cn("text-[9px]", tone[rx.tone])}>
                <Signal className="mr-1 size-2.5" />
                {customer.rx} dBm
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[9px]", customer.status === "Online" ? tone.ok : tone.critical)}
              >
                <Gauge className="mr-1 size-2.5" />
                {customer.status}
              </Badge>
            </div>
          </div>
          <nav className="space-y-0.5">
            {MODULES.map((module) => {
              const active = tab.module === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setTabModule(tab.id, module.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                    active ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <module.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium">{module.label}</span>
                    <span className="block truncate text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                      {module.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <motion.section
        key={`${tab.id}-${tab.module}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="min-w-0 space-y-4"
      >
        {tab.module === "dashboard" ? <DashboardModule {...props} /> : null}
        {tab.module === "cadastro" ? <CadastroModule {...props} /> : null}
        {tab.module === "contatos" ? <ContatosModule {...props} /> : null}
        {tab.module === "historico" ? <HistoricoModule {...props} /> : null}
        {tab.module === "planos" ? <PlanosModule {...props} /> : null}
        {tab.module === "atendimentos" ? <AtendimentosModule {...props} /> : null}
        {tab.module === "extratos" ? <ExtratosModule {...props} /> : null}
        {tab.module === "equipamentos" ? <EquipamentosModule {...props} /> : null}
      </motion.section>
    </div>
  );
}
