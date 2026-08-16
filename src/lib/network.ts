export type NodeHealth = "ok" | "warn" | "critical";

export type Pop = {
  id: string;
  name: string;
  kind: "pop" | "olt";
  vendor: string;
  health: NodeHealth;
  clients: number;
  district: string;
  lat: number;
  lng: number;
  note: string;
};

export type Cto = {
  id: string;
  name: string;
  oltId: string;
  pon: string;
  usedPorts: number;
  totalPorts: number;
  health: NodeHealth;
  avgRx: number;
  district: string;
  lat: number;
  lng: number;
};

export type NetClient = {
  id: string;
  name: string;
  ctoId: string;
  status: "Online" | "Offline";
  rx: number;
  plan: string;
  district: string;
  lat: number;
  lng: number;
};

export const HEALTH_LABEL: Record<NodeHealth, string> = {
  ok: "Normal",
  warn: "Atenuação de sinal",
  critical: "Rompimento / cabo partido",
};

export const HEALTH_HEX: Record<NodeHealth, string> = {
  ok: "#22c55e",
  warn: "#f59e0b",
  critical: "#ef4444",
};

export const POPS: Pop[] = [
  { id: "pop-centro", name: "POP CENTRO", kind: "pop", vendor: "Huawei MA5800-X7", health: "critical", clients: 8420, district: "Centro", lat: -23.5489, lng: -46.6388, note: "PON 02 em link loss — splitter B-04" },
  { id: "olt-centro", name: "OLT-CENTRO-01", kind: "olt", vendor: "Huawei MA5800", health: "critical", clients: 4310, district: "Centro", lat: -23.5528, lng: -46.6452, note: "2.209 assinantes sem sinal" },
  { id: "olt-flores", name: "OLT-FLORES-02", kind: "olt", vendor: "ZTE C320", health: "warn", clients: 2180, district: "Jardim das Flores", lat: -23.5651, lng: -46.6605, note: "Atenuação média de 2,4 dB no tronco" },
  { id: "pop-norte", name: "POP NORTE", kind: "pop", vendor: "Nokia 7360 ISAM", health: "ok", clients: 5120, district: "Zona Norte", lat: -23.5312, lng: -46.6289, note: "Operando normal — 42% de carga" },
  { id: "olt-vila", name: "OLT-VILA-03", kind: "olt", vendor: "Datacom DM4610", health: "ok", clients: 1960, district: "Vila Nova", lat: -23.5744, lng: -46.6421, note: "Operando normal" },
];

export const CTOS: Cto[] = [
  { id: "cto-b04", name: "CTO-CENTRO-B04", oltId: "olt-centro", pon: "PON 0/1/2", usedPorts: 16, totalPorts: 16, health: "critical", avgRx: -33.8, district: "Centro", lat: -23.5563, lng: -46.6497 },
  { id: "cto-c01", name: "CTO-CENTRO-C01", oltId: "olt-centro", pon: "PON 0/1/3", usedPorts: 12, totalPorts: 16, health: "warn", avgRx: -28.6, district: "Centro", lat: -23.5502, lng: -46.6435 },
  { id: "cto-flores04", name: "CTO-FLORES-04", oltId: "olt-flores", pon: "PON 0/1/4", usedPorts: 9, totalPorts: 16, health: "ok", avgRx: -24.1, district: "Jardim das Flores", lat: -23.5622, lng: -46.6588 },
  { id: "cto-flores07", name: "CTO-FLORES-07", oltId: "olt-flores", pon: "PON 0/1/7", usedPorts: 15, totalPorts: 16, health: "warn", avgRx: -27.9, district: "Jardim das Flores", lat: -23.5678, lng: -46.6662 },
  { id: "cto-norte09", name: "CTO-NORTE-09", oltId: "pop-norte", pon: "PON 0/2/9", usedPorts: 7, totalPorts: 16, health: "ok", avgRx: -22.4, district: "Zona Norte", lat: -23.5348, lng: -46.6242 },
  { id: "cto-vila12", name: "CTO-VILA-12", oltId: "olt-vila", pon: "PON 0/3/12", usedPorts: 14, totalPorts: 16, health: "ok", avgRx: -25.2, district: "Vila Nova", lat: -23.5779, lng: -46.6478 },
];

export const NET_CLIENTS: NetClient[] = [
  { id: "nc-1", name: "João Silva", ctoId: "cto-flores04", status: "Online", rx: -27.8, plan: "600 Mega Gamer", district: "Jardim das Flores", lat: -23.5602, lng: -46.6544 },
  { id: "nc-2", name: "Maria Fernandes", ctoId: "cto-c01", status: "Offline", rx: -19.4, plan: "300 Mega Casa", district: "Centro", lat: -23.5505, lng: -46.6455 },
  { id: "nc-3", name: "Carlos Andrade", ctoId: "cto-b04", status: "Offline", rx: -40, plan: "500 Mega Turbo", district: "Centro", lat: -23.5571, lng: -46.6512 },
  { id: "nc-4", name: "Padaria Pão Quente", ctoId: "cto-b04", status: "Offline", rx: -40, plan: "700 Mega Empresarial", district: "Centro", lat: -23.5549, lng: -46.6481 },
  { id: "nc-5", name: "Renata Lopes", ctoId: "cto-flores07", status: "Online", rx: -29.1, plan: "400 Mega Casa", district: "Jardim das Flores", lat: -23.5691, lng: -46.6641 },
  { id: "nc-6", name: "Eduardo Prado", ctoId: "cto-norte09", status: "Online", rx: -23.2, plan: "800 Mega Fibra", district: "Zona Norte", lat: -23.5361, lng: -46.6227 },
  { id: "nc-7", name: "Ana Beatriz", ctoId: "cto-vila12", status: "Online", rx: -25.9, plan: "300 Mega Casa", district: "Vila Nova", lat: -23.5795, lng: -46.6461 },
  { id: "nc-8", name: "Studio Vitta", ctoId: "cto-vila12", status: "Online", rx: -26.4, plan: "600 Mega Empresarial", district: "Vila Nova", lat: -23.5762, lng: -46.6494 },
];

export const DISTRICTS = ["Todos", ...Array.from(new Set(CTOS.map((cto) => cto.district)))];

export function ctoById(id: string) {
  return CTOS.find((cto) => cto.id === id);
}

export function popById(id: string) {
  return POPS.find((pop) => pop.id === id);
}

/** Backbone links OLT -> CTO and drop links CTO -> cliente. */
export function fiberLinks() {
  const backbone = CTOS.map((cto) => {
    const olt = popById(cto.oltId);
    return olt
      ? { id: `bb-${cto.id}`, kind: "backbone" as const, health: cto.health, from: [olt.lat, olt.lng] as [number, number], to: [cto.lat, cto.lng] as [number, number] }
      : null;
  }).filter(Boolean) as Array<{ id: string; kind: "backbone"; health: NodeHealth; from: [number, number]; to: [number, number] }>;

  const drops = NET_CLIENTS.map((client) => {
    const cto = ctoById(client.ctoId);
    return cto
      ? { id: `drop-${client.id}`, kind: "drop" as const, health: cto.health, from: [cto.lat, cto.lng] as [number, number], to: [client.lat, client.lng] as [number, number] }
      : null;
  }).filter(Boolean) as Array<{ id: string; kind: "drop"; health: NodeHealth; from: [number, number]; to: [number, number] }>;

  return { backbone, drops };
}

/* ---------------------------------- Incidentes --------------------------------- */

export type IncidentStatus = "EM ANÁLISE" | "TÉCNICO EM DESLOCAMENTO" | "EM MANUTENÇÃO" | "RESOLVIDO";

export const INCIDENT_STATUSES: IncidentStatus[] = [
  "EM ANÁLISE",
  "TÉCNICO EM DESLOCAMENTO",
  "EM MANUTENÇÃO",
  "RESOLVIDO",
];

export type IncidentType = "LINK LOSS" | "FALHA DE ENERGIA NO POP" | "ATENUAÇÃO MASSIVA DE SINAL" | "PERDA DE PACOTES";

export type Incident = {
  id: string;
  type: IncidentType;
  title: string;
  scope: string;
  district: string;
  affected: number;
  severity: NodeHealth;
  detectedAt: string;
  status: IncidentStatus;
  notified: boolean;
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    type: "LINK LOSS",
    title: "LINK LOSS - OLT CENTRO / PON 02 - SPLITTER B-04",
    scope: "OLT-CENTRO-01 · PON 0/1/2 · CTO-CENTRO-B04",
    district: "Centro",
    affected: 2209,
    severity: "critical",
    detectedAt: "há 12 min",
    status: "EM ANÁLISE",
    notified: false,
  },
  {
    id: "inc-2",
    type: "ATENUAÇÃO MASSIVA DE SINAL",
    title: "ATENUAÇÃO MASSIVA - OLT FLORES / PON 07",
    scope: "OLT-FLORES-02 · PON 0/1/7",
    district: "Jardim das Flores",
    affected: 184,
    severity: "warn",
    detectedAt: "há 38 min",
    status: "TÉCNICO EM DESLOCAMENTO",
    notified: true,
  },
  {
    id: "inc-3",
    type: "FALHA DE ENERGIA NO POP",
    title: "FALHA DE ENERGIA - POP NORTE (nobreak em bateria)",
    scope: "POP NORTE · autonomia 47 min",
    district: "Zona Norte",
    affected: 512,
    severity: "warn",
    detectedAt: "há 1 h 05 min",
    status: "EM MANUTENÇÃO",
    notified: true,
  },
  {
    id: "inc-4",
    type: "PERDA DE PACOTES",
    title: "PERDA DE PACOTES - Trânsito IP upstream 3%",
    scope: "Borda BGP · AS 264xxx",
    district: "Vila Nova",
    affected: 96,
    severity: "warn",
    detectedAt: "há 2 h",
    status: "RESOLVIDO",
    notified: false,
  },
];

export const MASS_MESSAGE_TEMPLATE =
  "Identificamos uma oscilação na fibra do seu bairro. Nossa equipe já está no local efetuando o reparo. Previsão de retorno: 45 min.";

/** Cálculo simples de atenuação de enlace óptico (demonstração). */
export function opticalBudget(input: {
  txPower: number;
  distanceKm: number;
  splitters: number;
  fusions: number;
  connectors: number;
}) {
  const fiberLoss = input.distanceKm * 0.35;
  const splitterLoss = input.splitters * 3.6;
  const fusionLoss = input.fusions * 0.1;
  const connectorLoss = input.connectors * 0.5;
  const total = fiberLoss + splitterLoss + fusionLoss + connectorLoss;
  const rx = input.txPower - total;
  const tone: NodeHealth = rx > -25 ? "ok" : rx > -28 ? "warn" : "critical";
  return { fiberLoss, splitterLoss, fusionLoss, connectorLoss, total, rx, tone };
}

/* ------------------------- Caixas de emenda & rotas de cabo ---------------------- */

export type SpliceBox = {
  id: string;
  name: string;
  oltId: string;
  fusionsUsed: number;
  fusionsTotal: number;
  health: NodeHealth;
  district: string;
  lat: number;
  lng: number;
  note: string;
};

export const SPLICE_BOXES: SpliceBox[] = [
  { id: "ce-centro-01", name: "CE-CENTRO-01", oltId: "olt-centro", fusionsUsed: 22, fusionsTotal: 24, health: "critical", district: "Centro", lat: -23.5541, lng: -46.6471, note: "Bandeja 3 com fibra partida (tração de cabo)" },
  { id: "ce-centro-02", name: "CE-CENTRO-02", oltId: "olt-centro", fusionsUsed: 14, fusionsTotal: 24, health: "warn", district: "Centro", lat: -23.5515, lng: -46.6412, note: "Fusão com 0,9 dB acima do aceitável" },
  { id: "ce-flores-01", name: "CE-FLORES-01", oltId: "olt-flores", fusionsUsed: 18, fusionsTotal: 24, health: "warn", district: "Jardim das Flores", lat: -23.5639, lng: -46.6597, note: "Umidade detectada na vedação" },
  { id: "ce-norte-01", name: "CE-NORTE-01", oltId: "pop-norte", fusionsUsed: 10, fusionsTotal: 24, health: "ok", district: "Zona Norte", lat: -23.5331, lng: -46.6265, note: "Operando normal" },
  { id: "ce-vila-01", name: "CE-VILA-01", oltId: "olt-vila", fusionsUsed: 16, fusionsTotal: 24, health: "ok", district: "Vila Nova", lat: -23.5761, lng: -46.6449, note: "Operando normal" },
];

export type CableRoute = {
  id: string;
  name: string;
  oltId: string;
  fibers: number;
  health: NodeHealth;
  district: string;
  path: Array<[number, number]>;
};

export const CABLE_ROUTES: CableRoute[] = [
  {
    id: "cab-centro-tronco",
    name: "Tronco CENTRO 48FO",
    oltId: "olt-centro",
    fibers: 48,
    health: "critical",
    district: "Centro",
    path: [
      [-23.5489, -46.6388],
      [-23.5515, -46.6412],
      [-23.5541, -46.6471],
      [-23.5563, -46.6497],
    ],
  },
  {
    id: "cab-centro-ramal",
    name: "Ramal CENTRO C 24FO",
    oltId: "olt-centro",
    fibers: 24,
    health: "warn",
    district: "Centro",
    path: [
      [-23.5528, -46.6452],
      [-23.5515, -46.6412],
      [-23.5502, -46.6435],
    ],
  },
  {
    id: "cab-flores-tronco",
    name: "Tronco FLORES 36FO",
    oltId: "olt-flores",
    fibers: 36,
    health: "warn",
    district: "Jardim das Flores",
    path: [
      [-23.5651, -46.6605],
      [-23.5639, -46.6597],
      [-23.5622, -46.6588],
      [-23.5678, -46.6662],
    ],
  },
  {
    id: "cab-norte-tronco",
    name: "Tronco NORTE 24FO",
    oltId: "pop-norte",
    fibers: 24,
    health: "ok",
    district: "Zona Norte",
    path: [
      [-23.5312, -46.6289],
      [-23.5331, -46.6265],
      [-23.5348, -46.6242],
    ],
  },
  {
    id: "cab-vila-tronco",
    name: "Tronco VILA 24FO",
    oltId: "olt-vila",
    fibers: 24,
    health: "ok",
    district: "Vila Nova",
    path: [
      [-23.5744, -46.6421],
      [-23.5761, -46.6449],
      [-23.5779, -46.6478],
    ],
  },
];

export type FiberBreak = {
  id: string;
  cableId: string;
  label: string;
  district: string;
  affected: number;
  lat: number;
  lng: number;
  detectedAt: string;
  otdrDistanceKm: number;
};

export const FIBER_BREAKS: FiberBreak[] = [
  {
    id: "brk-1",
    cableId: "cab-centro-tronco",
    label: "Rompimento total — tração por veículo alto",
    district: "Centro",
    affected: 2209,
    lat: -23.5552,
    lng: -46.6484,
    detectedAt: "há 12 min",
    otdrDistanceKm: 3.42,
  },
];

/** Assinantes sem sinal (indício de rompimento de fibra). */
export function clientsWithoutSignal() {
  return NET_CLIENTS.filter((client) => client.status === "Offline" || client.rx <= -30);
}

export const OLT_OPTIONS = ["Todas", ...POPS.map((pop) => pop.name)];
export const PON_OPTIONS = ["Todas", ...Array.from(new Set(CTOS.map((cto) => cto.pon)))];
export const CTO_OPTIONS = ["Todas", ...CTOS.map((cto) => cto.name)];

export function oltIdByName(name: string) {
  return POPS.find((pop) => pop.name === name)?.id ?? null;
}
