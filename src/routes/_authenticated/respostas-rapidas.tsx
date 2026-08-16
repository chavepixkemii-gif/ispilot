import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, MessageSquarePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ispilot/app-shell";
import { EmptyState } from "@/components/ispilot/ui-states";
import { QuickReplyDialog } from "@/components/ispilot/quick-reply-dialog";
import {
  QUICK_REPLY_CATEGORIES,
  filterQuickReplies,
  useQuickReplies,
  type QuickReply,
  type QuickReplyCategory,
} from "@/lib/quick-replies";

export const Route = createFileRoute("/_authenticated/respostas-rapidas")({
  head: () => ({
    meta: [
      { title: "Respostas Rápidas — ISPilot" },
      {
        name: "description",
        content:
          "Crie, organize e copie scripts de atendimento padronizados para o seu provedor de internet.",
      },
      { property: "og:title", content: "Respostas Rápidas — ISPilot" },
      {
        property: "og:description",
        content: "Central de templates de atendimento para suporte, financeiro e NOC.",
      },
    ],
  }),
  component: QuickRepliesPage,
});

const filters: (QuickReplyCategory | "Todas")[] = ["Todas", ...QUICK_REPLY_CATEGORIES];

function QuickRepliesPage() {
  const { replies, save, remove } = useQuickReplies();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<QuickReplyCategory | "Todas">("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuickReply | null>(null);

  const results = filterQuickReplies(replies, query, category);

  async function copy(reply: QuickReply) {
    try {
      await navigator.clipboard.writeText(reply.content);
      toast.success("Copiado com sucesso!");
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={MessageSquarePlus}
        title="Respostas Rápidas"
        description="Crie, organize e acesse rapidamente scripts de atendimento padronizados para o seu provedor."
        actions={
          <Button
            variant="hero"
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova Resposta
          </Button>
        }
      />

      <div className="space-y-4 px-4 py-5 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, conteúdo ou tag…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "rounded-full border border-primary/50 bg-primary/15 px-3 py-1 text-xs font-medium text-foreground"
                    : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title="Nenhuma resposta encontrada"
            description="Ajuste a busca ou crie um novo script padronizado para sua equipe."
            action={
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                Nova Resposta
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((reply, index) => (
              <motion.article
                key={reply.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="panel flex flex-col gap-3 p-4"
              >
                <div className="space-y-2">
                  <Badge variant="secondary" className="font-normal">
                    {reply.category}
                  </Badge>
                  <h2 className="text-sm font-semibold leading-snug text-foreground">
                    {reply.title}
                  </h2>
                </div>

                <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                  {reply.content}
                </p>

                {reply.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {reply.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-muted-foreground/80">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-3">
                  <Button
                    variant="soft"
                    size="sm"
                    className="flex-1"
                    onClick={() => void copy(reply)}
                  >
                    <Copy className="size-3.5" />
                    Copiar Resposta
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar resposta"
                    onClick={() => {
                      setEditing(reply);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir resposta"
                    onClick={() => {
                      remove(reply.id);
                      toast.success("Resposta excluída.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <QuickReplyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={(value) => {
          save(value);
          toast.success(editing ? "Resposta atualizada." : "Resposta criada.");
        }}
      />
    </div>
  );
}
