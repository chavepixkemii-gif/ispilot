import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Logo } from "@/components/ispilot/logo";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar no ISPilot" },
      { name: "description", content: "Acesse o ambiente do seu provedor no ISPilot." },
      { property: "og:title", content: "Entrar no ISPilot" },
      { property: "og:description", content: "Acesse o ambiente do seu provedor no ISPilot." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Informe um e-mail válido" }).max(255),
  password: z.string().min(6, { message: "Mínimo de 6 caracteres" }).max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, { message: "Informe seu nome" }).max(120),
  companyName: z.string().trim().min(2, { message: "Informe o nome do provedor" }).max(120),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [remember, setRemember] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "", companyName: "" },
  });

  async function onSignIn(values: z.infer<typeof signInSchema>) {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    if (remember) localStorage.setItem("ispilot:last-email", values.email);
    toast.success("Bem-vindo de volta");
    void navigate({ to: "/dashboard", replace: true });
  }

  async function onSignUp(values: z.infer<typeof signUpSchema>) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: values.fullName, company_name: values.companyName },
      },
    });
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      toast.success("Confirme seu e-mail para ativar o ambiente");
      return;
    }
    void navigate({ to: "/dashboard", replace: true });
  }

  async function onGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setGoogleLoading(false);
    if (result.error) {
      toast.error("Falha no login com Google");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard", replace: true });
  }

  async function onForgotPassword() {
    const email = signInForm.getValues("email");
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Digite seu e-mail no campo acima para recuperar a senha");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) {
      toast.error("Não foi possível enviar o e-mail", { description: error.message });
      return;
    }
    toast.success("Enviamos um link de recuperação para seu e-mail");
  }

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo size={44} withWordmark={false} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              ISPilot
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Inteligência operacional para provedores de internet
            </p>
          </div>
        </div>

        <div className="panel p-6 shadow-[var(--shadow-elevated)]">
          {checkEmail ? (
            <div className="space-y-4 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-secondary/60 text-primary">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  Confirme seu e-mail
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Enviamos um link de ativação. Após confirmar, volte aqui para acessar o ambiente
                  do seu provedor.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setCheckEmail(false)}>
                Voltar para o login
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-5">
                <form className="space-y-4" onSubmit={signInForm.handleSubmit(onSignIn)}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@provedor.com.br"
                      {...signInForm.register("email")}
                    />
                    {signInForm.formState.errors.email ? (
                      <p className="text-[11px] text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...signInForm.register("password")}
                    />
                    {signInForm.formState.errors.password ? (
                      <p className="text-[11px] text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={remember}
                        onCheckedChange={(value) => setRemember(value === true)}
                      />
                      Lembrar login
                    </label>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    size="lg"
                    disabled={signInForm.formState.isSubmitting}
                  >
                    {signInForm.formState.isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <KeyRound className="size-4" />
                    )}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-5">
                <form className="space-y-4" onSubmit={signUpForm.handleSubmit(onSignUp)}>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Seu nome</Label>
                    <Input id="fullName" placeholder="Ana Souza" {...signUpForm.register("fullName")} />
                    {signUpForm.formState.errors.fullName ? (
                      <p className="text-[11px] text-destructive">
                        {signUpForm.formState.errors.fullName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">Nome do provedor</Label>
                    <Input
                      id="companyName"
                      placeholder="FiberNet Telecom"
                      {...signUpForm.register("companyName")}
                    />
                    {signUpForm.formState.errors.companyName ? (
                      <p className="text-[11px] text-destructive">
                        {signUpForm.formState.errors.companyName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">E-mail corporativo</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@provedor.com.br"
                      {...signUpForm.register("email")}
                    />
                    {signUpForm.formState.errors.email ? (
                      <p className="text-[11px] text-destructive">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      {...signUpForm.register("password")}
                    />
                    {signUpForm.formState.errors.password ? (
                      <p className="text-[11px] text-destructive">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    size="lg"
                    disabled={signUpForm.formState.isSubmitting}
                  >
                    {signUpForm.formState.isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    Criar ambiente
                  </Button>
                </form>
              </TabsContent>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  ou
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="glass"
                size="lg"
                className="w-full"
                onClick={onGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Entrar com Google
              </Button>
            </Tabs>
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" />
          Dados isolados por provedor · JWT · logs de auditoria
        </p>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Voltar para a página inicial
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}