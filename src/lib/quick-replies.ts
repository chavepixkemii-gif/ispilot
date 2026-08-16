import { useCallback, useEffect, useState } from "react";

export const QUICK_REPLY_CATEGORIES = [
  "Financeiro",
  "Suporte Técnico",
  "Comercial / Planos",
  "Instabilidades / Manutenção",
] as const;

export type QuickReplyCategory = (typeof QUICK_REPLY_CATEGORIES)[number];

export type QuickReply = {
  id: string;
  title: string;
  category: QuickReplyCategory;
  shortcut?: string;
  content: string;
  tags: string[];
  updatedAt: string;
};

export const QUICK_REPLY_VARIABLES = [
  "{nome_cliente}",
  "{plano}",
  "{sinal_rx}",
  "{link_boleto}",
  "{vencimento}",
] as const;

const STORAGE_KEY = "ispilot:quick-replies:v1";

const SEED: QuickReply[] = [
  {
    id: "seed-onu",
    title: "Procedimento Padrão: Reinício de Equipamento",
    category: "Suporte Técnico",
    shortcut: "/reinicio",
    content:
      "Olá, {nome_cliente}! Para resolvermos a oscilação, por favor desligue a sua ONT da tomada, aguarde 30 segundos e ligue novamente. Assim que as luzes PON e Internet estabilizarem, faça um novo teste.",
    tags: ["ont", "wifi", "suporte"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-boleto",
    title: "Instrução de Envio de 2ª Via de Boleto",
    category: "Financeiro",
    shortcut: "/boleto",
    content:
      "Olá! Você pode baixar a 2ª via do seu boleto diretamente pelo nosso portal do cliente ou através do link seguro: {link_boleto}.",
    tags: ["financeiro", "boleto"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-sinal",
    title: "Identificação de Sinal Óptico Baixo (Atenuação)",
    category: "Suporte Técnico",
    shortcut: "/sinal",
    content:
      "Identificamos que o sinal óptico da sua fibra está em {sinal_rx}, abaixo do padrão ideal. Já abrimos um chamado técnico para nossa equipe de rede verificar o cabo na sua rua.",
    tags: ["fibra", "atenuacao", "noc"],
    updatedAt: new Date().toISOString(),
  },
];

function read(): QuickReply[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as QuickReply[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function useQuickReplies() {
  const [replies, setReplies] = useState<QuickReply[]>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReplies(read());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: QuickReply[]) => {
    setReplies(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const save = useCallback(
    (input: Omit<QuickReply, "id" | "updatedAt"> & { id?: string }) => {
      const now = new Date().toISOString();
      const current = read();
      const next = input.id
        ? current.map((item) =>
            item.id === input.id ? { ...item, ...input, id: item.id, updatedAt: now } : item,
          )
        : [
            {
              ...input,
              id: `qr-${Date.now().toString(36)}`,
              updatedAt: now,
            } as QuickReply,
            ...current,
          ];
      persist(next);
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => persist(read().filter((item) => item.id !== id)),
    [persist],
  );

  return { replies, hydrated, save, remove };
}

export function filterQuickReplies(
  replies: QuickReply[],
  query: string,
  category: QuickReplyCategory | "Todas",
) {
  const term = query.trim().toLowerCase();
  return replies.filter((reply) => {
    const matchesCategory = category === "Todas" || reply.category === category;
    if (!matchesCategory) return false;
    if (!term) return true;
    return (
      reply.title.toLowerCase().includes(term) ||
      reply.content.toLowerCase().includes(term) ||
      (reply.shortcut ?? "").toLowerCase().includes(term) ||
      reply.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });
}
