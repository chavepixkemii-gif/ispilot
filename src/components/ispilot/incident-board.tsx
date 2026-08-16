import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Megaphone, Radio, Send, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIncidents } from "@/lib/incident-store";
import { INCIDENT_STATUSES, MASS_MESSAGE_TEMPLATE, type Incident } from "@/lib/network";
import { cn } from "@/lib/utils";

const severityClass = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

function MassDispatchDialog({
  incident,
  open,
  onOpenChange,
  onSent,
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (id: string) => void;
}) {
  const [message, setMessage] = useState(MASS_MESSAGE_TEMPLATE);
  const [sent, setSent] = useState(0);
  const [sending, setSending] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setSent(0);
      setSending(false);
      if (timer.current) clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [open]);

  if (!incident) return null;
  const current = incident;
  const total = current.affected;
  const percent = Math.min(100, Math.round((sent / total) * 100));

  function startDispatch() {
    setSending(true);
    timer.current = setInterval(() => {
      setSent((value) => {
        const next = Math.min(total, value + Math.ceil(total / 22));
        if (next >= total) {
          if (timer.current) clearInterval(timer.current);
          setSending(false);
          onSent(current.id);
          toast.success(`Comunicado entregue a ${total.toLocaleString("pt-BR")} clientes`);
        }
        return next;
      });
    }, 130);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-4 text-primary" />
            Comunicado de instabilidade
          </DialogTitle>
          <DialogDescription>
            Envio imediato via WhatsApp/SMS para os {total.toLocaleString("pt-BR")} assinantes da árvore afetada
            ({current.scope}).
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="text-xs"
        />

        {sent > 0 ? (
          <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {sent.toLocaleString("pt-BR")} / {total.toLocaleString("pt-BR")} enviados
              </span>
              <span className="font-mono text-muted-foreground">{percent}%</span>
            </div>
            <Progress value={percent} />
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {percent === 100 ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-400" /> Disparo concluído — chamadas na central
                  evitadas.
                </>
              ) : (
                <>
                  <Radio className="size-3.5 animate-pulse text-primary" /> Entregando em tempo real…
                </>
              )}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="hero" onClick={startDispatch} disabled={sending || percent === 100}>
            <Send className="size-4" />
            Disparar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IncidentBoard() {
  const { incidents, setStatus, markNotified } = useIncidents();
  const [target, setTarget] = useState<Incident | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-destructive" />
        <h2 className="font-display text-sm font-semibold text-foreground">Gestão de incidentes críticos</h2>
        <Badge variant="outline" className="text-[10px]">
          {incidents.filter((incident) => incident.status !== "RESOLVIDO").length} ativos
        </Badge>
      </div>

      <div className="space-y-2.5">
        {incidents.map((incident) => (
          <motion.article
            key={incident.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border bg-card/70 p-3.5",
              incident.severity === "critical" && incident.status !== "RESOLVIDO"
                ? "border-destructive/40"
                : "border-border",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", severityClass[incident.severity])}>
                    {incident.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{incident.detectedAt}</span>
                </div>
                <p className="mt-1.5 truncate font-mono text-xs font-semibold text-foreground">{incident.title}</p>
                <p className="text-[11px] text-muted-foreground">{incident.scope}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                  severityClass[incident.severity],
                  incident.severity === "critical" && incident.status !== "RESOLVIDO" && "animate-pulse",
                )}
              >
                {incident.affected.toLocaleString("pt-BR")} CLIENTES INATIVOS / SEM SINAL
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select
                value={incident.status}
                onValueChange={(value) => setStatus(incident.id, value as (typeof INCIDENT_STATUSES)[number])}
              >
                <SelectTrigger className="h-8 w-[230px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant={incident.severity === "critical" ? "destructive" : "hero"}
                onClick={() => setTarget(incident)}
                disabled={incident.status === "RESOLVIDO"}
              >
                <Zap className="size-4" />
                Disparar comunicado de instabilidade ({incident.affected.toLocaleString("pt-BR")} clientes)
              </Button>

              {incident.notified ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="size-3.5" /> comunicado enviado
                </span>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>

      <MassDispatchDialog
        incident={target}
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        onSent={markNotified}
      />
    </div>
  );
}
