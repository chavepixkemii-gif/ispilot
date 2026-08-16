import { motion } from "framer-motion";
import { ArrowDown, ChevronRight, Router, ShieldCheck, Waypoints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toneClasses, type FunnelStage, type RouterGuideStep } from "@/lib/unm2000";
import { cn } from "@/lib/utils";

export function FunnelStageCard({ stage, index }: { stage: FunnelStage; index: number }) {
  const tone = toneClasses(stage.tone);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={cn("panel relative overflow-hidden p-4", tone.border)}
      style={{ width: `calc(100% - ${index * 3}%)`, marginInline: "auto" }}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-[2px]", tone.bg)}>
        <motion.span
          className={cn("absolute top-0 h-[2px] w-24 rounded-full", tone.dot)}
          animate={{ x: ["-10%", "110%"] }}
          transition={{ duration: stage.tone === "critical" ? 1.4 : 2.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg border text-xs font-bold",
              tone.border,
              tone.bg,
              tone.text,
            )}
          >
            {stage.step}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{stage.title}</p>
            <p className="text-[11px] text-muted-foreground">{stage.subtitle}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("gap-1.5 text-[10px] uppercase tracking-wider", tone.border, tone.text)}>
          <span className={cn("size-1.5 rounded-full", tone.dot)} />
          {tone.label}
        </Badge>
      </div>

      <p className={cn("mt-3 text-xs font-medium", tone.text)}>{stage.headline}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {stage.metrics.map((metric) => {
          const mTone = toneClasses(metric.tone ?? "ok");
          return (
            <div key={metric.label} className="rounded-xl border border-border bg-secondary/30 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">{metric.label}</p>
              <p className={cn("mt-0.5 font-mono text-xs font-semibold", metric.tone ? mTone.text : "text-foreground")}>
                {metric.value}
              </p>
              {metric.note ? <p className="mt-0.5 text-[10px] text-muted-foreground">{metric.note}</p> : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function FunnelConnector({ tone }: { tone: FunnelStage["tone"] }) {
  const t = toneClasses(tone);
  return (
    <div className="relative mx-auto flex h-8 w-full items-center justify-center">
      <span className="absolute h-full w-[2px] bg-border" />
      <motion.span
        className={cn("absolute size-1.5 rounded-full", t.dot)}
        animate={{ y: [-12, 12], opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <ArrowDown className={cn("relative size-3.5", t.text)} />
    </div>
  );
}

export function RouterGuide({
  steps,
  routerLabel,
}: {
  steps: RouterGuideStep[];
  routerLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <Router className="size-4 text-primary" />
        Passo a passo visual — {routerLabel}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="panel flex flex-col gap-3 p-4"
          >
            <div className="flex items-start gap-2.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[image:var(--gradient-primary)] text-[11px] font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{step.instruction}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full bg-red-500/70" />
                <span className="size-2 rounded-full bg-amber-500/70" />
                <span className="size-2 rounded-full bg-emerald-500/70" />
                <span className="ml-2 flex items-center gap-1 font-mono">
                  {step.screen.breadcrumb}
                  <ChevronRight className="size-3" />
                </span>
              </div>
              <div className="space-y-1.5">
                {step.screen.fields.map((field) => (
                  <div
                    key={field.label}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-2.5 py-1.5 text-[11px]",
                      field.highlight
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground",
                    )}
                  >
                    <span>{field.label}</span>
                    <span className="font-mono font-semibold text-foreground">{field.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <span className="rounded-md bg-[image:var(--gradient-primary)] px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                  {step.screen.cta}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ScopeBadge({ scope }: { scope: "router" | "fibra" }) {
  return scope === "router" ? (
    <Badge variant="outline" className="gap-1.5 border-primary/40 text-[10px] uppercase tracking-wider text-primary">
      <ShieldCheck className="size-3" /> Resolvível remotamente
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5 border-red-500/40 text-[10px] uppercase tracking-wider text-red-400">
      <Waypoints className="size-3" /> Requer reparo de fibra
    </Badge>
  );
}
