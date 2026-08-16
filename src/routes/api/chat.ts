import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/ai/prompt.server";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
  model: z.string().min(3).max(80).optional(),
  mode: z.enum(["support", "noc", "sales", "general"]).optional(),
  companyName: z.string().max(120).optional(),
  userName: z.string().max(120).optional(),
});

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function textStream(upstream: Response, extract: (event: unknown) => string | null) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const delta = extract(JSON.parse(payload));
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore malformed keep-alive chunks
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json());
        if (!parsed.success) {
          return Response.json({ error: "Requisição inválida" }, { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "IA não configurada" }, { status: 500 });
        }

        const { messages, model = "openai/gpt-5.6-sol", mode, companyName, userName } = parsed.data;
        const system = buildSystemPrompt({ companyName, userName, mode });
        const isOpenAi = model.startsWith("openai/");

        const endpoint = isOpenAi ? `${GATEWAY}/responses` : `${GATEWAY}/chat/completions`;
        const body = isOpenAi
          ? {
              model,
              stream: true,
              instructions: system,
              input: messages.map((message) => ({
                role: message.role,
                content: [
                  {
                    type: message.role === "user" ? "input_text" : "output_text",
                    text: message.content,
                  },
                ],
              })),
              store: false,
              reasoning: { effort: "low", summary: "auto" },
            }
          : {
              model,
              stream: true,
              messages: [{ role: "system", content: system }, ...messages],
            };

        const upstream = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify(body),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text();
          const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
          const message =
            status === 429
              ? "Limite de requisições atingido. Tente novamente em instantes."
              : status === 402
                ? "Créditos de IA esgotados no workspace."
                : "Falha ao consultar o modelo de IA.";
          console.error("ai gateway error", upstream.status, detail.slice(0, 500));
          return Response.json({ error: message }, { status });
        }

        const stream = textStream(upstream, (event) => {
          const payload = event as {
            type?: string;
            delta?: string;
            choices?: Array<{ delta?: { content?: string } }>;
          };
          if (payload.type === "response.output_text.delta") return payload.delta ?? null;
          if (payload.type) return null;
          return payload.choices?.[0]?.delta?.content ?? null;
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});