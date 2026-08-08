import { Wallet, ArrowDownCircle, Sparkles } from "lucide-react";
import { useMonthlyBills } from "@/hooks/useMonthlyBills";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/context/AuthContext";

const MonthlyPlanCard = () => {
  const { profile } = useAuth();
  const { totalActiveAmount, activeBills, loading } = useMonthlyBills();
  const { formatCurrency } = useCurrency();

  const monthlyIncome = Number((profile as any)?.monthly_income || 0);
  const available = monthlyIncome - totalActiveAmount;

  if (loading && !activeBills.length && !monthlyIncome) return null;
  if (!monthlyIncome && activeBills.length === 0) return null;

  return (
    <div className="finance-card mb-4 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Monthly Plan
        </h3>
        <span className="text-xs text-muted-foreground">
          {activeBills.length} bill{activeBills.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl bg-income/10 border border-income/20 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet size={14} className="text-income" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="text-base font-bold text-income">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="rounded-xl bg-expense/10 border border-expense/20 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownCircle size={14} className="text-expense" />
            <span className="text-xs text-muted-foreground">Fixed Bills</span>
          </div>
          <p className="text-base font-bold text-expense">{formatCurrency(totalActiveAmount)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Available Monthly Balance</span>
        <span className={`text-lg font-bold ${available >= 0 ? "text-primary" : "text-destructive"}`}>
          {formatCurrency(available)}
        </span>
      </div>
    </div>
  );
};

export default MonthlyPlanCard;