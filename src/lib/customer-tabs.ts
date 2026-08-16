import { useSyncExternalStore } from "react";

export type ModuleId =
  | "dashboard"
  | "cadastro"
  | "contatos"
  | "historico"
  | "planos"
  | "atendimentos"
  | "extratos"
  | "equipamentos";

export type CustomerTab = {
  id: string;
  name: string;
  module: ModuleId;
  /** Estado digitado em cada módulo, preservado ao alternar de aba. */
  drafts: Record<string, string>;
  /** Notas/contatos adicionados manualmente durante a sessão. */
  added: Record<string, string[]>;
};

type TabsState = { tabs: CustomerTab[]; activeId: string | null };

const STORAGE_KEY = "ispilot:clientes:abas";

let state: TabsState = { tabs: [], activeId: null };
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TabsState;
      if (Array.isArray(parsed.tabs)) state = parsed;
    }
  } catch {
    /* ignore */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_SNAPSHOT: TabsState = { tabs: [], activeId: null };

export function useCustomerTabs() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_SNAPSHOT,
  );
}

export function openCustomerTab(id: string, name: string) {
  const existing = state.tabs.find((tab) => tab.id === id);
  state = existing
    ? { ...state, activeId: id }
    : {
        tabs: [...state.tabs, { id, name, module: "dashboard", drafts: {}, added: {} }],
        activeId: id,
      };
  emit();
}

export function activateCustomerTab(id: string) {
  if (!state.tabs.some((tab) => tab.id === id)) return;
  state = { ...state, activeId: id };
  emit();
}

export function closeCustomerTab(id: string) {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index < 0) return;
  const tabs = state.tabs.filter((tab) => tab.id !== id);
  const activeId =
    state.activeId === id ? (tabs[index]?.id ?? tabs[index - 1]?.id ?? null) : state.activeId;
  state = { tabs, activeId };
  emit();
}

export function closeAllCustomerTabs() {
  state = { tabs: [], activeId: null };
  emit();
}

export function clearActiveCustomerTab() {
  state = { ...state, activeId: null };
  emit();
}

export function setTabModule(id: string, module: ModuleId) {
  state = { ...state, tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, module } : tab)) };
  emit();
}

export function setTabDraft(id: string, key: string, value: string) {
  state = {
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, drafts: { ...tab.drafts, [key]: value } } : tab)),
  };
  emit();
}

export function pushTabItem(id: string, key: string, value: string) {
  state = {
    ...state,
    tabs: state.tabs.map((tab) =>
      tab.id === id ? { ...tab, added: { ...tab.added, [key]: [value, ...(tab.added[key] ?? [])] } } : tab,
    ),
  };
  emit();
}
