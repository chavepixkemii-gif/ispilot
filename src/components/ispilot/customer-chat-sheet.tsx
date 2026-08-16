import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Paperclip, Send, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QuickReplyPicker } from "@/components/ispilot/quick-reply-picker";
import { buildCustomerContext, CUSTOMER_CONTEXT_KEY, type Customer } from "@/lib/customers";
import { cn } from "@/lib/utils";

export function CustomerChatSheet({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(customer.chat);
  const [draft, setDraft] = useState("");

  function send() {
    const content = draft.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      {
        id: `m-${Date.now().toString(36)}`,
        from: "agent",
        content,
        at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
    toast.success("Mensagem enviada via WhatsApp");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="font-display text-base">{customer.name}</SheetTitle>
          <SheetDescription className="text-xs">
            WhatsApp {customer.phone} · {customer.plan}
          </SheetDescription>
          <Button
            variant="soft"
            size="sm"
            className="mt-2 justify-start"
            onClick={() => {
              window.sessionStorage.setItem(CUSTOMER_CONTEXT_KEY, buildCustomerContext(customer));
              void navigate({ to: "/assistente" });
            }}
          >
            <Sparkle className="size-4" />
            Perguntar à IA sobre este cliente
          </Button>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.from === "agent" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                  message.from === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="mt-1 block text-[10px] opacity-60">{message.at}</span>
              </div>
            </div>
          ))}
          {messages.length === 0 ? (
            <p className="pt-10 text-center text-xs text-muted-foreground">
              Nenhuma conversa registrada com este assinante.
            </p>
          ) : null}
        </div>

        <div className="border-t border-border p-3">
          <div className="panel flex items-end gap-1.5 p-2">
            <QuickReplyPicker
              onSelect={(content) =>
                setDraft((value) => {
                  const filled = content
                    .replaceAll("{nome_cliente}", customer.name.split(" ")[0] ?? customer.name)
                    .replaceAll("{plano}", customer.plan)
                    .replaceAll("{sinal_rx}", `${customer.rx} dBm`);
                  return value.trim() ? `${value.trimEnd()}\n\n${filled}` : filled;
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Anexar arquivo"
              onClick={() => toast.info("Anexos disponíveis na integração oficial do WhatsApp.")}
            >
              <Paperclip className="size-4" />
            </Button>
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Escreva para o cliente…"
              className="min-h-[44px] resize-none border-0 bg-transparent text-xs focus-visible:ring-0"
            />
            <Button variant="hero" size="icon-lg" onClick={send} disabled={!draft.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
          <Badge variant="outline" className="mt-2 text-[10px] font-normal">
            Canal WhatsApp Business
          </Badge>
        </div>
      </SheetContent>
    </Sheet>
  );
}