import { useSyncExternalStore } from "react";

let collapsed = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSidebarCollapsed(value: boolean) {
  if (collapsed === value) return;
  collapsed = value;
  emit();
}

export function toggleSidebarCollapsed() {
  setSidebarCollapsed(!collapsed);
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(
    subscribe,
    () => collapsed,
    () => false,
  );
}
