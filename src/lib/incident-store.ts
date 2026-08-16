import { useCallback, useSyncExternalStore } from "react";
import { INITIAL_INCIDENTS, type Incident, type IncidentStatus } from "@/lib/network";

let incidents: Incident[] = INITIAL_INCIDENTS;
const listeners = new Set<() => void>();

function emit() {
  incidents = [...incidents];
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return incidents;
}

export function useIncidents() {
  const list = useSyncExternalStore(subscribe, snapshot, snapshot);

  const setStatus = useCallback((id: string, status: IncidentStatus) => {
    incidents = incidents.map((incident) => (incident.id === id ? { ...incident, status } : incident));
    emit();
  }, []);

  const markNotified = useCallback((id: string) => {
    incidents = incidents.map((incident) => (incident.id === id ? { ...incident, notified: true } : incident));
    emit();
  }, []);

  const addIncident = useCallback((incident: Incident) => {
    incidents = [incident, ...incidents];
    emit();
  }, []);

  return { incidents: list, setStatus, markNotified, addIncident };
}
