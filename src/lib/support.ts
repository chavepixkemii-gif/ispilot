export type SectorId = "suporte" | "comercial" | "financeiro" | "retencao";

export const SECTORS: Array<{ id: SectorId; label: string; allowed: boolean }> = [
  { id: "suporte", label: "Suporte Técnico / NOC", allowed: true },
  { id: "comercial", label: "Comercial / Vendas", allowed: false },
  { id: "financeiro", label: "Financeiro & Cobrança", allowed: false },
  { id: "retencao", label: "Retenção / Cancelamento", allowed: false },
];

export const CURRENT_AGENT = { id: "ag-1", name: "Você (Op. Suporte N1)" };

export type TicketMessage = { id: string; from: "customer" | "agent" | "system"; content: string; at: string };

export type Ticket = {
  id: string;
  protocol: string;
  sector: SectorId;
  customerName: string;
  contractId: string;
  plan: string;
  pppoe: string;
  ip: string;
  rx: number;
  tx: number;
  status: "Online" | "Offline";
  address: string;
  cto: string;
  waitingMinutes: number;
  ownerId: string | null;
  ownerName: string | null;
  channel: "WhatsApp" | "Telegram" | "Widget";
  subject: string;
  physicalFailure: boolean;
  messages: TicketMessage[];
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "tk-1",
    protocol: "#48201",
    sector: "suporte",
    customerName: "Carlos Andrade",
    contractId: "CT-2022-1187",
    plan: "500 Mega Turbo",
    pppoe: "carlos.andrade@net",
    ip: "100.94.31.77",
    rx: -32.4,
    tx: 2.2,
    status: "Offline",
    address: "Rua Bento Freitas, 210 — Centro, São Paulo / SP",
    cto: "CTO-CENTRO-B04 · porta 9/16 · OLT-CENTRO-01 PON 0/1/2",
    waitingMinutes: 3,
    ownerId: null,
    ownerName: null,
    channel: "WhatsApp",
    subject: "Sem internet desde a madrugada",
    physicalFailure: true,
    messages: [
      { id: "m1", from: "customer", at: "08:41", content: "Bom dia, estou sem internet desde a madrugada. A luz vermelha do aparelho está acesa." },
      { id: "m2", from: "customer", at: "08:42", content: "Um caminhão passou puxando o cabo na esquina ontem à noite, acho que arrebentou." },
      { id: "m3", from: "system", at: "08:42", content: "Telemetria: ONU sem resposta (LOS), RX -32.4 dBm na última leitura." },
    ],
  },
  {
    id: "tk-2",
    protocol: "#48202",
    sector: "suporte",
    customerName: "Padaria Pão Quente",
    contractId: "CT-2021-0455",
    plan: "700 Mega Empresarial",
    pppoe: "paoquente@net",
    ip: "177.12.9.14",
    rx: -30.1,
    tx: 2.5,
    status: "Offline",
    address: "Av. São João, 980 — Centro, São Paulo / SP",
    cto: "CTO-CENTRO-B04 · porta 12/16 · OLT-CENTRO-01 PON 0/1/2",
    waitingMinutes: 11,
    ownerId: null,
    ownerName: null,
    channel: "WhatsApp",
    subject: "Maquininha de cartão sem conexão",
    physicalFailure: true,
    messages: [
      { id: "m4", from: "customer", at: "08:30", content: "Nossa maquininha não conecta e o movimento está alto. Preciso de urgência!" },
      { id: "m5", from: "system", at: "08:31", content: "Cliente pertence à árvore afetada pelo incidente LINK LOSS PON 02." },
    ],
  },
  {
    id: "tk-3",
    protocol: "#48203",
    sector: "suporte",
    customerName: "Renata Lopes",
    contractId: "CT-2023-7712",
    plan: "400 Mega Casa",
    pppoe: "renata.lopes@net",
    ip: "177.12.55.40",
    rx: -29.1,
    tx: 2.3,
    status: "Online",
    address: "Rua das Acácias, 45 — Jardim das Flores, São Paulo / SP",
    cto: "CTO-FLORES-07 · porta 4/16 · OLT-FLORES-02 PON 0/1/7",
    waitingMinutes: 0,
    ownerId: "ag-1",
    ownerName: "Você (Op. Suporte N1)",
    channel: "WhatsApp",
    subject: "Wi-Fi lento nos quartos",
    physicalFailure: false,
    messages: [
      { id: "m6", from: "customer", at: "09:02", content: "O Wi-Fi está muito lento no quarto, no roteador funciona bem." },
      { id: "m7", from: "agent", at: "09:04", content: "Oi Renata! Vou verificar a cobertura e o canal do seu Wi-Fi agora mesmo." },
    ],
  },
  {
    id: "tk-4",
    protocol: "#48204",
    sector: "suporte",
    customerName: "Eduardo Prado",
    contractId: "CT-2024-3390",
    plan: "800 Mega Fibra",
    pppoe: "eduardo.prado@net",
    ip: "177.12.61.203",
    rx: -23.2,
    tx: 2.0,
    status: "Online",
    address: "Rua Voluntários, 1180 — Zona Norte, São Paulo / SP",
    cto: "CTO-NORTE-09 · porta 2/16 · POP NORTE PON 0/2/9",
    waitingMinutes: 6,
    ownerId: null,
    ownerName: null,
    channel: "Widget",
    subject: "Quer liberar porta para CFTV",
    physicalFailure: false,
    messages: [
      { id: "m8", from: "customer", at: "09:15", content: "Preciso liberar uma porta para acessar minhas câmeras de fora de casa." },
    ],
  },
  {
    id: "tk-5",
    protocol: "#48205",
    sector: "comercial",
    customerName: "Studio Vitta",
    contractId: "CT-2025-0021",
    plan: "600 Mega Empresarial",
    pppoe: "studiovitta@net",
    ip: "177.12.88.9",
    rx: -26.4,
    tx: 2.1,
    status: "Online",
    address: "Rua Girassol, 77 — Vila Nova, São Paulo / SP",
    cto: "CTO-VILA-12 · porta 8/16 · OLT-VILA-03 PON 0/3/12",
    waitingMinutes: 2,
    ownerId: null,
    ownerName: null,
    channel: "WhatsApp",
    subject: "Upgrade de plano para 1 Giga",
    physicalFailure: false,
    messages: [{ id: "m9", from: "customer", at: "09:20", content: "Quero saber o valor do upgrade para 1 Giga." }],
  },
];

export const CLOSE_REASONS = [
  "Resolvido remotamente (N1)",
  "Resolvido com O.S. de campo",
  "Orientação ao cliente",
  "Problema massivo — incidente NOC",
  "Cliente desistiu do atendimento",
];

export const CLASSIFICATIONS = [
  "Suporte técnico — Sem conexão",
  "Suporte técnico — Lentidão",
  "Suporte técnico — Wi-Fi",
  "Rompimento de fibra",
  "Dúvida / Informação",
  "Financeiro",
];

/* ------------------------------- Ordens de serviço ------------------------------ */

export const OS_TYPES = [
  "Reparo de Drop (cabo partido)",
  "Troca de ONU",
  "Reparo de CTO / Splitter",
  "Instalação de ponto adicional",
  "Vistoria técnica",
];

export const OS_PRIORITIES = ["Alta", "Média", "Baixa"] as const;

export const OS_TEAMS = [
  "Equipe Alfa — Centro",
  "Equipe Bravo — Zona Norte",
  "Equipe Charlie — Vila Nova",
  "Equipe Fibra (emenda)",
];

export type ServiceOrderDraft = {
  type: string;
  priority: (typeof OS_PRIORITIES)[number];
  address: string;
  diagnosis: string;
  date: string;
  time: string;
  team: string;
  notifyCustomer: boolean;
};

export function aiSuggestServiceOrder(ticket: Ticket): ServiceOrderDraft {
  const critical = ticket.rx <= -30 || ticket.status === "Offline";
  const today = new Date();
  const iso = new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10);
  return {
    type: critical ? OS_TYPES[0]! : OS_TYPES[4]!,
    priority: critical ? "Alta" : "Média",
    address: ticket.address,
    diagnosis: [
      `Protocolo ${ticket.protocol} — ${ticket.customerName} (${ticket.contractId}).`,
      `Status Radius: ${ticket.status}. Sinal óptico: RX ${ticket.rx} dBm / TX ${ticket.tx} dBm.`,
      `Estrutura: ${ticket.cto}.`,
      critical
        ? "Diagnóstico da IA: sinal fora de faixa operacional com indício de ruptura no cabo drop. Necessário reparo físico com fusão e recertificação da porta na CTO."
        : "Diagnóstico da IA: sinal dentro da faixa. Sugerida vistoria para validar cobertura interna e cabeamento do cliente.",
      `Relato do cliente: "${ticket.messages.find((message) => message.from === "customer")?.content ?? "—"}"`,
    ].join("\n"),
    date: iso,
    time: critical ? "08:00" : "14:00",
    team: critical ? OS_TEAMS[3]! : OS_TEAMS[0]!,
    notifyCustomer: true,
  };
}

/* --------------------------------- Produtividade -------------------------------- */

export type PeriodId = "hoje" | "ontem" | "7d" | "mes" | "custom";

export const PERIODS: Array<{ id: PeriodId; label: string }> = [
  { id: "hoje", label: "Hoje" },
  { id: "ontem", label: "Ontem" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "mes", label: "Mês atual" },
  { id: "custom", label: "Intervalo personalizado" },
];

export type AgentPerformance = {
  id: string;
  name: string;
  sector: string;
  handled: number;
  orders: number;
  rating: number;
};

export type PeriodMetrics = {
  handled: number;
  tme: string;
  tma: string;
  n1Rate: number;
  orders: number;
  series: Array<{ label: string; atendimentos: number; os: number }>;
  agents: AgentPerformance[];
};

const AGENT_BASE: Array<Omit<AgentPerformance, "handled" | "orders">> = [
  { id: "ag-1", name: "Você (Op. Suporte N1)", sector: "Suporte Técnico", rating: 4.8 },
  { id: "ag-2", name: "Bruna Carvalho", sector: "Suporte Técnico", rating: 4.9 },
  { id: "ag-3", name: "Diego Matos", sector: "NOC", rating: 4.6 },
  { id: "ag-4", name: "Priscila Souza", sector: "Financeiro", rating: 4.4 },
  { id: "ag-5", name: "Rafael Tavares", sector: "Comercial", rating: 4.7 },
  { id: "ag-6", name: "Letícia Duarte", sector: "Retenção", rating: 4.5 },
];

const FACTOR: Record<PeriodId, number> = { hoje: 1, ontem: 1.1, "7d": 6.4, mes: 24, custom: 12 };

export function metricsFor(period: PeriodId): PeriodMetrics {
  const factor = FACTOR[period];
  const handled = Math.round(148 * factor);
  const orders = Math.round(19 * factor);
  const labels =
    period === "hoje" || period === "ontem"
      ? ["08h", "10h", "12h", "14h", "16h", "18h", "20h"]
      : period === "7d"
        ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        : ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];

  const series = labels.map((label, index) => ({
    label,
    atendimentos: Math.round((handled / labels.length) * (0.72 + ((index * 7) % 5) * 0.13)),
    os: Math.round((orders / labels.length) * (0.6 + ((index * 3) % 4) * 0.22)),
  }));

  const agents = AGENT_BASE.map((agent, index) => ({
    ...agent,
    handled: Math.round((handled / AGENT_BASE.length) * (0.7 + ((index * 5) % 6) * 0.11)),
    orders: Math.round((orders / AGENT_BASE.length) * (0.55 + ((index * 4) % 5) * 0.2)),
  }));

  return {
    handled,
    orders,
    tme: period === "hoje" ? "2 min 41 s" : period === "ontem" ? "3 min 12 s" : "2 min 58 s",
    tma: period === "hoje" ? "7 min 05 s" : period === "ontem" ? "8 min 22 s" : "7 min 48 s",
    n1Rate: period === "hoje" ? 87 : period === "ontem" ? 82 : 84,
    series,
    agents,
  };
}
