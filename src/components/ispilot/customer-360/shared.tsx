import { Copy } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const brl = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

export const tone = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  muted: "border-border bg-secondary/40 text-muted-foreground",
} as const;

export function copyValue(label: string, value: string) {
  void navigator.clipboard.writeText(value);
  toast.success(`${label} copiado`, { description: value });
}

export function Panel({
  title,
  icon: Icon,
  actions,
  children,
  className,
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card/60 backdrop-blur-xl", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {Icon ? <Icon className="size-3.5 text-primary" /> : null}
            {title}
          </p>
          {actions}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DataRow({
  label,
  value,
  copyable,
  className,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <span className={cn("flex items-center gap-1.5 text-right text-xs font-medium text-foreground", className)}>
        {value}
        {copyable ? (
          <button type="button" onClick={() => copyValue(label, value)} aria-label={`Copiar ${label}`}>
            <Copy className="size-3 text-muted-foreground transition-colors hover:text-primary" />
          </button>
        ) : null}
      </span>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <p className={cn("mt-1.5 font-mono text-sm text-foreground", valueClass)}>{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
