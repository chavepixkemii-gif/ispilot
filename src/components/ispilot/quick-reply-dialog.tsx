import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUICK_REPLY_CATEGORIES,
  QUICK_REPLY_VARIABLES,
  type QuickReply,
  type QuickReplyCategory,
} from "@/lib/quick-replies";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: QuickReply | null;
  onSave: (value: Omit<QuickReply, "id" | "updatedAt"> & { id?: string }) => void;
};

export function QuickReplyDialog({ open, onOpenChange, editing, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<QuickReplyCategory>("Suporte Técnico");
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setCategory(editing?.category ?? "Suporte Técnico");
    setShortcut(editing?.shortcut ?? "");
    setContent(editing?.content ?? "");
    setTags(editing?.tags ?? []);
    setTagDraft("");
  }, [open, editing]);

  function insertVariable(variable: string) {
    const el = contentRef.current;
    if (!el) {
      setContent((value) => `${value}${variable}`);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${variable}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    });
  }

  function commitTag() {
    const value = tagDraft.trim().replace(/^#/, "").toLowerCase();
    if (!value || tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagDraft("");
  }

  const valid = title.trim().length > 1 && content.trim().length > 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Editar resposta" : "Nova resposta rápida"}
          </DialogTitle>
          <DialogDescription>
            Padronize o atendimento com scripts prontos e variáveis dinâmicas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="qr-title">Título da resposta</Label>
            <Input
              id="qr-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Aviso de Manutenção na Região"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as QuickReplyCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_REPLY_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qr-shortcut">Atalho / keyword (opcional)</Label>
              <Input
                id="qr-shortcut"
                value={shortcut}
                onChange={(event) => setShortcut(event.target.value)}
                placeholder="/manutencao"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qr-content">Conteúdo da resposta</Label>
            <Textarea
              id="qr-content"
              ref={contentRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Olá, {nome_cliente}! ..."
              className="min-h-[160px] resize-y text-sm"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">Inserir variável:</span>
              {QUICK_REPLY_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qr-tags">Tags</Label>
            <Input
              id="qr-tags"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  commitTag();
                }
              }}
              onBlur={commitTag}
              placeholder="Digite e pressione Enter"
            />
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 font-normal">
                    #{tag}
                    <button
                      type="button"
                      aria-label={`Remover ${tag}`}
                      onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="hero"
            disabled={!valid}
            onClick={() => {
              onSave({
                ...(editing?.id ? { id: editing.id } : {}),
                title: title.trim(),
                category,
                ...(shortcut.trim() ? { shortcut: shortcut.trim() } : {}),
                content: content.trim(),
                tags,
              });
              onOpenChange(false);
            }}
          >
            Salvar resposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
