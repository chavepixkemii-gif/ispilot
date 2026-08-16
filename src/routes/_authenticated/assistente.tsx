import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, useWorkspace } from "@/components/ispilot/app-shell";
import { EmptyState } from "@/components/ispilot/ui-states";
import { QuickReplyPicker } from "@/components/ispilot/quick-reply-picker";
import { AI_MODELS, DEFAULT_MODEL_ID } from "@/lib/ai/models";
import { CUSTOMER_CONTEXT_KEY } from "@/lib/customers";

export const Route = createFileRoute("/_authenticated/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente IA — ISPilot" },
      {
        name: "description",
        content: "Copiloto de IA especialista em redes de provedores de internet.",
      },
      { property: "og:title", content: "Assistente IA — ISPilot" },
      {
        property: "og:description",
        content: "Diagnóstico técnico e scripts de atendimento com IA especialista em ISPs.",
      },
    ],
  }),
  component: AssistantPage,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Cliente com RX -27dBm e lentidão: o que verificar?",
  "Como explicar CGNAT para um cliente que quer abrir porta?",
  "Checklist para queda de PPPoE intermitente em um bairro.",
];

function AssistantPage() {
  const { data: workspace } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const [mode, setMode] = useState<"general" | "support" | "noc" | "sales">("general");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const context = window.sessionStorage.getItem(CUSTOMER_CONTEXT_KEY);
    if (!context) return;
    window.sessionStorage.removeItem(CUSTOMER_CONTEXT_KEY);
    setInput(context);
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          model,
          mode,
          companyName: workspace?.company?.name ?? undefined,
          userName: workspace?.profile?.full_name ?? undefined,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Falha ao consultar a IA");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: assistant }]);
      }
      if (!assistant) {
        setMessages([
          ...next,
          { role: "assistant", content: "Não recebi resposta do modelo. Tente reformular." },
        ]);
      }
    } catch (error) {
      setMessages(next);
      toast.error(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        icon={Sparkle}
        title="Assistente IA"
        description="Especialista em redes de provedores, com contexto do seu ambiente."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="support">Suporte N1</SelectItem>
                <SelectItem value="noc">NOC / Rede</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="h-9 w-[190px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.length === 0 ? (
            <EmptyState
              icon={Sparkle}
              title="Como posso ajudar sua operação hoje?"
              description="Pergunte sobre sinal óptico, CGNAT, PPPoE, planos ou padronização de atendimento."
              action={
                <div className="mt-2 flex flex-col gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="soft"
                      size="sm"
                      className="justify-start text-left"
                      onClick={() => void send(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              }
            />
          ) : (
            messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={index} className="text-sm leading-relaxed text-foreground">
                  {message.content ? (
                    <div className="space-y-3 [&_a]:text-primary [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Analisando…
                    </span>
                  )}
                </div>
              ),
            )
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 md:px-6">
        <form
          className="panel mx-auto flex max-w-3xl items-end gap-2 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <QuickReplyPicker
            onSelect={(content) => {
              setInput((value) => (value.trim() ? `${value.trimEnd()}\n\n${content}` : content));
              inputRef.current?.focus();
            }}
          />
          <Textarea
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
            placeholder="Descreva o caso do cliente ou o cenário de rede…"
            className="min-h-[52px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0"
          />
          <Button type="submit" variant="hero" size="icon-lg" disabled={streaming || !input.trim()}>
            {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          O ISPilot pode errar. Valide ações críticas antes de aplicar na rede.
        </p>
      </div>
    </div>
  );
}