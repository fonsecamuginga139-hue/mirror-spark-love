import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

type AuthMode = "signin" | "signup";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();

  const initialMode: AuthMode = location.state?.mode === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!name.trim()) {
        toast({ title: "Nome obrigatório", description: "Escreva o seu nome completo.", variant: "destructive" });
        return;
      }
      if (password.length < 6) {
        toast({ title: "Senha muito curta", description: "Use pelo menos 6 caracteres.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name: name.trim() },
          },
        });
        if (error) {
          toast({ title: "Não foi possível criar a conta", description: error.message, variant: "destructive" });
          setLoading(false);
          return;
        }
        toast({ title: "Bem-vindo ao Vault", description: "A sua conta está pronta." });
        navigate("/", { replace: true });
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Não foi possível entrar", description: error.message, variant: "destructive" });
          setLoading(false);
          return;
        }
        toast({ title: "Bem-vindo de volta" });
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <div className="relative z-10 p-4">
        <SEO
          title="Entrar ou criar a sua conta Vault"
          description="Acede ao Vault para gerir as tuas finanças pessoais. Entra ou cria uma conta grátis e começa os 7 dias de teste."
          path="/auth"
        />
        <button
          onClick={() => navigate("/pre-onboarding")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/vault-logo.png"
              alt="VAULT financial management logo"
              className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            />
            <h1 className="text-3xl font-bold tracking-wider text-foreground">
              VAULT — Acesso financeiro seguro
            </h1>
            <p className="text-muted-foreground">
              {mode === "signup" ? "Criar a sua conta" : "Bem-vindo de volta"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-card/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card/50 border-border/50 focus:border-primary"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold text-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === "signup" ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              {mode === "signup" ? "Já tem conta?" : "Novo no Vault?"}
              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-primary hover:underline font-medium ml-1"
              >
                {mode === "signup" ? "Entrar" : "Criar conta"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
