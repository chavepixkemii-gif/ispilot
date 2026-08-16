export type CustomerStatus = "Online" | "Offline";

export type AccountStatus = "Ativo" | "Bloqueado" | "Cancelado" | "Em redução";

export const ACCOUNT_STATUSES: AccountStatus[] = ["Ativo", "Bloqueado", "Cancelado", "Em redução"];

export type CustomerDevice = {
  id: string;
  kind: "onu" | "mesh" | "router";
  model: string;
  brand: string;
  firmware: string;
  mac: string;
};

export type CustomerChatMessage = {
  id: string;
  from: "agent" | "customer";
  content: string;
  at: string;
};

export type Invoice = {
  id: string;
  reference: string;
  dueDate: string;
  amount: number;
  status: "Pago" | "Em aberto" | "Vencido";
  method: "PIX" | "Boleto" | "Cartão de crédito";
  nfse: string;
};

export type CustomerOrder = {
  id: string;
  code: string;
  type: string;
  status: "Aberta" | "Em execução" | "Concluída" | "Cancelada";
  openedAt: string;
  team: string;
  notes: string;
  photos: number;
};

export type RadiusLog = { at: string; event: string; detail: string };

export type BandwidthPoint = { label: string; down: number; up: number };

export type Customer = {
  id: string;
  contractId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  plan: string;
  planSpeed: number;
  planPrice: number;
  accountStatus: AccountStatus;
  financialStatus: "Adimplente" | "Em atraso";
  status: CustomerStatus;
  pppoe: string;
  ip: string;
  rx: number;
  tx: number;
  mac: string;
  uptime: string;
  download: number;
  upload: number;
  loyaltyMonths: number;
  contractSince: string;
  dueDay: number;
  cto: { name: string; port: number; totalPorts: number; olt: string; pon: string; lat: number; lng: number };
  address: { street: string; number: string; district: string; complement: string; zip: string; city: string; lat: number; lng: number };
  devices: CustomerDevice[];
  chat: CustomerChatMessage[];
  invoices: Invoice[];
  orders: CustomerOrder[];
  radiusLogs: RadiusLog[];
  bandwidth: BandwidthPoint[];
  upsell: string[];
  commercialNotes: Array<{ at: string; content: string }>;
};

function bandwidth(peakDown: number, peakUp: number): BandwidthPoint[] {
  return ["00h", "04h", "08h", "12h", "16h", "20h", "23h"].map((label, index) => ({
    label,
    down: Math.round(peakDown * [0.18, 0.08, 0.34, 0.62, 0.78, 1, 0.55][index]!),
    up: Math.round(peakUp * [0.2, 0.1, 0.4, 0.6, 0.8, 1, 0.5][index]!),
  }));
}

type Seed = {
  id: string;
  contractId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  plan: string;
  planSpeed: number;
  planPrice: number;
  accountStatus: AccountStatus;
  status: CustomerStatus;
  rx: number;
  tx: number;
  mac: string;
  ip: string;
  uptime: string;
  download: number;
  upload: number;
  loyaltyMonths: number;
  contractSince: string;
  dueDay: number;
  cto: Customer["cto"];
  address: Customer["address"];
  devices: CustomerDevice[];
  openInvoices: number;
  overdue?: boolean;
  orders?: CustomerOrder[];
  chat?: CustomerChatMessage[];
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function invoicesFor(seed: Seed): Invoice[] {
  const months = ["03/2026", "04/2026", "05/2026", "06/2026", "07/2026", "08/2026"];
  return months.map((reference, index) => {
    const open = index >= months.length - seed.openInvoices;
    return {
      id: `${seed.id}-inv-${index}`,
      reference,
      dueDate: `${String(seed.dueDay).padStart(2, "0")}/${reference}`,
      amount: money(seed.planPrice),
      status: open ? (seed.overdue && index === months.length - seed.openInvoices ? "Vencido" : "Em aberto") : "Pago",
      method: index % 3 === 0 ? "PIX" : index % 3 === 1 ? "Boleto" : "Cartão de crédito",
      nfse: `NFS-e ${21000 + index * 7 + seed.dueDay}`,
    };
  });
}

function build(seed: Seed): Customer {
  const anyOverdue = seed.openInvoices > 0 && Boolean(seed.overdue);
  return {
    ...seed,
    financialStatus: anyOverdue ? "Em atraso" : "Adimplente",
    pppoe: `${seed.name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").trim().split(" ").slice(0, 2).join(".")}@net`,
    invoices: invoicesFor(seed),
    orders: seed.orders ?? [],
    chat: seed.chat ?? [],
    radiusLogs: [
      { at: "08:12:04", event: "Access-Accept", detail: `Framed-IP ${seed.ip} · NAS ${seed.cto.olt}` },
      { at: "08:11:58", event: "Access-Request", detail: `PPPoE ${seed.mac} · porta ${seed.cto.port}` },
      {
        at: "07:44:31",
        event: seed.status === "Online" ? "Interim-Update" : "Accounting-Stop",
        detail: seed.status === "Online" ? "Sessão estável, sem reautenticação" : "Motivo: Lost-Carrier (LOS na ONU)",
      },
    ],
    bandwidth: bandwidth(Math.max(seed.download, 40), Math.max(seed.upload, 8)),
    upsell:
      seed.planSpeed >= 700
        ? ["IP fixo dedicado", "Wi-Fi 6 Mesh adicional", "Backup 4G empresarial"]
        : ["Upgrade para 1 Giga", "Ponto Mesh adicional", "Streaming parceiro"],
    commercialNotes: [
      { at: "12/07/2026", content: "Cliente demonstrou interesse em ponto Mesh adicional para o segundo andar." },
      { at: "02/05/2026", content: "Renovação contratual assinada digitalmente (aditivo de fidelidade 12 meses)." },
    ],
  };
}

const SEEDS: Seed[] = [
  {
    id: "cli-joao",
    contractId: "CT-2024-8891",
    name: "João Silva",
    document: "482.113.907-55",
    phone: "+55 11 98812-4477",
    email: "joao.silva@email.com",
    plan: "600 Mega Fibra Gamer",
    planSpeed: 600,
    planPrice: 129.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -27.8,
    tx: 2.1,
    mac: "48:8F:5A:11:22:33",
    ip: "177.12.44.89",
    uptime: "14 dias, 06 horas conectado",
    download: 145,
    upload: 12,
    loyaltyMonths: 22,
    contractSince: "03/2024",
    dueDay: 10,
    cto: { name: "CTO-FLORES-04", port: 3, totalPorts: 16, olt: "OLT-FLORES-02", pon: "PON 0/1/4", lat: -23.5562, lng: -46.6602 },
    address: { street: "Rua das Flores", number: "482", district: "Centro", complement: "Casa 2 — fundos", zip: "01310-000", city: "São Paulo / SP", lat: -23.5602, lng: -46.6544 },
    devices: [
      { id: "dev-1", kind: "onu", brand: "Huawei", model: "HG8145V5", firmware: "V5R020C10S115", mac: "48:8F:5A:11:22:33" },
      { id: "dev-2", kind: "mesh", brand: "ZTE", model: "Mesh H196A", firmware: "V9.0.10P3N2", mac: "9C:A2:F4:88:19:0C" },
    ],
    openInvoices: 1,
    orders: [
      { id: "os-1", code: "OS-91204", type: "Instalação inicial", status: "Concluída", openedAt: "12/03/2024", team: "Equipe Alfa — Centro", notes: "Instalação com 32 m de drop e roteador do cliente.", photos: 4 },
      { id: "os-2", code: "OS-98833", type: "Troca de ONU", status: "Concluída", openedAt: "08/01/2026", team: "Equipe Alfa — Centro", notes: "ONU antiga com porta LAN queimada.", photos: 2 },
    ],
    chat: [
      { id: "m1", from: "customer", at: "09:12", content: "Bom dia, minha internet está caindo desde ontem à noite." },
      { id: "m2", from: "agent", at: "09:14", content: "Bom dia, João! Já estou verificando o sinal da sua fibra por aqui." },
    ],
  },
  {
    id: "cli-maria",
    contractId: "CT-2023-4410",
    name: "Maria Fernandes",
    document: "701.884.223-10",
    phone: "+55 11 97744-1180",
    email: "maria.fernandes@email.com",
    plan: "300 Mega Fibra Casa",
    planSpeed: 300,
    planPrice: 89.9,
    accountStatus: "Bloqueado",
    status: "Offline",
    rx: -19.4,
    tx: 2.6,
    mac: "B0:4E:26:7A:C1:9F",
    ip: "100.94.18.203",
    uptime: "Desconectado há 3 horas",
    download: 0,
    upload: 0,
    loyaltyMonths: 34,
    contractSince: "10/2023",
    dueDay: 5,
    cto: { name: "CTO-CENTRO-12", port: 6, totalPorts: 16, olt: "OLT-ZTE-02", pon: "PON 0/2/7", lat: -23.5471, lng: -46.6398 },
    address: { street: "Av. Paulista", number: "1105", district: "Bela Vista", complement: "Apto 71", zip: "01311-200", city: "São Paulo / SP", lat: -23.5505, lng: -46.6455 },
    devices: [
      { id: "dev-3", kind: "onu", brand: "Nokia", model: "G-1425G-A", firmware: "3FE48548IJHK", mac: "B0:4E:26:7A:C1:9F" },
      { id: "dev-4", kind: "router", brand: "TP-Link", model: "Deco X50", firmware: "1.2.7 Build 240311", mac: "3C:84:6A:2D:70:11" },
    ],
    openInvoices: 2,
    overdue: true,
    orders: [{ id: "os-3", code: "OS-99120", type: "Vistoria técnica", status: "Cancelada", openedAt: "22/07/2026", team: "Equipe Bravo — Zona Norte", notes: "Cancelada por bloqueio financeiro.", photos: 0 }],
    chat: [{ id: "m3", from: "customer", at: "14:02", content: "Preciso da segunda via do boleto, por favor." }],
  },
  {
    id: "cli-carlos",
    contractId: "CT-2022-1187",
    name: "Carlos Andrade",
    document: "338.909.114-22",
    phone: "+55 11 99120-8841",
    email: "carlos.andrade@email.com",
    plan: "500 Mega Turbo",
    planSpeed: 500,
    planPrice: 109.9,
    accountStatus: "Ativo",
    status: "Offline",
    rx: -32.4,
    tx: 2.2,
    mac: "AC:84:C6:31:0D:12",
    ip: "100.94.31.77",
    uptime: "Desconectado há 6 horas (LOS)",
    download: 0,
    upload: 0,
    loyaltyMonths: 48,
    contractSince: "05/2022",
    dueDay: 15,
    cto: { name: "CTO-CENTRO-B04", port: 9, totalPorts: 16, olt: "OLT-CENTRO-01", pon: "PON 0/1/2", lat: -23.5563, lng: -46.6497 },
    address: { street: "Rua Bento Freitas", number: "210", district: "Centro", complement: "Sobrado", zip: "01220-010", city: "São Paulo / SP", lat: -23.5571, lng: -46.6512 },
    devices: [{ id: "dev-5", kind: "onu", brand: "FiberHome", model: "AN5506-04-F", firmware: "RP2669", mac: "AC:84:C6:31:0D:12" }],
    openInvoices: 1,
    orders: [{ id: "os-4", code: "OS-99341", type: "Reparo de Drop (cabo partido)", status: "Em execução", openedAt: "hoje 08:50", team: "Equipe Fibra (emenda)", notes: "Rompimento confirmado por OTDR a 3,42 km.", photos: 3 }],
  },
  {
    id: "cli-padaria",
    contractId: "CT-2021-0455",
    name: "Padaria Pão Quente",
    document: "22.881.334/0001-70",
    phone: "+55 11 3388-7712",
    email: "financeiro@paoquente.com.br",
    plan: "700 Mega Empresarial",
    planSpeed: 700,
    planPrice: 249.9,
    accountStatus: "Ativo",
    status: "Offline",
    rx: -30.1,
    tx: 2.5,
    mac: "E8:65:D4:19:44:AA",
    ip: "177.12.9.14",
    uptime: "Desconectado há 1 hora",
    download: 0,
    upload: 0,
    loyaltyMonths: 61,
    contractSince: "04/2021",
    dueDay: 20,
    cto: { name: "CTO-CENTRO-B04", port: 12, totalPorts: 16, olt: "OLT-CENTRO-01", pon: "PON 0/1/2", lat: -23.5563, lng: -46.6497 },
    address: { street: "Av. São João", number: "980", district: "Centro", complement: "Loja 1", zip: "01035-000", city: "São Paulo / SP", lat: -23.5549, lng: -46.6481 },
    devices: [
      { id: "dev-6", kind: "onu", brand: "Huawei", model: "EG8145X6", firmware: "V5R021C00S120", mac: "E8:65:D4:19:44:AA" },
      { id: "dev-7", kind: "router", brand: "Intelbras", model: "RF1200", firmware: "1.9.3", mac: "58:10:8C:22:9F:04" },
    ],
    openInvoices: 0,
  },
  {
    id: "cli-renata",
    contractId: "CT-2023-7712",
    name: "Renata Lopes",
    document: "556.207.881-04",
    phone: "+55 11 98120-5567",
    email: "renata.lopes@email.com",
    plan: "400 Mega Casa",
    planSpeed: 400,
    planPrice: 99.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -29.1,
    tx: 2.3,
    mac: "24:5A:4C:71:B2:80",
    ip: "177.12.55.40",
    uptime: "3 dias, 11 horas conectado",
    download: 88,
    upload: 9,
    loyaltyMonths: 18,
    contractSince: "02/2025",
    dueDay: 8,
    cto: { name: "CTO-FLORES-07", port: 4, totalPorts: 16, olt: "OLT-FLORES-02", pon: "PON 0/1/7", lat: -23.5678, lng: -46.6662 },
    address: { street: "Rua das Acácias", number: "45", district: "Jardim das Flores", complement: "—", zip: "05620-030", city: "São Paulo / SP", lat: -23.5691, lng: -46.6641 },
    devices: [{ id: "dev-8", kind: "onu", brand: "ZTE", model: "F670L", firmware: "V9.0.11P1N6", mac: "24:5A:4C:71:B2:80" }],
    openInvoices: 1,
  },
  {
    id: "cli-eduardo",
    contractId: "CT-2024-3390",
    name: "Eduardo Prado",
    document: "129.774.550-31",
    phone: "+55 11 97001-2280",
    email: "eduardo.prado@email.com",
    plan: "800 Mega Fibra",
    planSpeed: 800,
    planPrice: 159.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -23.2,
    tx: 2,
    mac: "F0:9F:C2:14:6B:31",
    ip: "177.12.61.203",
    uptime: "28 dias, 02 horas conectado",
    download: 212,
    upload: 41,
    loyaltyMonths: 14,
    contractSince: "06/2025",
    dueDay: 25,
    cto: { name: "CTO-NORTE-09", port: 2, totalPorts: 16, olt: "POP NORTE", pon: "PON 0/2/9", lat: -23.5348, lng: -46.6242 },
    address: { street: "Rua Voluntários", number: "1180", district: "Zona Norte", complement: "Apto 32", zip: "02040-100", city: "São Paulo / SP", lat: -23.5361, lng: -46.6227 },
    devices: [{ id: "dev-9", kind: "onu", brand: "Datacom", model: "DM985-424", firmware: "1.8.4", mac: "F0:9F:C2:14:6B:31" }],
    openInvoices: 0,
  },
  {
    id: "cli-ana",
    contractId: "CT-2022-9981",
    name: "Ana Beatriz",
    document: "884.221.099-18",
    phone: "+55 11 98844-1201",
    email: "ana.beatriz@email.com",
    plan: "300 Mega Casa",
    planSpeed: 300,
    planPrice: 89.9,
    accountStatus: "Em redução",
    status: "Online",
    rx: -25.9,
    tx: 2.4,
    mac: "10:27:BE:44:07:C1",
    ip: "100.94.77.31",
    uptime: "9 dias, 15 horas conectado",
    download: 34,
    upload: 6,
    loyaltyMonths: 41,
    contractSince: "01/2023",
    dueDay: 5,
    cto: { name: "CTO-VILA-12", port: 5, totalPorts: 16, olt: "OLT-VILA-03", pon: "PON 0/3/12", lat: -23.5779, lng: -46.6478 },
    address: { street: "Rua Girassol", number: "231", district: "Vila Nova", complement: "Casa", zip: "05433-000", city: "São Paulo / SP", lat: -23.5795, lng: -46.6461 },
    devices: [{ id: "dev-10", kind: "onu", brand: "Nokia", model: "G-1425G-B", firmware: "3FE48720BJHL", mac: "10:27:BE:44:07:C1" }],
    openInvoices: 2,
    overdue: true,
  },
  {
    id: "cli-vitta",
    contractId: "CT-2025-0021",
    name: "Studio Vitta",
    document: "41.220.887/0001-05",
    phone: "+55 11 3399-2210",
    email: "contato@studiovitta.com.br",
    plan: "600 Mega Empresarial",
    planSpeed: 600,
    planPrice: 219.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -26.4,
    tx: 2.1,
    mac: "9C:5A:44:B0:31:2E",
    ip: "177.12.88.9",
    uptime: "62 dias, 04 horas conectado",
    download: 176,
    upload: 33,
    loyaltyMonths: 8,
    contractSince: "12/2025",
    dueDay: 15,
    cto: { name: "CTO-VILA-12", port: 8, totalPorts: 16, olt: "OLT-VILA-03", pon: "PON 0/3/12", lat: -23.5779, lng: -46.6478 },
    address: { street: "Rua Girassol", number: "77", district: "Vila Nova", complement: "Sala 4", zip: "05433-010", city: "São Paulo / SP", lat: -23.5762, lng: -46.6494 },
    devices: [{ id: "dev-11", kind: "onu", brand: "Huawei", model: "EG8145V5", firmware: "V5R021C00S126", mac: "9C:5A:44:B0:31:2E" }],
    openInvoices: 0,
  },
  {
    id: "cli-marcos",
    contractId: "CT-2020-7741",
    name: "Marcos Tenório",
    document: "601.334.882-77",
    phone: "+55 11 98220-7745",
    email: "marcos.tenorio@email.com",
    plan: "1 Giga Fibra Ultra",
    planSpeed: 1000,
    planPrice: 199.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -21.7,
    tx: 2.2,
    mac: "44:D8:76:2A:60:9B",
    ip: "177.12.101.55",
    uptime: "41 dias, 08 horas conectado",
    download: 388,
    upload: 92,
    loyaltyMonths: 70,
    contractSince: "09/2020",
    dueDay: 10,
    cto: { name: "CTO-NORTE-09", port: 7, totalPorts: 16, olt: "POP NORTE", pon: "PON 0/2/9", lat: -23.5348, lng: -46.6242 },
    address: { street: "Rua Curuçá", number: "312", district: "Zona Norte", complement: "Casa 1", zip: "02072-040", city: "São Paulo / SP", lat: -23.5339, lng: -46.6218 },
    devices: [
      { id: "dev-12", kind: "onu", brand: "Huawei", model: "EG8145X6", firmware: "V5R021C00S130", mac: "44:D8:76:2A:60:9B" },
      { id: "dev-13", kind: "mesh", brand: "TP-Link", model: "Deco X60", firmware: "1.3.1", mac: "C4:71:54:88:12:AA" },
    ],
    openInvoices: 1,
  },
  {
    id: "cli-luciana",
    contractId: "CT-2021-5512",
    name: "Luciana Amaral",
    document: "907.118.223-90",
    phone: "+55 11 99771-3390",
    email: "luciana.amaral@email.com",
    plan: "300 Mega Casa",
    planSpeed: 300,
    planPrice: 89.9,
    accountStatus: "Cancelado",
    status: "Offline",
    rx: -40,
    tx: 0,
    mac: "50:64:2B:71:03:5C",
    ip: "—",
    uptime: "Contrato cancelado em 06/2026",
    download: 0,
    upload: 0,
    loyaltyMonths: 0,
    contractSince: "07/2021",
    dueDay: 20,
    cto: { name: "CTO-CENTRO-C01", port: 11, totalPorts: 16, olt: "OLT-CENTRO-01", pon: "PON 0/1/3", lat: -23.5502, lng: -46.6435 },
    address: { street: "Rua Aurora", number: "88", district: "Centro", complement: "Apto 12", zip: "01209-000", city: "São Paulo / SP", lat: -23.5498, lng: -46.6421 },
    devices: [{ id: "dev-14", kind: "onu", brand: "ZTE", model: "F601", firmware: "V2.0.10", mac: "50:64:2B:71:03:5C" }],
    openInvoices: 0,
    orders: [{ id: "os-5", code: "OS-98001", type: "Retirada de equipamento", status: "Concluída", openedAt: "18/06/2026", team: "Equipe Charlie — Vila Nova", notes: "ONU recolhida e drop desconectado da CTO.", photos: 2 }],
  },
  {
    id: "cli-mercado",
    contractId: "CT-2023-2210",
    name: "Mercado Bom Preço",
    document: "18.442.001/0001-33",
    phone: "+55 11 3322-8890",
    email: "ti@bompreco.com.br",
    plan: "900 Mega Empresarial",
    planSpeed: 900,
    planPrice: 329.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -24.8,
    tx: 2.3,
    mac: "B4:A9:FC:52:1D:07",
    ip: "177.12.120.61",
    uptime: "17 dias, 22 horas conectado",
    download: 402,
    upload: 118,
    loyaltyMonths: 30,
    contractSince: "02/2024",
    dueDay: 5,
    cto: { name: "CTO-CENTRO-C01", port: 3, totalPorts: 16, olt: "OLT-CENTRO-01", pon: "PON 0/1/3", lat: -23.5502, lng: -46.6435 },
    address: { street: "Rua Timbiras", number: "455", district: "Centro", complement: "Galpão", zip: "01208-010", city: "São Paulo / SP", lat: -23.5493, lng: -46.6449 },
    devices: [{ id: "dev-15", kind: "onu", brand: "Datacom", model: "DM991-CS", firmware: "2.2.0", mac: "B4:A9:FC:52:1D:07" }],
    openInvoices: 1,
  },
  {
    id: "cli-fabio",
    contractId: "CT-2025-8890",
    name: "Fábio Nogueira",
    document: "225.881.007-46",
    phone: "+55 11 98007-4412",
    email: "fabio.nogueira@email.com",
    plan: "600 Mega Fibra Gamer",
    planSpeed: 600,
    planPrice: 129.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -28.6,
    tx: 2.5,
    mac: "7C:8B:CA:33:90:12",
    ip: "100.94.55.18",
    uptime: "1 dia, 03 horas conectado",
    download: 121,
    upload: 24,
    loyaltyMonths: 5,
    contractSince: "03/2026",
    dueDay: 25,
    cto: { name: "CTO-FLORES-07", port: 13, totalPorts: 16, olt: "OLT-FLORES-02", pon: "PON 0/1/7", lat: -23.5678, lng: -46.6662 },
    address: { street: "Rua Jasmim", number: "1290", district: "Jardim das Flores", complement: "Fundos", zip: "05620-090", city: "São Paulo / SP", lat: -23.5669, lng: -46.6673 },
    devices: [{ id: "dev-16", kind: "onu", brand: "FiberHome", model: "HG6145F", firmware: "RP2755", mac: "7C:8B:CA:33:90:12" }],
    openInvoices: 1,
  },
  {
    id: "cli-clinica",
    contractId: "CT-2022-4471",
    name: "Clínica Vida Plena",
    document: "33.771.556/0001-89",
    phone: "+55 11 3220-1180",
    email: "adm@vidaplena.com.br",
    plan: "700 Mega Empresarial",
    planSpeed: 700,
    planPrice: 249.9,
    accountStatus: "Ativo",
    status: "Online",
    rx: -26.1,
    tx: 2.2,
    mac: "3C:52:82:11:74:D0",
    ip: "177.12.133.90",
    uptime: "55 dias, 09 horas conectado",
    download: 260,
    upload: 64,
    loyaltyMonths: 44,
    contractSince: "12/2022",
    dueDay: 10,
    cto: { name: "CTO-VILA-12", port: 14, totalPorts: 16, olt: "OLT-VILA-03", pon: "PON 0/3/12", lat: -23.5779, lng: -46.6478 },
    address: { street: "Av. Vila Nova", number: "620", district: "Vila Nova", complement: "2º andar", zip: "05433-100", city: "São Paulo / SP", lat: -23.5771, lng: -46.6466 },
    devices: [{ id: "dev-17", kind: "onu", brand: "Huawei", model: "EG8145X6", firmware: "V5R021C00S128", mac: "3C:52:82:11:74:D0" }],
    openInvoices: 0,
  },
  {
    id: "cli-tatiane",
    contractId: "CT-2024-1122",
    name: "Tatiane Ribeiro",
    document: "410.882.117-63",
    phone: "+55 11 99881-4470",
    email: "tatiane.ribeiro@email.com",
    plan: "400 Mega Casa",
    planSpeed: 400,
    planPrice: 99.9,
    accountStatus: "Bloqueado",
    status: "Offline",
    rx: -27.2,
    tx: 2.4,
    mac: "88:C3:97:04:22:E1",
    ip: "100.94.91.7",
    uptime: "Bloqueado por inadimplência",
    download: 0,
    upload: 0,
    loyaltyMonths: 26,
    contractSince: "06/2024",
    dueDay: 15,
    cto: { name: "CTO-FLORES-04", port: 10, totalPorts: 16, olt: "OLT-FLORES-02", pon: "PON 0/1/4", lat: -23.5622, lng: -46.6588 },
    address: { street: "Rua Camélia", number: "77", district: "Jardim das Flores", complement: "Casa 3", zip: "05620-140", city: "São Paulo / SP", lat: -23.5631, lng: -46.6575 },
    devices: [{ id: "dev-18", kind: "onu", brand: "ZTE", model: "F670L", firmware: "V9.0.11P2N1", mac: "88:C3:97:04:22:E1" }],
    openInvoices: 3,
    overdue: true,
  },
];

export const CUSTOMERS: Customer[] = SEEDS.map(build);

export function rxLevel(rx: number): { label: string; tone: "ok" | "warn" | "critical" } {
  if (rx > -25) return { label: "Sinal ideal", tone: "ok" };
  if (rx > -28) return { label: "Atenuado", tone: "warn" };
  return { label: "Crítico", tone: "critical" };
}

export function accountStatusTone(status: AccountStatus): "ok" | "warn" | "critical" | "muted" {
  if (status === "Ativo") return "ok";
  if (status === "Em redução") return "warn";
  if (status === "Bloqueado") return "critical";
  return "muted";
}

export function searchCustomers(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return CUSTOMERS;
  return CUSTOMERS.filter((customer) =>
    [
      customer.name,
      customer.document,
      customer.pppoe,
      customer.ip,
      customer.contractId,
      customer.address.street,
      customer.address.district,
      customer.address.zip,
      customer.mac,
      customer.plan,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

export function openInvoiceTotal(customer: Customer) {
  return customer.invoices
    .filter((invoice) => invoice.status !== "Pago")
    .reduce((total, invoice) => total + invoice.amount, 0);
}

export const CUSTOMER_CONTEXT_KEY = "ispilot:assistente:contexto";

export function buildCustomerContext(customer: Customer) {
  return [
    `Analise o cenário deste assinante e sugira o diagnóstico:`,
    `- Cliente: ${customer.name} (${customer.contractId})`,
    `- Plano: ${customer.plan}`,
    `- Situação cadastral: ${customer.accountStatus}`,
    `- Status Radius: ${customer.status} — ${customer.uptime}`,
    `- PPPoE / IP: ${customer.pppoe} | ${customer.ip}`,
    `- Sinal óptico: RX ${customer.rx} dBm / TX ${customer.tx} dBm (${rxLevel(customer.rx).label})`,
    `- CTO: ${customer.cto.name} porta ${customer.cto.port}/${customer.cto.totalPorts} — ${customer.cto.olt} ${customer.cto.pon}`,
    `- Consumo atual: ${customer.download} Mbps down / ${customer.upload} Mbps up`,
    `- Equipamentos: ${customer.devices.map((device) => `${device.brand} ${device.model} (fw ${device.firmware})`).join(", ")}`,
    `- Financeiro: ${customer.financialStatus} · faturas em aberto R$ ${openInvoiceTotal(customer).toFixed(2)}`,
  ].join("\n");
}
