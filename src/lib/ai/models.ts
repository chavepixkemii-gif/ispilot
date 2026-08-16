export type AiProviderId = "openai" | "google" | "anthropic";

export type AiModelOption = {
  id: string;
  label: string;
  provider: AiProviderId;
  description: string;
  available: boolean;
};

export const AI_PROVIDERS: Record<
  AiProviderId,
  { label: string; description: string; managed: boolean }
> = {
  openai: {
    label: "OpenAI",
    description: "Raciocínio avançado para diagnósticos complexos.",
    managed: true,
  },
  google: {
    label: "Google Gemini",
    description: "Alta velocidade e custo baixo para atendimento em volume.",
    managed: true,
  },
  anthropic: {
    label: "Anthropic Claude",
    description: "Disponível ao conectar uma chave própria nas integrações.",
    managed: false,
  },
};

export const AI_MODELS: AiModelOption[] = [
  {
    id: "openai/gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    provider: "openai",
    description: "Padrão ISPilot — melhor raciocínio técnico.",
    available: true,
  },
  {
    id: "openai/gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    provider: "openai",
    description: "Equilíbrio entre qualidade e custo.",
    available: true,
  },
  {
    id: "openai/gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    provider: "openai",
    description: "Respostas rápidas para primeiro nível.",
    available: true,
  },
  {
    id: "google/gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    provider: "google",
    description: "Altíssimo volume de atendimentos.",
    available: true,
  },
  {
    id: "google/gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    provider: "google",
    description: "Classificação e triagem de tickets.",
    available: true,
  },
];

export const DEFAULT_MODEL_ID = "openai/gpt-5.6-sol";

export function findModel(id: string) {
  return AI_MODELS.find((model) => model.id === id) ?? AI_MODELS[0];
}