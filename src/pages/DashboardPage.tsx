import { useState, useEffect, useMemo } from "react";
import { Settings2, ChevronsUpDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import FlowChart from "@/components/FlowChart";
import VoiceTransactionModal from "@/components/VoiceTransactionModal";
import RecurringCharts from "@/components/RecurringCharts";
import OfflineIndicator from "@/components/OfflineIndicator";
import InstallPrompt from "@/components/InstallPrompt";
import RecurringReminders from "@/components/RecurringReminders";
import TrialBanner from "@/components/TrialBanner";
import SEO from "@/components/SEO";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useCountUp } from "@/hooks/useCountUp";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";

type Period = "month" | "all";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { transactions, loading } = useTransactions();
  const { formatCurrency } = useCurrency();
  const { processRecurringTransactions, recurringTransactions } = useRecurringTransactions();

  const [period, setPeriod] = useState<Period>("month");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const installed = localStorage.getItem("pwa-installed");
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const shouldPrompt = sessionStorage.getItem("show-install-prompt");
    if (shouldPrompt && !installed && !dismissed) {
      sessionStorage.removeItem("show-install-prompt");
      const timer = setTimeout(() => setShowInstallPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const openVoice = () => setIsVoiceOpen(true);
    window.addEventListener("vault:voice-transaction", openVoice);
    return () => window.removeEventListener("vault:voice-transaction", openVoice);
  }, []);

  const periodTransactions = useMemo(() => {
    if (period === "all") return transactions;
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return transactions.filter((t) => {
      const d = new Date(t.occurred_on);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [transactions, period]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [periodTransactions]);

  const animatedBalance = useCountUp(balance);
  const animatedIncome = useCountUp(totalIncome);
  const animatedExpense = useCountUp(totalExpense);

  useEffect(() => {
    processRecurringTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const balanceColor = balance >= 0 ? "text-income" : "text-expense";
  const balanceSign = balance >= 0 ? "+" : "−";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <TrialBanner />

      <div className="relative p-4 max-w-lg mx-auto">
        <SEO
          title="Painel — Vault"
          description="O seu painel financeiro: saldo em tempo real, receitas, despesas e análises do mês."
          path="/dashboard"
          noindex
        />
        <h1 className="sr-only">Painel Financeiro</h1>

        <div className="flex items-center justify-end mb-6 animate-fade-in">
          <button
            onClick={() => navigate("/settings")}
            aria-label={t("dashboard.settings")}
            className="w-11 h-11 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition"
          >
            <Settings2 size={20} />
          </button>
        </div>

        <div className="mb-5 animate-fade-in-up glow-ring rounded-[28px] p-5">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mb-2">{t("dashboard.total")}</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full glow-ring flex items-center justify-center text-primary shrink-0">
              <span className="text-xl leading-none font-light">{balanceSign}</span>
            </div>
            <span
              className={`text-5xl sm:text-6xl font-bold font-display tabular-nums truncate ${balanceColor}`}
            >
              {formatCurrency(Math.abs(animatedBalance))}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 mt-4 p-1 rounded-full glow-ring">
            <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-semibold tabular-nums">
              − {formatCurrency(animatedExpense)}
            </span>
            <span className="px-3 py-1 text-primary text-sm font-semibold tabular-nums">
              + {formatCurrency(animatedIncome)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
          <label className="relative inline-flex items-center gap-1 px-3 py-2 rounded-full glow-ring">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="appearance-none bg-transparent pr-4 outline-none text-foreground font-medium cursor-pointer"
            >
              <option value="month">{t("dashboard.thisMonth")}</option>
              <option value="all">{t("dashboard.allTime")}</option>
            </select>
            <ChevronsUpDown size={12} className="absolute right-2 pointer-events-none text-primary/70" />
          </label>
        </div>

        <FlowChart transactions={periodTransactions} />

        <div className="mb-4">
          <CategoryDonutChart
            transactions={periodTransactions}
            onSelect={(categoryName) =>
              navigate(`/categoria/${encodeURIComponent(categoryName)}`)
            }
          />
        </div>

        <RecurringCharts recurringTransactions={recurringTransactions} variant="dashboard" />
      </div>

      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <InstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />

      <OfflineIndicator />
      <RecurringReminders recurringTransactions={recurringTransactions} />
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
