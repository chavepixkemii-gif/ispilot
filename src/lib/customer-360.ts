import { CUSTOMERS, openInvoiceTotal, type Customer } from "@/lib/customers";

/* ------------------------------- Tipos ------------------------------- */

export type PlanStatus = "Ativo" | "Inativo" | "Cancelado" | "Em retenção";

export type PppoeInfo = {
  login: string;
  password: string;
  status: "Online" | "Desconectado";
  uptime: string;
  ip: string;
  ipType: "Dinâmico" | "Fixo";
  suspensionRisk: boolean;
  nas: string;
};

export type TvCredential = { login: string; password: string; status: "Ativo" | "Suspenso"; screens: number };

export type CustomerPlan = {
  id: string;
  name: string;
  status: PlanStatus;
  speed: number;
  price: number;
  since: string;
  address: string;
  lat: number;
  lng: number;
  pppoe: PppoeInfo;
  tv?: TvCredential;
  retention?: { attempts: number; reason: string; contactLog: string[]; aiTips: string[]; offers: string[] };
};

export type ContactKind = "Celular / WhatsApp" | "Telefone fixo" | "E-mail";
export type Contact = {
  id: string;
  name: string;
  kind: ContactKind;
  value: string;
  category: "Titular" | "Financeiro" | "Autorizado" | "Técnico";
  gender: "Masculino" | "Feminino" | "Não informado";
  note?: string;
};

export type HistoryCategory =
  | "Instalação"
  | "Retirada de equipamento"
  | "Reclamação"
  | "Troca de endereço"
  | "Alteração de velocidade"
  | "Ligação telefônica"
  | "Observação";

export type HistoryEntry = {
  id: string;
  at: string;
  category: HistoryCategory;
  title: string;
  detail: string;
  author: string;
};

export type TicketSector =
  | "Suporte"
  | "Financeiro"
  | "Comercial"
  | "RH"
  | "Técnico"
  | "Agendamento"
  | "Vendas"
  | "Administrativo"
  | "Retenção"
  | "Cancelamento"
  | "Retirada de Equipamento";

export const TICKET_SECTORS: TicketSector[] = [
  "Suporte",
  "Financeiro",
  "Comercial",
  "RH",
  "Técnico",
  "Agendamento",
  "Vendas",
  "Administrativo",
  "Retenção",
  "Cancelamento",
  "Retirada de Equipamento",
];

export const TICKET_CATEGORIES = [
  "Sem Acesso",
  "Solicitação de Visita",
  "ONU Desconectada",
  "Dúvidas Técnicas",
  "Suporte",
  "Lentidão",
  "SeanetPlay",
  "Solicitação de Informações",
  "Rede Interna",
  "Outra",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export type CustomerTicket = {
  id: string;
  code: string;
  sector: TicketSector;
  category: TicketCategory;
  status: "Concluído" | "Em Resolução";
  planId: string;
  openedAt: string;
  operator: string;
  summary: string;
  solution?: string;
  channel?: "Resolvido via N1" | "Resolvido via WhatsApp";
  callRecording?: string | null;
  whatsappLink?: string;
};

export type RadiusSession = {
  id: string;
  ip: string;
  connectedAt: string;
  disconnectedAt: string | null;
  duration: string;
  down: number;
  up: number;
  lastIp: string;
  reason: "User-Request" | "Admin-Request" | "Lost-Carrier" | "NAS-Reboot" | "—";
};

export type RbTelemetry = {
  uptime: string;
  cpu: number;
  memory: number;
  temperature: number;
  board: string;
  routerOs: string;
  interfaces: Array<{ name: string; status: "up" | "down"; rx: string; tx: string }>;
  arp: Array<{ ip: string; mac: string; iface: string }>;
};

export type Equipment = {
  id: string;
  kind: "Roteador Wi-Fi" | "ONU" | "ONT" | "Decodificador / STB" | "Routerboard";
  brand: string;
  model: string;
  serial: string;
  mac: string;
  regime: "Comodato" | "Venda / Aluguel" | "Próprio";
  planId: string;
  rb?: RbTelemetry;
};

export type BillingWindow = { label: string; days: number; plan: number; extras: number };

export type Customer360 = {
  registry: {
    rg: string;
    birthDate: string;
    motherName: string;
    installedAt: string;
    billingAddress: string;
    contracts: Array<{ name: string; signedAt: string; kind: string }>;
    installationNotes: string;
    personType: "Pessoa Física" | "Pessoa Jurídica";
  };
  finance: {
    averageTicket: number;
    activePlans: number;
    revenueGenerated: number;
    openTotal: number;
    upcoming: number;
    overdue: number;
    installmentPlan: boolean;
    canSuspend: boolean;
    windows: BillingWindow[];
  };
  plans: CustomerPlan[];
  contacts: Contact[];
  history: HistoryEntry[];
  tickets: CustomerTicket[];
  sessions: RadiusSession[];
  equipment: Equipment[];
};

/* ----------------------------- Geradores ----------------------------- */

function hash(value: string) {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) % 100000;
  return total;
}

function rand(seed: number, index: number, max: number) {
  return ((seed * 9301 + index * 49297) % 233280) % max;
}

const OPERATORS = ["Bruna Alves (N1)", "Rafael Lima (N1)", "Camila Souza (N2)", "Diego Martins (NOC)"];

function makePlans(customer: Customer, seed: number): CustomerPlan[] {
  const fullAddress = `${customer.address.street}, ${customer.address.number} — ${customer.address.district}, ${customer.address.city} · CEP ${customer.address.zip}`;
  const online = customer.status === "Online";
  const hasTv = seed % 3 !== 0;

  const primary: CustomerPlan = {
    id: `${customer.id}-plan-1`,
    name: `COMBO SEAONE ${customer.planSpeed >= 700 ? "GB" : "FIBRA"} · ${customer.plan}`,
    status:
      customer.accountStatus === "Cancelado"
        ? "Cancelado"
        : customer.accountStatus === "Em redução"
          ? "Em retenção"
          : "Ativo",
    speed: customer.planSpeed,
    price: customer.planPrice,
    since: customer.contractSince,
    address: fullAddress,
    lat: customer.address.lat,
    lng: customer.address.lng,
    pppoe: {
      login: customer.pppoe,
      password: `S${seed}pp${customer.dueDay}`,
      status: online ? "Online" : "Desconectado",
      uptime: customer.uptime,
      ip: customer.ip,
      ipType: customer.planSpeed >= 700 ? "Fixo" : "Dinâmico",
      suspensionRisk: customer.financialStatus === "Em atraso",
      nas: customer.cto.olt,
    },
    ...(hasTv
      ? {
          tv: {
            login: `${customer.pppoe.split("@")[0]}.play`,
            password: `Play${1000 + (seed % 8999)}`,
            status: customer.financialStatus === "Em atraso" ? ("Suspenso" as const) : ("Ativo" as const),
            screens: 1 + (seed % 3),
          },
        }
      : {}),
    ...(customer.accountStatus === "Em redução"
      ? {
          retention: {
            attempts: 2,
            reason: "Alegou preço alto após oferta de concorrente no bairro.",
            contactLog: [
              "12/08 — Cliente ligou pedindo cancelamento, ofereceu-se desconto de 15% por 6 meses.",
              "14/08 — Cliente pediu prazo para pensar, retornar em 48 h.",
            ],
            aiTips: [
              `Reforce a estabilidade: ${customer.loyaltyMonths} meses sem incidentes críticos na ${customer.cto.name}.`,
              "Compare a latência média do plano gamer com a do concorrente (rádio) do bairro.",
              "Ofereça upgrade de velocidade mantendo a mensalidade atual por 6 meses.",
            ],
            offers: [
              `Upgrade para ${customer.planSpeed + 400} Mega mantendo R$ ${customer.planPrice.toFixed(2)}`,
              "Downgrade assistido para plano essencial com Wi-Fi 6",
              "Bônus de 2 meses de Seanet Play sem custo",
            ],
          },
        }
      : {}),
  };

  const plans: CustomerPlan[] = [primary];

  if (seed % 2 === 0) {
    plans.push({
      id: `${customer.id}-plan-2`,
      name: "COMBO SEAONE ESSENCIAL · 200 Mega",
      status: "Inativo",
      speed: 200,
      price: 69.9,
      since: "05/2022",
      address: `Rua Anexa, ${100 + (seed % 400)} — ${customer.address.district}, ${customer.address.city}`,
      lat: customer.address.lat + 0.004,
      lng: customer.address.lng - 0.003,
      pppoe: {
        login: `${customer.pppoe.split("@")[0]}.2@net`,
        password: `Ess${seed % 999}`,
        status: "Desconectado",
        uptime: "Sem sessão há 41 dias",
        ip: "—",
        ipType: "Dinâmico",
        suspensionRisk: false,
        nas: customer.cto.olt,
      },
    });
  }

  if (seed % 4 === 1) {
    plans.push({
      id: `${customer.id}-plan-3`,
      name: "SEAONE 100 Mega (contrato antigo)",
      status: "Cancelado",
      speed: 100,
      price: 59.9,
      since: "03/2019",
      address: `Rua Antiga, 45 — ${customer.address.district}, ${customer.address.city}`,
      lat: customer.address.lat - 0.006,
      lng: customer.address.lng + 0.005,
      pppoe: {
        login: `${customer.pppoe.split("@")[0]}.old@net`,
        password: "—",
        status: "Desconectado",
        uptime: "Contrato encerrado",
        ip: "—",
        ipType: "Dinâmico",
        suspensionRisk: false,
        nas: "—",
      },
    });
  }

  return plans;
}

function makeContacts(customer: Customer, seed: number): Contact[] {
  const first = customer.name.split(" ")[0] ?? customer.name;
  return [
    {
      id: `${customer.id}-ct-1`,
      name: customer.name,
      kind: "Celular / WhatsApp",
      value: customer.phone,
      category: "Titular",
      gender: seed % 2 === 0 ? "Masculino" : "Feminino",
      note: "Contato preferencial para avisos técnicos.",
    },
    {
      id: `${customer.id}-ct-2`,
      name: `${first} — residencial`,
      kind: "Telefone fixo",
      value: `+55 11 3${1000 + (seed % 8999)}-${2000 + (seed % 7999)}`,
      category: "Autorizado",
      gender: "Não informado",
    },
    {
      id: `${customer.id}-ct-3`,
      name: customer.name,
      kind: "E-mail",
      value: customer.email,
      category: "Financeiro",
      gender: "Não informado",
      note: "Recebe boleto e NFS-e.",
    },
  ];
}

function makeHistory(customer: Customer, seed: number): HistoryEntry[] {
  return [
    {
      id: `${customer.id}-h1`,
      at: `${String(customer.dueDay).padStart(2, "0")}/${customer.contractSince}`,
      category: "Instalação",
      title: "Nova instalação concluída",
      detail: `Ativação na ${customer.cto.name} porta ${customer.cto.port}, drop de ${20 + (seed % 60)} m.`,
      author: "Equipe Alfa",
    },
    {
      id: `${customer.id}-h2`,
      at: "02/2026",
      category: "Alteração de velocidade",
      title: `Upgrade para ${customer.planSpeed} Mega`,
      detail: "Alteração de perfil SLA aplicada na OLT e reprovisionamento OMCI.",
      author: "Comercial · Paula",
    },
    {
      id: `${customer.id}-h3`,
      at: "11/04/2026",
      category: "Reclamação",
      title: "Reclamação de lentidão no período noturno",
      detail: "Verificado congestionamento na PON, ajustado agendamento de backup do cliente.",
      author: OPERATORS[seed % OPERATORS.length]!,
    },
    {
      id: `${customer.id}-h4`,
      at: "27/06/2026",
      category: "Ligação telefônica",
      title: "Ligação recebida — 4 min 12 s",
      detail: "Cliente solicitou segunda via e confirmou dados cadastrais.",
      author: "Financeiro · Ramal 204",
    },
    ...(seed % 3 === 0
      ? [
          {
            id: `${customer.id}-h5`,
            at: "09/07/2026",
            category: "Troca de endereço" as HistoryCategory,
            title: "Mudança de endereço solicitada",
            detail: `Novo ponto no mesmo bairro (${customer.address.district}), viabilidade aprovada.`,
            author: "Agendamento · Léo",
          },
        ]
      : []),
    ...(customer.accountStatus === "Cancelado"
      ? [
          {
            id: `${customer.id}-h6`,
            at: "18/06/2026",
            category: "Retirada de equipamento" as HistoryCategory,
            title: "Retirada de ONU e roteador",
            detail: "Equipamentos recolhidos e baixados do inventário de comodato.",
            author: "Equipe Charlie",
          },
        ]
      : []),
  ];
}

function makeTickets(customer: Customer, seed: number, plans: CustomerPlan[]): CustomerTicket[] {
  const planId = plans[0]!.id;
  const categories = TICKET_CATEGORIES;
  const rows: CustomerTicket[] = [];
  const total = 5 + (seed % 4);

  for (let index = 0; index < total; index += 1) {
    const done = index !== 0 && index % 4 !== 0;
    const channel = index % 2 === 0 ? "Resolvido via N1" : "Resolvido via WhatsApp";
    const operator = OPERATORS[rand(seed, index, OPERATORS.length)]!;
    const hasCall = channel === "Resolvido via N1" ? (seed + index) % 5 !== 0 : false;
    rows.push({
      id: `${customer.id}-tk-${index}`,
      code: `AT-${40000 + seed + index * 13}`,
      sector: TICKET_SECTORS[rand(seed, index + 3, TICKET_SECTORS.length)]!,
      category: categories[rand(seed, index + 7, categories.length)]!,
      status: done ? "Concluído" : "Em Resolução",
      planId: index % 3 === 0 && plans[1] ? plans[1]!.id : planId,
      openedAt: `${String(1 + ((seed + index) % 28)).padStart(2, "0")}/0${1 + (index % 8)}/2026 ${String(8 + (index % 9)).padStart(2, "0")}:${String((seed + index * 7) % 60).padStart(2, "0")}`,
      operator,
      summary:
        index % 3 === 0
          ? "Cliente relatou queda intermitente durante a noite."
          : index % 3 === 1
            ? "Solicitação de informação sobre fatura e vencimento."
            : "Wi-Fi com alcance reduzido nos quartos do fundo.",
      ...(done
        ? {
            solution:
              index % 2 === 0
                ? "Reprovisionamento OMCI e troca de canal Wi-Fi 5 GHz. Testes de velocidade aprovados com o cliente."
                : "Orientado reposicionamento do roteador e enviado tutorial. Cliente confirmou normalização.",
            channel: channel as "Resolvido via N1" | "Resolvido via WhatsApp",
            callRecording: hasCall ? `REC-${900000 + seed + index}·${operator}` : null,
            ...(channel === "Resolvido via WhatsApp"
              ? {
                  whatsappLink: `https://wa.me/${customer.phone.replace(/\D/g, "")}?text=Protocolo%20AT-${40000 + seed + index * 13}`,
                }
              : {}),
          }
        : {}),
    });
  }
  return rows;
}

function makeSessions(customer: Customer, seed: number): RadiusSession[] {
  const online = customer.status === "Online";
  const rows: RadiusSession[] = [];
  const reasons: RadiusSession["reason"][] = ["User-Request", "Admin-Request", "Lost-Carrier", "NAS-Reboot"];

  if (online) {
    rows.push({
      id: `${customer.id}-s0`,
      ip: customer.ip,
      connectedAt: "14/08/2026 07:41:22",
      disconnectedAt: null,
      duration: customer.uptime,
      down: 42.7 + (seed % 40),
      up: 6.1 + (seed % 9),
      lastIp: customer.ip,
      reason: "—",
    });
  } else {
    rows.push({
      id: `${customer.id}-s0`,
      ip: customer.ip,
      connectedAt: "15/08/2026 03:12:47",
      disconnectedAt: "15/08/2026 09:58:03",
      duration: "6 h 45 min",
      down: 12.4 + (seed % 20),
      up: 2.2 + (seed % 5),
      lastIp: customer.ip,
      reason: customer.accountStatus === "Bloqueado" ? "Admin-Request" : "Lost-Carrier",
    });
  }

  for (let index = 1; index < 8; index += 1) {
    rows.push({
      id: `${customer.id}-s${index}`,
      ip: `177.12.${(seed + index) % 200}.${(seed * index) % 250}`,
      connectedAt: `${String(14 - index).padStart(2, "0")}/08/2026 ${String(6 + (index % 12)).padStart(2, "0")}:${String((seed + index) % 60).padStart(2, "0")}:11`,
      disconnectedAt: `${String(14 - index).padStart(2, "0")}/08/2026 ${String(18 + (index % 5)).padStart(2, "0")}:${String((seed + index * 3) % 60).padStart(2, "0")}:52`,
      duration: `${8 + (index % 14)} h ${(seed + index) % 59} min`,
      down: 8 + ((seed + index * 11) % 90),
      up: 1 + ((seed + index * 3) % 14),
      lastIp: `177.12.${(seed + index + 1) % 200}.${(seed * (index + 2)) % 250}`,
      reason: reasons[rand(seed, index, reasons.length)]!,
    });
  }

  return rows;
}

function makeEquipment(customer: Customer, seed: number, plans: CustomerPlan[]): Equipment[] {
  const planId = plans[0]!.id;
  const list: Equipment[] = customer.devices.map((device, index) => ({
    id: device.id,
    kind: device.kind === "onu" ? "ONU" : device.kind === "mesh" ? "Roteador Wi-Fi" : "Roteador Wi-Fi",
    brand: device.brand,
    model: device.model,
    serial: `SN${700000 + seed + index * 37}`,
    mac: device.mac,
    regime: index === 0 ? "Comodato" : seed % 2 === 0 ? "Venda / Aluguel" : "Próprio",
    planId,
  }));

  if (plans[0]!.tv) {
    list.push({
      id: `${customer.id}-stb`,
      kind: "Decodificador / STB",
      brand: "Seanet Play",
      model: "SP-Box 4K",
      serial: `STB${400000 + seed}`,
      mac: `AA:BB:${String(seed % 90).padStart(2, "0")}:11:${String((seed * 3) % 90).padStart(2, "0")}:0F`,
      regime: "Comodato",
      planId,
    });
  }

  if (seed % 2 === 0 || customer.planSpeed >= 700) {
    list.push({
      id: `${customer.id}-rb`,
      kind: "Routerboard",
      brand: "MikroTik",
      model: seed % 2 === 0 ? "hEX S (RB760iGS)" : "RB4011iGS+",
      serial: `RB${880000 + seed}`,
      mac: `48:8F:${String(seed % 90).padStart(2, "0")}:A1:${String((seed * 7) % 90).padStart(2, "0")}:20`,
      regime: "Próprio",
      planId,
      rb: {
        uptime: `${3 + (seed % 40)}d ${seed % 24}h ${seed % 59}m`,
        cpu: 8 + (seed % 55),
        memory: 30 + (seed % 50),
        temperature: 38 + (seed % 18),
        board: seed % 2 === 0 ? "hEX S" : "RB4011",
        routerOs: `7.${10 + (seed % 6)}.2 (stable)`,
        interfaces: [
          { name: "ether1-WAN (PPPoE)", status: customer.status === "Online" ? "up" : "down", rx: `${customer.download} Mbps`, tx: `${customer.upload} Mbps` },
          { name: "ether2-LAN", status: "up", rx: `${18 + (seed % 40)} Mbps`, tx: `${4 + (seed % 12)} Mbps` },
          { name: "ether3-LAN", status: seed % 3 === 0 ? "down" : "up", rx: "0.4 Mbps", tx: "0.2 Mbps" },
          { name: "bridge-local", status: "up", rx: `${30 + (seed % 60)} Mbps`, tx: `${9 + (seed % 20)} Mbps` },
        ],
        arp: [
          { ip: "192.168.88.10", mac: "3C:22:FB:11:0A:5D", iface: "bridge-local" },
          { ip: "192.168.88.14", mac: "F4:0F:24:98:2C:71", iface: "bridge-local" },
          { ip: "192.168.88.22", mac: "9C:B6:D0:47:1E:33", iface: "ether2-LAN" },
          { ip: "192.168.88.31", mac: "A8:5E:45:0B:77:C2", iface: "bridge-local" },
        ],
      },
    });
  }

  return list;
}

function build(customer: Customer): Customer360 {
  const seed = hash(customer.id);
  const plans = makePlans(customer, seed);
  const activePlans = plans.filter((plan) => plan.status === "Ativo");
  const open = customer.invoices.filter((invoice) => invoice.status !== "Pago");
  const overdue = open.filter((invoice) => invoice.status === "Vencido").reduce((total, invoice) => total + invoice.amount, 0);
  const openTotal = openInvoiceTotal(customer);
  const extras = plans[0]!.tv ? 29.9 : 0;

  return {
    registry: {
      rg: customer.document.includes("/") ? "—" : `${20 + (seed % 60)}.${100 + (seed % 899)}.${100 + (seed % 899)}-${seed % 10}`,
      birthDate: customer.document.includes("/")
        ? `Abertura ${String(1 + (seed % 28)).padStart(2, "0")}/0${1 + (seed % 9)}/201${seed % 9}`
        : `${String(1 + (seed % 28)).padStart(2, "0")}/0${1 + (seed % 9)}/19${60 + (seed % 39)}`,
      motherName: customer.document.includes("/") ? "—" : "Marlene Aparecida dos Santos",
      installedAt: customer.contractSince,
      billingAddress: `${customer.address.street}, ${customer.address.number} — ${customer.address.district} · CEP ${customer.address.zip} · ${customer.address.city}`,
      contracts: [
        { name: `Contrato de adesão ${customer.contractId}`, signedAt: customer.contractSince, kind: "Assinatura digital" },
        { name: "Termo de comodato de equipamentos", signedAt: customer.contractSince, kind: "Assinatura digital" },
        { name: "Aditivo de fidelidade 12 meses", signedAt: "02/05/2026", kind: "Assinatura digital" },
      ],
      installationNotes:
        "Instalação original com passagem aérea pelo poste frontal. Cliente solicitou roteador no hall de entrada. Tomada compartilhada com nobreak.",
      personType: customer.document.includes("/") ? "Pessoa Jurídica" : "Pessoa Física",
    },
    finance: {
      averageTicket: customer.planPrice + extras / 2,
      activePlans: Math.max(activePlans.length, 1),
      revenueGenerated: customer.planPrice * Math.max(customer.loyaltyMonths, 6),
      openTotal,
      upcoming: Math.max(openTotal - overdue, 0),
      overdue,
      installmentPlan: customer.financialStatus === "Em atraso" && seed % 2 === 0,
      canSuspend: customer.financialStatus === "Em atraso" && customer.accountStatus !== "Bloqueado",
      windows: [
        { label: "Últimos 30 dias", days: 30, plan: customer.planPrice, extras },
        { label: "Últimos 60 dias", days: 60, plan: customer.planPrice * 2, extras: extras * 2 },
        { label: "Últimos 90 dias", days: 90, plan: customer.planPrice * 3, extras: extras * 3 },
        { label: "Últimos 12 meses", days: 365, plan: customer.planPrice * 12, extras: extras * 12 },
      ],
    },
    plans,
    contacts: makeContacts(customer, seed),
    history: makeHistory(customer, seed),
    tickets: makeTickets(customer, seed, plans),
    sessions: makeSessions(customer, seed),
    equipment: makeEquipment(customer, seed, plans),
  };
}

const CACHE = new Map<string, Customer360>();

export function customer360(customer: Customer): Customer360 {
  const cached = CACHE.get(customer.id);
  if (cached) return cached;
  const built = build(customer);
  CACHE.set(customer.id, built);
  return built;
}

export function findCustomer(id: string) {
  return CUSTOMERS.find((customer) => customer.id === id) ?? null;
}

export function ticketsByStatus(tickets: CustomerTicket[]) {
  const done = tickets.filter((ticket) => ticket.status === "Concluído").length;
  return [
    { name: "Concluído", value: done, color: "#22c55e" },
    { name: "Em Resolução", value: tickets.length - done, color: "#38bdf8" },
  ];
}

export function ticketsByCategory(tickets: CustomerTicket[]) {
  return TICKET_CATEGORIES.map((category) => ({
    name: category,
    value: tickets.filter((ticket) => ticket.category === category).length,
  })).filter((row) => row.value > 0);
}
