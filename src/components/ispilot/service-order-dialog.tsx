import { useEffect, useState } from "react";
import { CalendarClock, ClipboardCheck, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  OS_PRIORITIES,
  OS_TEAMS,
  OS_TYPES,
  aiSuggestServiceOrder,
  type ServiceOrderDraft,
  type Ticket,
} from "@/lib/support";

export function ServiceOrderDialog({
  ticket,
  open,
  onOpenChange,
  onCreated,
}: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (draft: ServiceOrderDraft) => void;
}) {
  const [draft, setDraft] = useState<ServiceOrderDraft | null>(null);

  useEffect(() => {
    if (open && ticket) setDraft(aiSuggestServiceOrder(ticket));
  }, [open, ticket]);

  if (!ticket || !draft) return null;
  const update = <K extends keyof ServiceOrderDraft>(key: K, value: ServiceOrderDraft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const currentDraft = draft;
  const currentTicket = ticket;

  function save() {
    onCreated(currentDraft);
    onOpenChange(false);
    toast.success(`O.S. criada para ${currentTicket.customerName}`, {
      description: currentDraft.notifyCustomer
        ? `Confirmação enviada via WhatsApp: ${currentDraft.date} às ${currentDraft.time} — ${currentDraft.team}.`
        : "Cliente não notificado (opção desmarcada).",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-primary" />
            Ordem de serviço — {ticket.customerName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Campos pré-preenchidos pela IA. Você pode editar tudo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Tipo de serviço</Label>
            <Select value={draft.type} onValueChange={(value) => update("type", value)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OS_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Prioridade</Label>
            <Select value={draft.priority} onValueChange={(value) => update("priority", value as ServiceOrderDraft["priority"])}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OS_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority} className="text-xs">
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Endereço completo</Label>
          <Input value={draft.address} onChange={(event) => update("address", event.target.value)} className="h-9 text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Diagnóstico técnico compilado
          </Label>
          <Textarea
            value={draft.diagnosis}
            onChange={(event) => update("diagnosis", event.target.value)}
            rows={7}
            className="font-mono text-[11px] leading-relaxed"
          />
        </div>

        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <CalendarClock className="size-3.5" /> Agendamento
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Data</Label>
              <Input type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Hora</Label>
              <Input type="time" value={draft.time} onChange={(event) => update("time", event.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Equipe técnica</Label>
              <Select value={draft.team} onValueChange={(value) => update("team", value)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OS_TEAMS.map((team) => (
                    <SelectItem key={team} value={team} className="text-xs">
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-2.5 rounded-xl border border-border p-3">
          <Checkbox
            checked={draft.notifyCustomer}
            onCheckedChange={(value) => update("notifyCustomer", value === true)}
            className="mt-0.5"
          />
          <span className="text-xs text-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageCircle className="size-3.5 text-primary" />
              Avisar cliente via WhatsApp sobre o agendamento da O.S. (data e horário)
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              “Olá {ticket.customerName}! Sua visita técnica foi agendada para {draft.date} às {draft.time}. Equipe
              responsável: {draft.team}.”
            </span>
          </span>
        </label>

        <DialogFooter className="items-center">
          <Badge variant="outline" className="mr-auto text-[10px]">
            Protocolo {ticket.protocol}
          </Badge>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="hero" onClick={save}>
            <ClipboardCheck className="size-4" />
            Salvar ordem de serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
