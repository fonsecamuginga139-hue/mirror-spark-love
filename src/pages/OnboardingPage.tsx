import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sparkles, Check, Trophy, Trash2, Plus, Loader2,
  Crown, ShieldCheck, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { getLanguageMeta } from "@/lib/i18n/languages";
import { useCurrency } from "@/hooks/useCurrency";

type ShortLang = "en" | "pt" | "es";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCheckoutUrl } from "@/hooks/usePaymentSettings";
import { openCheckout } from "@/components/CheckoutRedirect";

type Currency = "USD" | "EUR" | "BRL" | "GBP";

const CURRENCIES: { id: Currency; label: string; symbol: string; flag: string }[] = [
  { id: "USD", label: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { id: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺" },
  { id: "BRL", label: "Real", symbol: "R$", flag: "🇧🇷" },
  { id: "GBP", label: "Pound", symbol: "£", flag: "🇬🇧" },
];

const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];

const CATEGORY_LIBRARY = [
  { id: "food", emoji: "🍔", color: "#F59E0B" },
  { id: "groceries", emoji: "🛒", color: "#10B981" },
  { id: "restaurants", emoji: "🍽️", color: "#F97316" },
  { id: "coffee", emoji: "☕", color: "#92400E" },
  { id: "fuel", emoji: "⛽", color: "#EF4444" },
  { id: "shopping", emoji: "🛍️", color: "#EC4899" },
  { id: "transport", emoji: "🚗", color: "#3B82F6" },
  { id: "salary", emoji: "💼", color: "#22C55E" },
  { id: "freelance", emoji: "🧑‍💻", color: "#8B5CF6" },
  { id: "subscriptions", emoji: "🔁", color: "#06B6D4" },
  { id: "utilities", emoji: "💡", color: "#EAB308" },
  { id: "health", emoji: "💊", color: "#F43F5E" },
  { id: "travel", emoji: "✈️", color: "#0EA5E9" },
  { id: "education", emoji: "🎓", color: "#6366F1" },
  { id: "business", emoji: "🏢", color: "#64748B" },
  { id: "investments", emoji: "📈", color: "#14B8A6" },
  { id: "housing", emoji: "🏠", color: "#A855F7" },
  { id: "savings", emoji: "💰", color: "#22C55E" },
  { id: "insurance", emoji: "🛡️", color: "#0891B2" },
  { id: "family", emoji: "👨‍👩‍👧", color: "#F472B6" },
  { id: "pets", emoji: "🐾", color: "#78716C" },
];

const CATEGORY_LABELS: Record<ShortLang, Record<string, string>> = {
  en: {
    food: "Food", groceries: "Groceries", restaurants: "Restaurants", coffee: "Coffee",
    fuel: "Fuel", shopping: "Shopping", transport: "Transport", salary: "Salary",
    freelance: "Freelance", subscriptions: "Subscriptions", utilities: "Utilities",
    health: "Health", travel: "Travel", education: "Education", business: "Business",
    investments: "Investments", housing: "Housing", savings: "Savings",
    insurance: "Insurance", family: "Family", pets: "Pets",
  },
  pt: {
    food: "Alimentação", groceries: "Mercado", restaurants: "Restaurantes", coffee: "Café",
    fuel: "Combustível", shopping: "Compras", transport: "Transporte", salary: "Salário",
    freelance: "Freelance", subscriptions: "Assinaturas", utilities: "Contas",
    health: "Saúde", travel: "Viagem", education: "Educação", business: "Negócios",
    investments: "Investimentos", housing: "Moradia", savings: "Poupança",
    insurance: "Seguros", family: "Família", pets: "Pets",
  },
  es: {
    food: "Comida", groceries: "Mercado", restaurants: "Restaurantes", coffee: "Café",
    fuel: "Combustible", shopping: "Compras", transport: "Transporte", salary: "Salario",
    freelance: "Freelance", subscriptions: "Suscripciones", utilities: "Servicios",
    health: "Salud", travel: "Viajes", education: "Educación", business: "Negocios",
    investments: "Inversiones", housing: "Vivienda", savings: "Ahorros",
    insurance: "Seguros", family: "Familia", pets: "Mascotas",
  },
};

// ---------- Rich per-language copy for every step ----------
type Copy = {
  welcomeTitle: string; welcomeSub: string;
  nameTitle: string; nameSub: string; namePh: string;
  langTitle: string; langSub: string;
  currTitle: string; currSub: string;
  ageTitle: string; ageSub: string;
  goalsTitle: string; goalsSub: string; goalsList: { id: string; label: string; emoji: string }[];
  painTitle: string; painSub: string; painList: { id: string; label: string; emoji: string }[];
  habitsTitle: string; habitsSub: string; habitsList: { id: string; label: string }[];
  incomeTitle: string; incomeSub: string; incomePh: string;
  incomeProfileTitle: string; incomeProfileSub: string; incomeProfileList: { id: string; label: string; emoji: string }[];
  billsTitle: string; billsSub: string; billsAdd: string; billsName: string;
  savingsTitle: string; savingsSub: string;
  inputTitle: string; inputSub: string; inputList: { id: string; label: string; emoji: string }[];
  catsTitle: string; catsSub: string; catsHint: string;
  summaryTitle: string; summarySub: string; summaryReady: string;
  paywallTitle: string; paywallSub: string; paywallBenefits: string[];
  paywallCta: string; paywallHint: string; paywallRestore: string;
  next: string; back: string; skip: string; finish: string;
  step: string; unlocked: string;
};

const COPY: Record<ShortLang, Copy> = {
  en: {
    welcomeTitle: "Welcome to Vault",
    welcomeSub: "Your money, finally under control. Let's design the app around your life — in under 90 seconds.",
    nameTitle: "What should we call you?", nameSub: "We'll personalize everything for you.", namePh: "Your name",
    langTitle: "Pick your language", langSub: "Every screen, every button, instantly.",
    currTitle: "Choose your currency", currSub: "All amounts across the app will use this.",
    ageTitle: "How old are you?", ageSub: "So we can benchmark you against similar profiles.",
    goalsTitle: "What matters most to you?", goalsSub: "Pick everything that fits — we'll shape the dashboard around it.",
    goalsList: [
      { id: "control", label: "Take control of my money", emoji: "🎯" },
      { id: "save", label: "Save more every month", emoji: "💰" },
      { id: "debt", label: "Get out of debt", emoji: "🧨" },
      { id: "invest", label: "Start investing", emoji: "📈" },
      { id: "travel", label: "Travel more", emoji: "✈️" },
      { id: "buy", label: "Buy something big", emoji: "🏡" },
    ],
    painTitle: "What frustrates you most today?", painSub: "Be honest — no judgement here.",
    painList: [
      { id: "leaks", label: "Money leaks I can't explain", emoji: "💸" },
      { id: "subs", label: "Too many subscriptions", emoji: "🔁" },
      { id: "cards", label: "Credit card surprises", emoji: "💳" },
      { id: "nothing", label: "Nothing left at end of month", emoji: "😩" },
    ],
    habitsTitle: "How would you describe your spending?", habitsSub: "This tunes our AI to your rhythm.",
    habitsList: [
      { id: "impulsive", label: "Impulsive — I buy in the moment" },
      { id: "planned", label: "Planned — mostly needs" },
      { id: "mixed", label: "A mix of both" },
      { id: "tight", label: "Very tight — every cent counts" },
    ],
    incomeTitle: "Monthly income", incomeSub: "We'll auto-create a recurring salary entry.", incomePh: "0.00",
    incomeProfileTitle: "How do you get paid?", incomeProfileSub: "This helps us group your income right.",
    incomeProfileList: [
      { id: "salary", label: "Fixed salary", emoji: "💼" },
      { id: "freelance", label: "Freelance / variable", emoji: "🧑‍💻" },
      { id: "business", label: "My own business", emoji: "🏢" },
      { id: "multiple", label: "Multiple sources", emoji: "🎛️" },
    ],
    billsTitle: "Your recurring bills",
    billsSub: "Add anything you pay every month. Skip if none.",
    billsAdd: "Add another bill", billsName: "Bill name",
    savingsTitle: "How much do you want to save?", savingsSub: "We'll create a goal to hit this every month.",
    inputTitle: "How do you like to log expenses?", inputSub: "Vault supports them all — pick your favorite.",
    inputList: [
      { id: "voice", label: "Voice — just say it", emoji: "🎙️" },
      { id: "camera", label: "Camera — scan the receipt", emoji: "📸" },
      { id: "manual", label: "Manual — I like typing", emoji: "⌨️" },
      { id: "auto", label: "Automatic — surprise me", emoji: "🤖" },
    ],
    catsTitle: "Pick your favorite categories", catsSub: "These will appear first on your Home. You can change them anytime.",
    catsHint: "Vault's AI will auto-create any new category you mention.",
    summaryTitle: "Your plan is ready", summarySub: "Vault is now tuned to your financial life.",
    summaryReady: "Everything you told us is saved and encrypted.",
    paywallTitle: "Unlock Vault Premium",
    paywallSub: "7 days free. Card required. Cancel anytime — no charge until day 8.",
    paywallBenefits: [
      "Unlimited transactions & AI voice logging",
      "Real-time dashboards & smart alerts",
      "Receipt scanning with AI",
      "Custom categories, goals & recurring bills",
      "Priority support",
    ],
    paywallCta: "Start 7-Day Free Trial",
    paywallHint: "Card required · Cancel anytime · No charge for 7 days",
    paywallRestore: "Restore purchase",
    next: "Continue", back: "Back", skip: "Skip", finish: "Finish setup",
    step: "Step", unlocked: "Unlocked",
  },
  pt: {
    welcomeTitle: "Bem-vindo ao Vault",
    welcomeSub: "Seu dinheiro, finalmente sob controle. Vamos moldar o app à sua vida em menos de 90 segundos.",
    nameTitle: "Como podemos te chamar?", nameSub: "Vamos personalizar tudo para você.", namePh: "Seu nome",
    langTitle: "Escolha seu idioma", langSub: "Cada tela, cada botão, na hora.",
    currTitle: "Escolha sua moeda", currSub: "Todos os valores do app usarão esta moeda.",
    ageTitle: "Qual sua idade?", ageSub: "Para comparar você a perfis parecidos.",
    goalsTitle: "O que mais importa para você?", goalsSub: "Escolha tudo que se aplica — vamos moldar seu painel.",
    goalsList: [
      { id: "control", label: "Ter controle do meu dinheiro", emoji: "🎯" },
      { id: "save", label: "Poupar todo mês", emoji: "💰" },
      { id: "debt", label: "Sair das dívidas", emoji: "🧨" },
      { id: "invest", label: "Começar a investir", emoji: "📈" },
      { id: "travel", label: "Viajar mais", emoji: "✈️" },
      { id: "buy", label: "Comprar algo grande", emoji: "🏡" },
    ],
    painTitle: "O que mais te frustra hoje?", painSub: "Seja sincero — sem julgamentos.",
    painList: [
      { id: "leaks", label: "Dinheiro some sem explicação", emoji: "💸" },
      { id: "subs", label: "Assinaturas demais", emoji: "🔁" },
      { id: "cards", label: "Surpresas no cartão", emoji: "💳" },
      { id: "nothing", label: "Não sobra nada no fim do mês", emoji: "😩" },
    ],
    habitsTitle: "Como descreveria seus gastos?", habitsSub: "Isso calibra nossa IA para o seu ritmo.",
    habitsList: [
      { id: "impulsive", label: "Impulsivo — compro na hora" },
      { id: "planned", label: "Planejado — só o necessário" },
      { id: "mixed", label: "Um pouco dos dois" },
      { id: "tight", label: "Bem apertado — cada centavo conta" },
    ],
    incomeTitle: "Renda mensal", incomeSub: "Vamos criar uma receita recorrente automaticamente.", incomePh: "0,00",
    incomeProfileTitle: "Como você recebe?", incomeProfileSub: "Ajuda a agrupar sua renda corretamente.",
    incomeProfileList: [
      { id: "salary", label: "Salário fixo", emoji: "💼" },
      { id: "freelance", label: "Freelance / variável", emoji: "🧑‍💻" },
      { id: "business", label: "Meu próprio negócio", emoji: "🏢" },
      { id: "multiple", label: "Várias fontes", emoji: "🎛️" },
    ],
    billsTitle: "Suas contas fixas",
    billsSub: "Adicione o que paga todo mês. Pule se não tiver.",
    billsAdd: "Adicionar outra conta", billsName: "Nome da conta",
    savingsTitle: "Quanto quer poupar?", savingsSub: "Criaremos uma meta mensal para isso.",
    inputTitle: "Como prefere lançar despesas?", inputSub: "O Vault aceita todas — escolha a sua.",
    inputList: [
      { id: "voice", label: "Voz — só falar", emoji: "🎙️" },
      { id: "camera", label: "Câmera — escanear recibo", emoji: "📸" },
      { id: "manual", label: "Manual — gosto de digitar", emoji: "⌨️" },
      { id: "auto", label: "Automático — me surpreenda", emoji: "🤖" },
    ],
    catsTitle: "Escolha suas categorias favoritas", catsSub: "Aparecerão primeiro na Home. Pode mudar depois.",
    catsHint: "A IA do Vault cria automaticamente qualquer categoria nova que você mencionar.",
    summaryTitle: "Seu plano está pronto", summarySub: "O Vault agora está calibrado para sua vida financeira.",
    summaryReady: "Tudo que você contou está salvo e criptografado.",
    paywallTitle: "Desbloqueie o Vault Premium",
    paywallSub: "7 dias grátis. Cartão obrigatório. Cancele quando quiser — só cobramos no 8º dia.",
    paywallBenefits: [
      "Transações ilimitadas e voz por IA",
      "Painéis em tempo real e alertas inteligentes",
      "Leitura de recibos com IA",
      "Categorias, metas e contas recorrentes",
      "Suporte prioritário",
    ],
    paywallCta: "Iniciar 7 dias grátis",
    paywallHint: "Cartão obrigatório · Cancele quando quiser · Nada é cobrado por 7 dias",
    paywallRestore: "Restaurar compra",
    next: "Continuar", back: "Voltar", skip: "Pular", finish: "Concluir configuração",
    step: "Passo", unlocked: "Desbloqueado",
  },
  es: {
    welcomeTitle: "Bienvenido a Vault",
    welcomeSub: "Tu dinero, por fin bajo control. Ajustemos la app a tu vida en menos de 90 segundos.",
    nameTitle: "¿Cómo te llamamos?", nameSub: "Vamos a personalizar todo para ti.", namePh: "Tu nombre",
    langTitle: "Elige tu idioma", langSub: "Cada pantalla, cada botón, al instante.",
    currTitle: "Elige tu moneda", currSub: "Todos los importes en la app usarán esta moneda.",
    ageTitle: "¿Cuántos años tienes?", ageSub: "Para compararte con perfiles similares.",
    goalsTitle: "¿Qué es lo más importante?", goalsSub: "Elige todo lo que aplique — moldeamos tu panel.",
    goalsList: [
      { id: "control", label: "Controlar mi dinero", emoji: "🎯" },
      { id: "save", label: "Ahorrar cada mes", emoji: "💰" },
      { id: "debt", label: "Salir de deudas", emoji: "🧨" },
      { id: "invest", label: "Empezar a invertir", emoji: "📈" },
      { id: "travel", label: "Viajar más", emoji: "✈️" },
      { id: "buy", label: "Comprar algo grande", emoji: "🏡" },
    ],
    painTitle: "¿Qué te frustra más hoy?", painSub: "Sé honesto — sin juicios.",
    painList: [
      { id: "leaks", label: "El dinero se va sin explicación", emoji: "💸" },
      { id: "subs", label: "Demasiadas suscripciones", emoji: "🔁" },
      { id: "cards", label: "Sorpresas en la tarjeta", emoji: "💳" },
      { id: "nothing", label: "No sobra nada a fin de mes", emoji: "😩" },
    ],
    habitsTitle: "¿Cómo describirías tu gasto?", habitsSub: "Esto ajusta la IA a tu ritmo.",
    habitsList: [
      { id: "impulsive", label: "Impulsivo — compro al momento" },
      { id: "planned", label: "Planificado — solo lo necesario" },
      { id: "mixed", label: "Un poco de ambos" },
      { id: "tight", label: "Muy ajustado — cada céntimo cuenta" },
    ],
    incomeTitle: "Ingreso mensual", incomeSub: "Crearemos un ingreso recurrente automáticamente.", incomePh: "0,00",
    incomeProfileTitle: "¿Cómo cobras?", incomeProfileSub: "Nos ayuda a agrupar tus ingresos.",
    incomeProfileList: [
      { id: "salary", label: "Salario fijo", emoji: "💼" },
      { id: "freelance", label: "Freelance / variable", emoji: "🧑‍💻" },
      { id: "business", label: "Mi propio negocio", emoji: "🏢" },
      { id: "multiple", label: "Varias fuentes", emoji: "🎛️" },
    ],
    billsTitle: "Tus gastos fijos",
    billsSub: "Añade lo que pagas cada mes. Salta si no tienes.",
    billsAdd: "Añadir otro gasto", billsName: "Nombre del gasto",
    savingsTitle: "¿Cuánto quieres ahorrar?", savingsSub: "Crearemos una meta mensual para ello.",
    inputTitle: "¿Cómo prefieres registrar gastos?", inputSub: "Vault soporta todo — elige el tuyo.",
    inputList: [
      { id: "voice", label: "Voz — solo hablar", emoji: "🎙️" },
      { id: "camera", label: "Cámara — escanear recibo", emoji: "📸" },
      { id: "manual", label: "Manual — me gusta escribir", emoji: "⌨️" },
      { id: "auto", label: "Automático — sorpréndeme", emoji: "🤖" },
    ],
    catsTitle: "Elige tus categorías favoritas", catsSub: "Aparecerán primero en tu Home. Cámbialas cuando quieras.",
    catsHint: "La IA de Vault crea automáticamente cualquier categoría nueva que menciones.",
    summaryTitle: "Tu plan está listo", summarySub: "Vault ya está ajustado a tu vida financiera.",
    summaryReady: "Todo lo que nos contaste está guardado y cifrado.",
    paywallTitle: "Desbloquea Vault Premium",
    paywallSub: "7 días gratis. Tarjeta requerida. Cancela cuando quieras — sin cargo hasta el día 8.",
    paywallBenefits: [
      "Transacciones ilimitadas y voz con IA",
      "Paneles en tiempo real y alertas",
      "Lectura de recibos con IA",
      "Categorías, metas y gastos recurrentes",
      "Soporte prioritario",
    ],
    paywallCta: "Comenzar 7 días gratis",
    paywallHint: "Tarjeta requerida · Cancela cuando quieras · Sin cargos por 7 días",
    paywallRestore: "Restaurar compra",
    next: "Continuar", back: "Atrás", skip: "Saltar", finish: "Terminar",
    step: "Paso", unlocked: "Desbloqueado",
  },
};

interface State {
  name: string;
  language: ShortLang;
  currency: Currency;
  ageRange: string;
  goals: string[];
  pains: string[];
  habits: string;
  incomeProfile: string;
  monthlyIncome: number;
  bills: { name: string; amount: number }[];
  savingsTarget: number;
  inputPref: string;
  categories: string[];
}

const STEPS = [
  "welcome", "name", "age",
  "goals", "pains", "habits",
  "incomeProfile", "income", "bills", "savings",
  "inputPref", "categories", "summary", "paywall",
] as const;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const shortLang = (getLanguageMeta(language).short as ShortLang);
  const { currency: userCurrency } = useCurrency();
  const { monthlyCheckoutUrl, yearlyCheckoutUrl, loading: loadingCheckout } = useCheckoutUrl();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [state, setState] = useState<State>({
    name: "",
    language: "en",
    currency: "USD",
    ageRange: "",
    goals: [],
    pains: [],
    habits: "",
    incomeProfile: "",
    monthlyIncome: 0,
    bills: [{ name: "", amount: 0 }],
    savingsTarget: 0,
    inputPref: "",
    categories: ["food", "groceries", "transport", "salary", "shopping", "housing"],
  });

  useEffect(() => {
    if (profile?.name && !state.name) setState((s) => ({ ...s, name: profile.name || "" }));
    // eslint-disable-next-line
  }, [profile?.name]);

  const t = COPY[COPY[shortLang] ? shortLang : "en"];
  const symbol = CURRENCIES.find((c) => c.id === (userCurrency as Currency))?.symbol ?? "$";
  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const current = STEPS[step];

  // Keep this screen mounted while checkout is being prepared. Realtime can deliver
  // onboarding_completed before window.location.assign runs; redirecting here first
  // would incorrectly send the user to the dashboard instead of Hotmart.
  if (!loading && profile?.onboarding_completed && !submitting) return <Navigate to="/dashboard" replace />;

  const update = <K extends keyof State>(k: K, v: State[K]) => setState((s) => ({ ...s, [k]: v }));
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const canContinue = () => {
    switch (current) {
      case "welcome": return true;
      case "name": return state.name.trim().length > 1;
            case "age": return !!state.ageRange;
      case "goals": return state.goals.length > 0;
      case "pains": return state.pains.length > 0;
      case "habits": return !!state.habits;
      case "incomeProfile": return !!state.incomeProfile;
      case "income": return state.monthlyIncome > 0;
      case "bills": return true;
      case "savings": return state.savingsTarget > 0;
      case "inputPref": return !!state.inputPref;
      case "categories": return state.categories.length >= 3;
      case "summary": return true;
      case "paywall": return true;
      default: return false;
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => (step === 0 ? navigate("/") : setStep((s) => s - 1));

  // Persist to Supabase and provision defaults
  const persistAndUnlock = async (): Promise<boolean> => {
    if (!user) return false;
    setSubmitting(true);
    try {
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          name: state.name,
          language: language,
          currency: userCurrency as any,
          monthly_income: state.monthlyIncome,
          selected_categories: state.categories as any,
          onboarding_completed: true,
          pre_onboarding_completed: true,
          // Hard paywall: no access until Hotmart webhook activates the account.
          plan_status: "awaiting_payment" as any,
          plano: "free" as any,
          quiz_answers: {
            ageRange: state.ageRange,
            goals: state.goals,
            pains: state.pains,
            habits: state.habits,
            incomeProfile: state.incomeProfile,
            savingsTarget: state.savingsTarget,
            inputPref: state.inputPref,
          } as any,
        } as any)
        .eq("user_id", user.id);
      if (profErr) throw profErr;

      // Default wallet card
      const { data: existingCards } = await supabase.from("cards").select("id").eq("user_id", user.id).limit(1);
      let cardId = existingCards?.[0]?.id as string | undefined;
      if (!cardId) {
        const { data: card, error: cardErr } = await supabase
          .from("cards")
          .insert({ user_id: user.id, name: "Wallet", icon: "wallet", color: "#22C55E" } as any)
          .select().single();
        if (cardErr) throw cardErr;
        cardId = card.id;
      }

      // Insert selected categories
      const catRows = state.categories
        .map((id) => CATEGORY_LIBRARY.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({
          user_id: user.id,
          name: CATEGORY_LABELS[shortLang][c!.id] || c!.id,
          icon: c!.emoji,
          color: c!.color,
          type: ["salary", "freelance", "business", "investments"].includes(c!.id) ? "income" : "expense",
        }));
      if (catRows.length > 0) {
        await (supabase as any).from("categories").insert(catRows);
      }

      // Recurring income
      if (state.monthlyIncome > 0 && cardId) {
        await supabase.from("recurring_transactions").insert({
          user_id: user.id, card_id: cardId, type: "income",
          amount: state.monthlyIncome, description: "Monthly income",
          day_of_month: 1, auto_process: true, is_active: true,
        } as any);
      }

      // Bills
      const bills = state.bills.filter((b) => b.name.trim() && b.amount > 0);
      if (bills.length > 0) {
        await (supabase as any).from("monthly_bills").insert(
          bills.map((b) => ({ user_id: user.id, name: b.name.trim(), amount: b.amount, currency: userCurrency, active: true }))
        );
      }

      // Savings goal
      if (state.savingsTarget > 0 && cardId) {
        await supabase.from("goals").insert({
          user_id: user.id, card_id: cardId, name: "Monthly Savings",
          target_amount: state.savingsTarget, current_amount: 0, icon: "target", color: "#22C55E",
        } as any);
      }

      return true;
    } catch (e: any) {
      toast.error(e.message || "Setup error");
      setSubmitting(false);
      return false;
    }
  };

  const handleStartTrial = async () => {
    const url = selectedPlan === "yearly"
      ? (yearlyCheckoutUrl || monthlyCheckoutUrl)
      : monthlyCheckoutUrl;
    if (!url) {
      toast.error("Checkout Hotmart não configurado para este plano.");
      return;
    }

    const ok = await persistAndUnlock();
    if (!ok) return;
    const isAdmin = (profile as any)?.plano === "admin";
    if (isAdmin) {
      setSubmitting(false);
      navigate("/dashboard", { replace: true });
      return;
    }

    // Same-tab redirect keeps checkout in the app navigation flow. Do not clear
    // submitting before leaving, otherwise the onboarding guard can race to /dashboard.
    openCheckout(url, profile?.email || user?.email);
  };

  const handleRestore = async () => {
    toast.info("Restoring purchase… please sign in with the email used for payment.");
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_10%,hsl(var(--primary)/0.14),transparent)]" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.18),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="relative px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={back} className="p-1 text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-2 rounded-full bg-card/60 overflow-hidden border border-border/40">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/60 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
          {step + 1}/{totalSteps}
        </span>
      </div>

      <div className="relative flex-1 px-5 py-4 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
            className="max-w-md mx-auto space-y-6"
          >
            {current === "welcome" && (
              <div className="text-center space-y-6 pt-8">
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-primary/5 border border-primary/40 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.35)]">
                  <Sparkles className="w-11 h-11 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{t.welcomeTitle}</h1>
                <p className="text-muted-foreground leading-relaxed px-2">{t.welcomeSub}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/70">
                  <ShieldCheck className="w-3.5 h-3.5" /> Private · Encrypted · Under your control
                </div>
              </div>
            )}

            {current === "name" && (
              <StepShell title={t.nameTitle} sub={t.nameSub}>
                <Input value={state.name} onChange={(e) => update("name", e.target.value)}
                  placeholder={t.namePh} autoFocus className="h-14 text-lg bg-card/50 rounded-2xl" />
              </StepShell>
            )}

            
            
            {current === "age" && (
              <StepShell title={t.ageTitle} sub={t.ageSub}>
                <div className="grid gap-2">
                  {AGE_RANGES.map((a) => (
                    <SelectBtn key={a} active={state.ageRange === a} onClick={() => update("ageRange", a)}>
                      <span className="font-medium">{a}</span>
                    </SelectBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "goals" && (
              <StepShell title={t.goalsTitle} sub={t.goalsSub}>
                <div className="grid grid-cols-2 gap-2.5">
                  {t.goalsList.map((g) => (
                    <ChipBtn key={g.id} active={state.goals.includes(g.id)}
                      onClick={() => update("goals", toggle(state.goals, g.id))}>
                      <span className="text-xl">{g.emoji}</span>
                      <span className="text-sm font-medium">{g.label}</span>
                    </ChipBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "pains" && (
              <StepShell title={t.painTitle} sub={t.painSub}>
                <div className="grid gap-2">
                  {t.painList.map((p) => (
                    <SelectBtn key={p.id} active={state.pains.includes(p.id)}
                      onClick={() => update("pains", toggle(state.pains, p.id))}>
                      <span className="text-xl">{p.emoji}</span>
                      <span className="font-medium">{p.label}</span>
                    </SelectBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "habits" && (
              <StepShell title={t.habitsTitle} sub={t.habitsSub}>
                <div className="grid gap-2">
                  {t.habitsList.map((h) => (
                    <SelectBtn key={h.id} active={state.habits === h.id} onClick={() => update("habits", h.id)}>
                      <span className="font-medium">{h.label}</span>
                    </SelectBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "incomeProfile" && (
              <StepShell title={t.incomeProfileTitle} sub={t.incomeProfileSub}>
                <div className="grid grid-cols-2 gap-2.5">
                  {t.incomeProfileList.map((p) => (
                    <ChipBtn key={p.id} active={state.incomeProfile === p.id}
                      onClick={() => update("incomeProfile", p.id)}>
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                    </ChipBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "income" && (
              <StepShell title={t.incomeTitle} sub={t.incomeSub}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">{symbol}</span>
                  <Input type="number" inputMode="decimal" value={state.monthlyIncome || ""}
                    onChange={(e) => update("monthlyIncome", parseFloat(e.target.value) || 0)}
                    placeholder={t.incomePh} className="pl-10 h-14 text-lg font-medium bg-card/50 rounded-2xl" />
                </div>
              </StepShell>
            )}

            {current === "bills" && (
              <StepShell title={t.billsTitle} sub={t.billsSub}>
                <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                  {state.bills.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-2xl border border-border bg-card/40 p-3">
                      <Input value={b.name} placeholder={t.billsName}
                        onChange={(e) => { const nx = [...state.bills]; nx[idx].name = e.target.value; update("bills", nx); }}
                        className="flex-1 h-11 bg-background/40" />
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{symbol}</span>
                        <Input type="number" inputMode="decimal" value={b.amount || ""}
                          onChange={(e) => { const nx = [...state.bills]; nx[idx].amount = parseFloat(e.target.value) || 0; update("bills", nx); }}
                          className="pl-6 h-11 bg-background/40" />
                      </div>
                      <button onClick={() => update("bills", state.bills.filter((_, i) => i !== idx))}
                        className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => update("bills", [...state.bills, { name: "", amount: 0 }])}
                  className="w-full border border-dashed border-border rounded-2xl h-11">
                  <Plus className="w-4 h-4 mr-2" /> {t.billsAdd}
                </Button>
              </StepShell>
            )}

            {current === "savings" && (
              <StepShell title={t.savingsTitle} sub={t.savingsSub}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">{symbol}</span>
                  <Input type="number" inputMode="decimal" value={state.savingsTarget || ""}
                    onChange={(e) => update("savingsTarget", parseFloat(e.target.value) || 0)}
                    placeholder="0.00" className="pl-10 h-14 text-lg font-medium bg-card/50 rounded-2xl" />
                </div>
              </StepShell>
            )}

            {current === "inputPref" && (
              <StepShell title={t.inputTitle} sub={t.inputSub}>
                <div className="grid grid-cols-2 gap-2.5">
                  {t.inputList.map((p) => (
                    <ChipBtn key={p.id} active={state.inputPref === p.id} onClick={() => update("inputPref", p.id)}>
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                    </ChipBtn>
                  ))}
                </div>
              </StepShell>
            )}

            {current === "categories" && (
              <StepShell title={t.catsTitle} sub={t.catsSub}>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_LIBRARY.map((c) => {
                    const active = state.categories.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => update("categories", toggle(state.categories, c.id))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                          active ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
                            : "border-border bg-card/40"
                        }`}>
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-[11px] font-medium text-center leading-tight">
                          {CATEGORY_LABELS[shortLang][c.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground text-center px-4 mt-4">{t.catsHint}</p>
              </StepShell>
            )}

            {current === "summary" && (
              <div className="text-center space-y-6 pt-4">
                <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                  className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.4)]">
                  <Trophy className="w-12 h-12 text-primary" />
                </motion.div>
                <h1 className="text-3xl font-bold">{t.summaryTitle}</h1>
                <p className="text-muted-foreground px-2">{t.summarySub}</p>
                <div className="rounded-2xl border border-border bg-card/40 p-4 text-left space-y-2 text-sm">
                  <Row label="Name" value={state.name} />
                  <Row label="Currency" value={`${symbol} ${userCurrency}`} />
                  <Row label="Monthly income" value={`${symbol} ${state.monthlyIncome.toFixed(2)}`} />
                  <Row label="Savings target" value={`${symbol} ${state.savingsTarget.toFixed(2)}`} />
                  <Row label="Categories" value={String(state.categories.length)} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs">
                  <Check className="w-3.5 h-3.5" /> {t.summaryReady}
                </div>
              </div>
            )}

            {current === "paywall" && (() => {
              const symbol = CURRENCIES.find((c) => c.id === (userCurrency as Currency))?.symbol ?? "$";
              const monthlyP = 4.99;
              const yearlyP = 9.99;
              const savePct = Math.round((1 - yearlyP / (monthlyP * 12)) * 100);
              const paywallCopy = {
                en: {
                  title: "The day you take control of your money is today.",
                  aida: "You've seen where your money goes. You've felt the leaks. Now decide: keep guessing — or unlock the clarity, control and growth Vault was built to give you.",
                  choose: "Choose your plan", monthly: "Monthly", yearly: "Yearly",
                  monthlySub: "Billed monthly", yearlySub: `Just ${symbol}${(yearlyP/12).toFixed(2)}/mo · billed yearly`,
                  best: "BEST VALUE", save: `Save ${savePct}%`,
                  cta: `Try for ${symbol}0.00 · 7 days free`,
                  hint: `Card required · Cancel anytime · ${symbol}0.00 today, ${symbol}${(selectedPlan==="yearly"?yearlyP:monthlyP).toFixed(2)} on day 8`,
                  perMo: "/mo", perYr: "/yr",
                },
                pt: {
                  title: "O dia de organizar suas finanças é agora.",
                  aida: "Você já viu para onde o dinheiro vai. Já sentiu os vazamentos. Agora decida: continuar no escuro — ou desbloquear a clareza, o controle e o crescimento que o Vault foi feito para te dar.",
                  choose: "Escolha seu plano", monthly: "Mensal", yearly: "Anual",
                  monthlySub: "Cobrança mensal", yearlySub: `Apenas ${symbol}${(yearlyP/12).toFixed(2)}/mês · cobrança anual`,
                  best: "MELHOR VALOR", save: `Economize ${savePct}%`,
                  cta: `Teste por ${symbol}0,00 · 7 dias grátis`,
                  hint: `Cartão obrigatório · Cancele quando quiser · ${symbol}0,00 hoje, ${symbol}${(selectedPlan==="yearly"?yearlyP:monthlyP).toFixed(2)} no 8º dia`,
                  perMo: "/mês", perYr: "/ano",
                },
                es: {
                  title: "El día de organizar tus finanzas es hoy.",
                  aida: "Ya viste a dónde va tu dinero. Ya sentiste las fugas. Ahora decide: seguir a ciegas — o desbloquear la claridad, el control y el crecimiento para los que Vault fue creado.",
                  choose: "Elige tu plan", monthly: "Mensual", yearly: "Anual",
                  monthlySub: "Facturación mensual", yearlySub: `Solo ${symbol}${(yearlyP/12).toFixed(2)}/mes · facturación anual`,
                  best: "MEJOR VALOR", save: `Ahorra ${savePct}%`,
                  cta: `Prueba por ${symbol}0,00 · 7 días gratis`,
                  hint: `Tarjeta requerida · Cancela cuando quieras · ${symbol}0,00 hoy, ${symbol}${(selectedPlan==="yearly"?yearlyP:monthlyP).toFixed(2)} el día 8`,
                  perMo: "/mes", perYr: "/año",
                },
              }[shortLang];
              return (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                      <Crown className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold leading-tight px-2">{paywallCopy.title}</h1>
                    <p className="text-muted-foreground text-sm px-4 leading-relaxed">{paywallCopy.aida}</p>
                  </div>

                  <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/[0.02] p-4 space-y-2.5">
                    {t.paywallBenefits.map((b) => (
                      <div key={b} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                        </div>
                        <p className="text-sm">{b}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">{paywallCopy.choose}</p>
                    {/* Monthly */}
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative w-full text-left rounded-2xl p-4 transition-all border-2 ${
                        selectedPlan === "monthly"
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
                          : "border-border bg-card/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{paywallCopy.monthly}</p>
                          <p className="text-xs text-muted-foreground">{paywallCopy.monthlySub}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{symbol}{monthlyP.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{paywallCopy.perMo}</p>
                        </div>
                      </div>
                    </button>
                    {/* Yearly — Best value */}
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`relative w-full text-left rounded-2xl p-4 transition-all border-2 ${
                        selectedPlan === "yearly"
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                          : "border-primary/40 bg-card/40"
                      }`}
                    >
                      <span className="absolute -top-2 right-3 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-[#16a34a] text-black shadow">
                        {paywallCopy.best}
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{paywallCopy.yearly}</p>
                          <p className="text-xs text-muted-foreground">{paywallCopy.yearlySub}</p>
                          <p className="text-xs text-primary font-semibold mt-0.5">{paywallCopy.save}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{symbol}{yearlyP.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{paywallCopy.perYr}</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* store the localized CTA strings on window for the footer to use */}
                  <input type="hidden" data-cta={paywallCopy.cta} data-hint={paywallCopy.hint} id="paywall-cta-copy" />
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-md mx-auto space-y-2">
          {current === "paywall" ? (() => {
            const sym = CURRENCIES.find((c) => c.id === (userCurrency as Currency))?.symbol ?? "$";
            const priceOnDay8 = selectedPlan === "yearly" ? "9.99" : "4.99";
            const ctaMap = {
              en: `Try for ${sym}0.00 · 7 days free`,
              pt: `Teste por ${sym}0,00 · 7 dias grátis`,
              es: `Prueba por ${sym}0,00 · 7 días gratis`,
            } as const;
            const hintMap = {
              en: `Card required · Cancel anytime · ${sym}0.00 today, ${sym}${priceOnDay8} on day 8`,
              pt: `Cartão obrigatório · Cancele quando quiser · ${sym}0,00 hoje, ${sym}${priceOnDay8.replace(".",",")} no 8º dia`,
              es: `Tarjeta requerida · Cancela cuando quieras · ${sym}0,00 hoy, ${sym}${priceOnDay8.replace(".",",")} el día 8`,
            } as const;
            return (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartTrial}
                  disabled={submitting || loadingCheckout}
                  className="w-full h-14 rounded-2xl font-bold text-base text-black bg-gradient-to-r from-primary to-[#16a34a] shadow-[0_10px_40px_-10px_rgba(34,197,94,0.7)] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><Crown className="w-5 h-5" /> {ctaMap[shortLang]}</>)}
                </motion.button>
                <p className="text-center text-[11px] text-muted-foreground/80">{hintMap[shortLang]}</p>
                <button onClick={handleRestore} className="w-full text-center text-xs text-muted-foreground underline underline-offset-2">
                  {t.paywallRestore}
                </button>
              </>
            );
          })() : current === "summary" ? (
            <Button onClick={next} className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-[#16a34a] text-black shadow-[0_10px_40px_-10px_rgba(34,197,94,0.6)]">
              {t.next} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={next} disabled={!canContinue()}
              className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-[#16a34a] text-black shadow-[0_10px_40px_-10px_rgba(34,197,94,0.6)] disabled:opacity-40 disabled:shadow-none">
              {current === "welcome" ? t.next : t.next} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StepShell = ({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <h2 className="text-2xl font-bold leading-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{sub}</p>
    </div>
    {children}
  </div>
);

const SelectBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
      active ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(34,197,94,0.25)]"
        : "border-border bg-card/40 hover:border-border/80"}`}>
    {children}
  </button>
);

const ChipBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-center min-h-[92px] ${
      active ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(34,197,94,0.25)]"
        : "border-border bg-card/40"}`}>
    {children}
  </button>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium truncate max-w-[60%] text-right">{value || "—"}</span>
  </div>
);

export default OnboardingPage;
