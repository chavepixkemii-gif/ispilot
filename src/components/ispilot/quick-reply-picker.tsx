import { useState } from "react";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { filterQuickReplies, useQuickReplies } from "@/lib/quick-replies";

export function QuickReplyPicker({ onSelect }: { onSelect: (content: string) => void }) {
  const { replies } = useQuickReplies();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = filterQuickReplies(replies, query, "Todas");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon-lg" aria-label="Respostas rápidas">
              <Zap className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Respostas rápidas</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" side="top" className="w-[340px] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar resposta salva…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Nenhuma resposta encontrada.
            </p>
          ) : (
            results.map((reply) => (
              <button
                key={reply.id}
                type="button"
                onClick={() => {
                  onSelect(reply.content);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-foreground">{reply.title}</span>
                  {reply.shortcut ? (
                    <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                      {reply.shortcut}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {reply.content}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
