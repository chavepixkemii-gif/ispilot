import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Gauge,
  Radio,
  ShieldCheck,
  Sparkle,
  Stethoscope,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ispilot/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISPilot — Inteligência operacional para provedores de internet" },
      {
        name: "description",
        content:
          "Copiloto de IA para equipes de suporte, NOC e vendas de ISPs: diagnóstico de ONU, GPON, CGNAT e base de conhecimento em um único ambiente.",
      },
      { property: "og:title", content: "ISPilot — Inteligência operacional para ISPs" },
      {
        property: "og:description",
        content:
          "Reduza tempo médio de atendimento com IA especialista em redes de provedores. Diagnóstico guiado, base de conhecimento e relatórios.",
      },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    icon: Sparkle,
    title: "Assistente especialista",
    text: "IA treinada no vocabulário de ISP: PPPoE, GPON, CGNAT, VLAN, Mikrotik, Huawei, ZTE e mais.",
  },
  {
    icon: Stethoscope,
    title: "Diagnóstico guiado",
    text: "Informe RX, TX, LOS e status PON e receba causas prováveis com nível de confiança e checklist.",
  },
  {
    icon: BookOpen,
    title: "Conhecimento vivo",
    text: "Procedimentos, scripts de atendimento e fluxos internos com busca instantânea.",
  },
  {
    icon: Gauge,
    title: "Indicadores reais",
    text: "TMA, taxa de resolução, satisfação e economia de tempo por atendente.",
  },
];

function Landing() {
  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo subtitle="Operational AI" />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/auth">
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pt-16 md:pt-24"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Radio className="size-3 text-primary" />
            Copiloto para provedores
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            A camada de inteligência que seu <span className="text-gradient">ERP não entrega</span>.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            O ISPilot coloca um especialista em rede ao lado de cada atendente. Diagnóstico de sinal
            óptico, scripts padronizados e conhecimento centralizado — sem substituir seus sistemas
            atuais.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">
                Criar meu ambiente
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/auth">Já sou cliente</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-success" />
              Isolamento por provedor (multi-tenant)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Waypoints className="size-3.5 text-primary" />
              Arquitetura multi-modelo de IA
            </span>
          </div>
        </motion.section>

        <section className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="panel p-5"
            >
              <span className="grid size-9 place-items-center rounded-xl border border-border bg-secondary/50 text-primary">
                <pillar.icon className="size-4" />
              </span>
              <h2 className="mt-4 font-display text-sm font-semibold text-foreground">
                {pillar.title}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{pillar.text}</p>
            </motion.article>
          ))}
        </section>

        <section className="panel mt-16 flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Pronto para reduzir o TMA da sua operação?
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Crie seu ambiente em segundos. Cada provedor tem seus próprios dados, usuários e
              permissões.
            </p>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/auth">
              Entrar no ISPilot
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border px-5 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} ISPilot</span>
          <span>Inteligência operacional para ISPs</span>
        </div>
      </footer>
    </div>
  );
}
