export type LayerTone = "ok" | "warn" | "critical";

export type FunnelMetric = { label: string; value: string; tone?: LayerTone; note?: string };

export type FunnelStage = {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  tone: LayerTone;
  headline: string;
  metrics: FunnelMetric[];
};

export type RouterGuideStep = {
  title: string;
  instruction: string;
  screen: {
    breadcrumb: string;
    fields: Array<{ label: string; value: string; highlight?: boolean }>;
    cta: string;
  };
};

export type RouterModel = {
  id: string;
  brand: string;
  model: string;
  gateway: string;
  app: string;
  wanPort: "Fast Ethernet 100M" | "Gigabit 1000M";
};

export const OLTS = [
  { id: "an5516-01", name: "AN5516-01", cards: "GC8B x8 · HSWA", uplink: "SFP+ 10G LR" },
  { id: "an5516-04", name: "AN5516-04", cards: "GC8B x6 · HU2A", uplink: "SFP+ 10G ER" },
  { id: "an5006-20", name: "AN5006-20", cards: "GC4B x2 · HSWA", uplink: "SFP+ 10G LR" },
];

export const PON_PORTS = Array.from({ length: 16 }, (_, index) => `PON 1/1/${index + 1}`);

export const ROUTER_MODELS: RouterModel[] = [
  { id: "tpl-ex520", brand: "TP-Link", model: "EX520", gateway: "192.168.0.1", app: "Aginet", wanPort: "Gigabit 1000M" },
  { id: "tpl-ex521", brand: "TP-Link", model: "EX521", gateway: "192.168.88.1", app: "Aginet", wanPort: "Gigabit 1000M" },
  { id: "tpl-c6", brand: "TP-Link", model: "Archer C6", gateway: "192.168.0.1", app: "Tether", wanPort: "Gigabit 1000M" },
  { id: "tpl-ec220", brand: "TP-Link", model: "EC220-G5", gateway: "192.168.0.1", app: "Tether", wanPort: "Gigabit 1000M" },
  { id: "tpl-deco", brand: "TP-Link", model: "Deco Mesh", gateway: "192.168.68.1", app: "Deco", wanPort: "Gigabit 1000M" },
  { id: "mer-mr30g", brand: "Mercusys", model: "MR30G", gateway: "192.168.1.1", app: "MERCUSYS", wanPort: "Gigabit 1000M" },
  { id: "mer-h50g", brand: "Mercusys", model: "Halo H50G", gateway: "192.168.1.1", app: "MERCUSYS", wanPort: "Gigabit 1000M" },
  { id: "int-rf1200", brand: "Intelbras", model: "Action RF1200", gateway: "10.0.0.1", app: "Meu Intelbras", wanPort: "Fast Ethernet 100M" },
  { id: "int-twibi", brand: "Intelbras", model: "Twibi Force", gateway: "10.0.0.1", app: "Twibi", wanPort: "Gigabit 1000M" },
  { id: "int-gf1200", brand: "Intelbras", model: "GF 1200", gateway: "10.0.0.1", app: "Meu Intelbras", wanPort: "Gigabit 1000M" },
  { id: "hw-ws5200", brand: "Huawei", model: "WS5200", gateway: "192.168.3.1", app: "AI Life", wanPort: "Gigabit 1000M" },
  { id: "hw-ax2", brand: "Huawei", model: "AX2", gateway: "192.168.3.1", app: "AI Life", wanPort: "Gigabit 1000M" },
  { id: "hw-ax3", brand: "Huawei", model: "AX3 Pro", gateway: "192.168.3.1", app: "AI Life", wanPort: "Gigabit 1000M" },
  { id: "hw-mesh", brand: "Huawei", model: "Mesh 3", gateway: "192.168.3.1", app: "AI Life", wanPort: "Gigabit 1000M" },
  { id: "zte-h199a", brand: "ZTE", model: "H199A", gateway: "192.168.1.1", app: "ZTELink", wanPort: "Gigabit 1000M" },
  { id: "zte-space", brand: "ZTE", model: "Space Mesh", gateway: "192.168.1.1", app: "ZTELink", wanPort: "Gigabit 1000M" },
  { id: "dlink", brand: "D-Link", model: "DIR-615", gateway: "192.168.0.1", app: "—", wanPort: "Fast Ethernet 100M" },
  { id: "mikrotik", brand: "MikroTik", model: "hAP ac²", gateway: "192.168.88.1", app: "WinBox", wanPort: "Gigabit 1000M" },
  { id: "groovy", brand: "Groovy", model: "GR-1200AC", gateway: "192.168.1.1", app: "—", wanPort: "Gigabit 1000M" },
];

export type UnmCase = {
  id: string;
  customer: string;
  pppoe: string;
  ip: string;
  contract: string;
  serial: string;
  oltId: string;
  pon: string;
  routerId: string;
  complaint: string;
  overallTone: LayerTone;
  stages: FunnelStage[];
  aiSummary: string;
  aiRootCause: string;
  aiScope: "router" | "fibra";
  aiActions: string[];
  guide: RouterGuideStep[];
};

export const UNM_CASES: UnmCase[] = [
  {
    id: "caso-a",
    customer: "João Silva",
    pppoe: "joao.silva@net",
    ip: "177.12.44.89",
    contract: "CT-2024-8891",
    serial: "FHTT2b1f04c9 · 48:8F:5A:11:22:33",
    oltId: "an5516-01",
    pon: "PON 1/1/4",
    routerId: "tpl-ex521",
    complaint: "Internet lenta e travando em jogos / videochamadas",
    overallTone: "warn",
    aiScope: "router",
    stages: [
      {
        id: "a1",
        step: 1,
        title: "OLT & Placa de Trunk",
        subtitle: "AN5516-01 · Camada física central",
        tone: "ok",
        headline: "Placa GC8B operando dentro do envelope térmico",
        metrics: [
          { label: "Estado da placa", value: "GC8B · Working", tone: "ok" },
          { label: "Temperatura da placa", value: "48 °C", tone: "ok" },
          { label: "CPU / Memória OLT", value: "22% / 41%", tone: "ok" },
          { label: "Uplink SFP+ 10G", value: "Up · RX -6,2 dBm / TX -2,1 dBm", tone: "ok" },
          { label: "VLAN de serviço", value: "C-VLAN 1020 / S-VLAN 300", tone: "ok" },
          { label: "Tunnel QinQ", value: "Ativo · translate 1020→300", tone: "ok" },
        ],
      },
      {
        id: "a2",
        step: 2,
        title: "Porta PON & Splitter/CTO",
        subtitle: "PON 1/1/4 · Distribuição óptica",
        tone: "ok",
        headline: "PON estável, sem rogue ONT detectada",
        metrics: [
          { label: "ONTs ativas", value: "58/64 ONTs Online", tone: "ok" },
          { label: "Laser emissor da PON", value: "TX +3,2 dBm", tone: "ok" },
          { label: "CTO / porta", value: "CTO-FLORES-04 · porta 3/16", tone: "ok" },
          { label: "Atenuação teórica x real", value: "18,4 dB x 19,0 dB", tone: "ok", note: "Δ 0,6 dB dentro da tolerância" },
          { label: "Ruído / interferência", value: "Não detectado", tone: "ok" },
          { label: "Rogue ONT (laser contínuo)", value: "Nenhuma", tone: "ok" },
        ],
      },
      {
        id: "a3",
        step: 3,
        title: "ONT FiberHome",
        subtitle: "HG6245D · Cliente óptico",
        tone: "ok",
        headline: "Sinal óptico perfeito e T-CONT de 1 Gbps alocado",
        metrics: [
          { label: "Modelo da ONT", value: "HG6245D", tone: "ok" },
          { label: "RX Power", value: "-19,2 dBm", tone: "ok" },
          { label: "TX Power", value: "+2,3 dBm", tone: "ok" },
          { label: "OMCI / OAM", value: "Sincronizado", tone: "ok" },
          { label: "Temperatura do chipset", value: "52 °C", tone: "ok" },
          { label: "Alarme UNM2000", value: "Normal", tone: "ok" },
          { label: "Bandwidth Profile", value: "TCONT_1000M_DOWN / TCONT_500M_UP", tone: "ok" },
          { label: "Porta LAN negociada", value: "GE 1000 Mbps", tone: "ok" },
        ],
      },
      {
        id: "a4",
        step: 4,
        title: "WAN & Autenticação",
        subtitle: "PPPoE · Camada lógica",
        tone: "ok",
        headline: "Sessão PPPoE estável há 14 dias",
        metrics: [
          { label: "Tipo de conexão", value: "PPPoE", tone: "ok" },
          { label: "Autenticação Radius", value: "Connected", tone: "ok" },
          { label: "IPv4", value: "177.12.44.89 (público)", tone: "ok" },
          { label: "Prefixo IPv6", value: "2804:14d:8a::/64", tone: "ok" },
          { label: "MTU / MRU", value: "1492 / 1492", tone: "ok" },
          { label: "DNS ativos", value: "1.1.1.1 · 8.8.8.8", tone: "ok" },
        ],
      },
      {
        id: "a5",
        step: 5,
        title: "Roteador & Rede doméstica",
        subtitle: "TP-Link EX521 · Experiência",
        tone: "critical",
        headline: "Wi-Fi 2.4 GHz saturado com 18 dispositivos no mesmo canal",
        metrics: [
          { label: "Porta WAN do roteador", value: "1000 Mbps Full Duplex", tone: "ok" },
          { label: "2.4 GHz", value: "Canal 6 · 40 MHz · poluição 87%", tone: "critical", note: "14 redes vizinhas sobrepostas" },
          { label: "5 GHz", value: "Canal 36 · 40 MHz · DFS off", tone: "warn", note: "Largura abaixo do ideal (80 MHz)" },
          { label: "Dispositivos conectados", value: "18 (16 em 2.4 GHz)", tone: "critical" },
          { label: "Consumo instantâneo", value: "146 Mbps down / 12 Mbps up", tone: "ok" },
          { label: "EasyMesh", value: "Desativado", tone: "warn" },
        ],
      },
    ],
    aiSummary:
      "O sinal da fibra está excelente (RX -19,2 dBm) e o perfil T-CONT de 1 Gbps está corretamente alocado no UNM2000, com PPPoE autenticado. O gargalo está na rede Wi-Fi: 16 dos 18 dispositivos estão presos na banda 2.4 GHz, em um canal com 87% de poluição espectral, enquanto a rede 5 GHz opera em apenas 40 MHz.",
    aiRootCause: "Congestionamento de espectro 2.4 GHz no TP-Link EX521 — nenhum problema físico na planta óptica.",
    aiActions: [
      "Separar SSIDs e migrar dispositivos de vídeo/jogos para 5 GHz",
      "Elevar a largura de banda 5 GHz para 80 MHz no canal 36",
      "Ativar EasyMesh para roaming entre os ambientes",
      "Nenhuma visita técnica de fibra necessária",
    ],
    guide: [
      {
        title: "Acessar o painel",
        instruction: "Acesse 192.168.88.1 no navegador ou abra o aplicativo Aginet e faça login como admin.",
        screen: {
          breadcrumb: "TP-Link EX521 · Login",
          fields: [
            { label: "Endereço", value: "http://192.168.88.1", highlight: true },
            { label: "Usuário", value: "admin" },
            { label: "Senha", value: "••••••••" },
          ],
          cta: "Entrar",
        },
      },
      {
        title: "Confirmar negociação da porta WAN",
        instruction: "Vá em Rede ➔ Internet ➔ Avançado e mude a negociação da porta WAN de 'Auto' para '1000Mbps Full Duplex'.",
        screen: {
          breadcrumb: "Rede ➔ Internet ➔ Avançado",
          fields: [
            { label: "Velocidade da porta WAN", value: "1000 Mbps Full Duplex", highlight: true },
            { label: "MTU", value: "1492" },
            { label: "Tipo de conexão", value: "PPPoE" },
          ],
          cta: "Salvar",
        },
      },
      {
        title: "Isolar e otimizar a rede 5 GHz",
        instruction: "Acesse a aba 'Wireless' ➔ desmarque 'Smart Connect', renomeie o SSID de 5 GHz para CLIENTE_5G, ative EasyMesh e defina 80 MHz no canal 36.",
        screen: {
          breadcrumb: "Wireless ➔ Configurações",
          fields: [
            { label: "Smart Connect", value: "Desativado", highlight: true },
            { label: "SSID 5 GHz", value: "CLIENTE_5G", highlight: true },
            { label: "Canal 5 GHz", value: "36" },
            { label: "Largura de banda", value: "80 MHz", highlight: true },
            { label: "EasyMesh", value: "Ativado", highlight: true },
          ],
          cta: "Aplicar",
        },
      },
      {
        title: "Confirmar VLAN de serviço",
        instruction: "Acesse 'Modo IPTV/VLAN' e confirme a C-VLAN 1020 (padrão do provedor) com prioridade 0.",
        screen: {
          breadcrumb: "Avançado ➔ IPTV/VLAN",
          fields: [
            { label: "Modo", value: "Personalizado (Bridge)" },
            { label: "C-VLAN Internet", value: "1020", highlight: true },
            { label: "Prioridade 802.1p", value: "0" },
          ],
          cta: "Salvar",
        },
      },
    ],
  },
  {
    id: "caso-b",
    customer: "Maria Fernandes",
    pppoe: "maria.fernandes@net",
    ip: "100.94.18.203",
    contract: "CT-2023-4410",
    serial: "FHTT4c92aa10 · B0:4E:26:7A:C1:9F",
    oltId: "an5516-04",
    pon: "PON 1/1/7",
    routerId: "int-rf1200",
    complaint: "Sem conexão / luz vermelha na ONU e roteador sem internet",
    overallTone: "critical",
    aiScope: "fibra",
    stages: [
      {
        id: "b1",
        step: 1,
        title: "OLT & Placa de Trunk",
        subtitle: "AN5516-04 · Camada física central",
        tone: "warn",
        headline: "Placa HU2A com temperatura elevada, uplink íntegro",
        metrics: [
          { label: "Estado da placa", value: "GC8B · Working", tone: "ok" },
          { label: "Temperatura da placa", value: "67 °C", tone: "warn", note: "Limite de alarme: 70 °C" },
          { label: "CPU / Memória OLT", value: "58% / 63%", tone: "warn" },
          { label: "Uplink SFP+ 10G", value: "Up · RX -7,8 dBm / TX -2,4 dBm", tone: "ok" },
          { label: "VLAN de serviço", value: "C-VLAN 1050 / S-VLAN 310", tone: "ok" },
          { label: "Tunnel QinQ", value: "Ativo · translate 1050→310", tone: "ok" },
        ],
      },
      {
        id: "b2",
        step: 2,
        title: "Porta PON & Splitter/CTO",
        subtitle: "PON 1/1/7 · Distribuição óptica",
        tone: "critical",
        headline: "Atenuação real 6,9 dB acima do cálculo teórico no splitter",
        metrics: [
          { label: "ONTs ativas", value: "41/64 ONTs Online", tone: "warn", note: "9 ONTs em LOS na mesma caixa" },
          { label: "Laser emissor da PON", value: "TX +3,0 dBm", tone: "ok" },
          { label: "CTO / porta", value: "CTO-CENTRO-B04 · porta 6/16", tone: "critical" },
          { label: "Atenuação teórica x real", value: "22,1 dB x 29,0 dB", tone: "critical", note: "Suspeita de fusão fria no splitter 1:8" },
          { label: "Ruído / interferência", value: "Reflexão detectada a ~1,3 km", tone: "critical" },
          { label: "Rogue ONT (laser contínuo)", value: "1 candidata · SN FHTT9a01f2", tone: "warn" },
        ],
      },
      {
        id: "b3",
        step: 3,
        title: "ONT FiberHome",
        subtitle: "AN5506-04-F · Cliente óptico",
        tone: "critical",
        headline: "Alarme Optic Power Low com RX -31,5 dBm",
        metrics: [
          { label: "Modelo da ONT", value: "AN5506-04-F", tone: "ok" },
          { label: "RX Power", value: "-31,5 dBm", tone: "critical" },
          { label: "TX Power", value: "+1,8 dBm", tone: "ok" },
          { label: "OMCI / OAM", value: "Instável · 4 re-sincronizações em 1 h", tone: "critical" },
          { label: "Temperatura do chipset", value: "61 °C", tone: "warn" },
          { label: "Alarme UNM2000", value: "Optic Power Low + SF (Signal Fail)", tone: "critical" },
          { label: "Bandwidth Profile", value: "TCONT_300M_DOWN / TCONT_150M_UP", tone: "ok" },
          { label: "Porta LAN negociada", value: "FE 100 Mbps", tone: "warn", note: "Roteador Fast Ethernet limita o plano" },
        ],
      },
      {
        id: "b4",
        step: 4,
        title: "WAN & Autenticação",
        subtitle: "PPPoE · Camada lógica",
        tone: "critical",
        headline: "Auth Failed (691) com tag de VLAN desalinhada",
        metrics: [
          { label: "Tipo de conexão", value: "PPPoE", tone: "ok" },
          { label: "Autenticação Radius", value: "Auth Failed (Erro 691)", tone: "critical" },
          { label: "VLAN na WAN do roteador", value: "Sem tag (esperado 1050)", tone: "critical" },
          { label: "IPv4", value: "Não atribuído", tone: "critical" },
          { label: "Prefixo IPv6", value: "—", tone: "critical" },
          { label: "MTU / MRU", value: "1500 / 1500", tone: "warn", note: "Ajustar para 1492 em PPPoE" },
          { label: "DNS ativos", value: "Indisponível", tone: "critical" },
        ],
      },
      {
        id: "b5",
        step: 5,
        title: "Roteador & Rede doméstica",
        subtitle: "Intelbras Action RF1200 · Experiência",
        tone: "critical",
        headline: "WAN em 100 Mbps e sem VLAN 1050 configurada",
        metrics: [
          { label: "Porta WAN do roteador", value: "100 Mbps (Fast Ethernet)", tone: "warn" },
          { label: "2.4 GHz", value: "Canal 11 · 20 MHz · poluição 34%", tone: "ok" },
          { label: "5 GHz", value: "Canal 44 · 80 MHz · DFS on", tone: "ok" },
          { label: "Dispositivos conectados", value: "0 com internet", tone: "critical" },
          { label: "Consumo instantâneo", value: "0 Mbps", tone: "critical" },
          { label: "Tag VLAN WAN", value: "Não configurada", tone: "critical" },
        ],
      },
    ],
    aiSummary:
      "A ONT AN5506-04-F está recebendo apenas -31,5 dBm com alarme Optic Power Low e SF no UNM2000, e a atenuação real da CTO-CENTRO-B04 está 6,9 dB acima do teórico — indício de fusão fria no splitter 1:8. Somado a isso, a porta WAN do Intelbras Action RF1200 está sem a tag de VLAN 1050, o que impede a autenticação PPPoE (erro 691) mesmo depois do reparo óptico.",
    aiRootCause: "Falha física na fusão do splitter da CTO-CENTRO-B04 + erro de tag de VLAN 1050 na WAN do Intelbras.",
    aiActions: [
      "Abrir O.S. de fibra para refusão do splitter 1:8 na CTO-CENTRO-B04",
      "Configurar a C-VLAN 1050 na porta WAN do Intelbras Action RF1200",
      "Ajustar MTU para 1492 e revalidar credenciais PPPoE",
      "Investigar rogue ONT SN FHTT9a01f2 na mesma PON",
    ],
    guide: [
      {
        title: "Acessar o painel",
        instruction: "Acesse 10.0.0.1 no navegador ou o aplicativo Meu Intelbras e entre com o usuário admin.",
        screen: {
          breadcrumb: "Intelbras Action RF1200 · Login",
          fields: [
            { label: "Endereço", value: "http://10.0.0.1", highlight: true },
            { label: "Usuário", value: "admin" },
            { label: "Senha", value: "••••••••" },
          ],
          cta: "Entrar",
        },
      },
      {
        title: "Configurar a tag de VLAN 1050",
        instruction: "Vá em Internet ➔ Configuração WAN ➔ VLAN e habilite a tag com ID 1050 e prioridade 0.",
        screen: {
          breadcrumb: "Internet ➔ WAN ➔ VLAN",
          fields: [
            { label: "VLAN habilitada", value: "Sim", highlight: true },
            { label: "VLAN ID", value: "1050", highlight: true },
            { label: "Prioridade 802.1p", value: "0" },
            { label: "Modo", value: "PPPoE com tag" },
          ],
          cta: "Aplicar",
        },
      },
      {
        title: "Revalidar PPPoE e MTU",
        instruction: "Em Internet ➔ PPPoE, reinsira usuário/senha do contrato e altere o MTU de 1500 para 1492.",
        screen: {
          breadcrumb: "Internet ➔ PPPoE",
          fields: [
            { label: "Usuário", value: "maria.fernandes@net", highlight: true },
            { label: "Senha", value: "••••••••" },
            { label: "MTU", value: "1492", highlight: true },
          ],
          cta: "Conectar",
        },
      },
      {
        title: "Validar link da porta WAN",
        instruction: "Em Status ➔ Rede, confirme o link da WAN. Se permanecer em 100 Mbps, troque o cabo UTP entre ONU e roteador (Cat5e ou superior).",
        screen: {
          breadcrumb: "Status ➔ Rede",
          fields: [
            { label: "Link WAN", value: "100 Mbps (verificar cabo)", highlight: true },
            { label: "IP WAN", value: "Aguardando PPPoE" },
            { label: "Gateway", value: "—" },
          ],
          cta: "Atualizar",
        },
      },
    ],
  },
];

export type UnmToolGroup = {
  group: string;
  tools: Array<{ id: string; label: string; description: string; confirm: string; danger?: boolean }>;
};

export const UNM_TOOLS: UnmToolGroup[] = [
  {
    group: "Banda & perfis",
    tools: [
      {
        id: "tcont",
        label: "Alterar perfil T-CONT / SLA de banda",
        description: "Upgrade temporário de perfil de banda direto no UNM2000, sem abrir a interface Java.",
        confirm: "Aplicar novo perfil T-CONT nesta ONT? A sessão será reconstruída em ~8 s.",
      },
      {
        id: "rebind",
        label: "Re-bind da porta LAN da ONU",
        description: "Alterna o mapeamento das portas da ONU entre modo Bridge e Router.",
        confirm: "Re-vincular portas LAN da ONU? Dispositivos conectados perderão IP momentaneamente.",
      },
    ],
  },
  {
    group: "Manutenção & diagnóstico físico",
    tools: [
      {
        id: "omci",
        label: "Re-sincronizar atribuição de OMCI",
        description: "Força a regravação dos arquivos de configuração na ONU.",
        confirm: "Forçar re-sincronização OMCI nesta ONT?",
      },
      {
        id: "vfl",
        label: "Medir VFL / caneta laser remota",
        description: "Ativa o LED de teste de fibra da ONT, quando suportado pelo modelo.",
        confirm: "Ativar VFL remoto por 60 segundos?",
      },
      {
        id: "unconfigured",
        label: "Consultar ONTs desconfiguradas",
        description: "Lista registros não autorizados na PON para provisionamento em massa.",
        confirm: "Consultar tabela de Unconfigured ONTs desta PON?",
      },
      {
        id: "reboot",
        label: "Reboot de equipamento",
        description: "Reinicia a ONT remotamente pelo UNM2000.",
        confirm: "Reiniciar a ONT do cliente? Ficará offline por cerca de 60 s.",
      },
      {
        id: "factory",
        label: "Reset de fábrica remoto",
        description: "Apaga toda a configuração da ONU e reprovisiona pelo perfil padrão.",
        confirm: "ATENÇÃO: o reset de fábrica apaga Wi-Fi e VLANs da ONU. Confirmar?",
        danger: true,
      },
    ],
  },
];

export function toneClasses(tone: LayerTone) {
  if (tone === "ok") {
    return { text: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10", dot: "bg-emerald-400", label: "OK" };
  }
  if (tone === "warn") {
    return { text: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/10", dot: "bg-amber-400", label: "Degradado" };
  }
  return { text: "text-red-400", border: "border-red-500/40", bg: "bg-red-500/10", dot: "bg-red-400", label: "Falha crítica" };
}

export function routerById(id: string) {
  return ROUTER_MODELS.find((item) => item.id === id) ?? ROUTER_MODELS[0]!;
}