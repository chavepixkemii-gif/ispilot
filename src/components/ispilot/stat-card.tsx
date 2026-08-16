import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  invertDelta?: boolean;
  icon: LucideIcon;
  index?: number;
};

export function StatCard({
  label,
  value,
  hint,
  delta,
  invertDelta = false,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  const positive = delta === undefined ? undefined : invertDelta ? delta < 0 : delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="panel group relative overflow-hidden p-4 transition-colors hover:border-primary/30"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg border border-border bg-secondary/60 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Sobre ${label}`}
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56 text-xs">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {delta !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              positive
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}