import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Loader2, Target, Tag, AlertTriangle, ArrowLeftRight, FileText } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BudgetGoalModal from "@/components/BudgetGoalModal";
import NewCategoryModal from "@/components/NewCategoryModal";
import MonthlySummary from "@/components/MonthlySummary";
import CardSelector from "@/components/CardSelector";
import RecurringCharts from "@/components/RecurringCharts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCards } from "@/hooks/useCards";
import { useCategories } from "@/hooks/useCategories";
import { useBudgetGoals } from "@/hooks/useBudgetGoals";
import { useCurrency } from "@/hooks/useCurrency";
import { useReportPDF } from "@/hooks/useReportPDF";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useToast } from "@/hooks/use-toast";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "#EF4444",
  "Transporte": "#F97316",
  "Moradia": "#8B5CF6",
  "Lazer": "#EC4899",
  "Subscriptions": "#6366F1",
  "Saúde": "#14B8A6",
  "Educação": "#3B82F6",
  "Salário": "#10B981",
  "Freelance": "#22C55E",
  "Investimentos": "#84CC16",
  "Outros": "#6B7280",
};

type PeriodFilter = "today" | "month" | "year" | "custom" | "all";

const RelatoriosPage = () => {
  const { transactions, loading, getCardBalance } = useTransactions();
  const { cards } = useCards();
  const { categories } = useCategories();
  const { budgetGoals } = useBudgetGoals();
  const { formatCurrency } = useCurrency();
  const { generatePDF } = useReportPDF();
  const { recurringTransactions } = useRecurringTransactions();
  const { toast } = useToast();
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);

  // Filter transactions by selected card
  const cardFilteredTransactions = useMemo(() => {
    if (!selectedCardId) return transactions;
    return transactions.filter(t => t.card_id === selectedCardId);
  }, [transactions, selectedCardId]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return cardFilteredTransactions.filter((t) => {
      const date = new Date(t.date);
      
      switch (period) {
        case "today":
          return date.toDateString() === today.toDateString();
        case "month":
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case "year":
          return date.getFullYear() === now.getFullYear();
        case "custom":
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return date >= start && date <= end;
        case "all":
        default:
          return true;
      }
    });
  }, [cardFilteredTransactions, period, customStartDate, customEndDate]);

  const filteredTotalIncome = useMemo(() => 
    filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0),
    [filteredTransactions]
  );

  const filteredTotalExpense = useMemo(() => 
    filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0),
    [filteredTransactions]
  );

  // Category breakdown for expenses
  const expensesByCategory = useMemo(() => {
    const grouped = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc: Record<string, { name: string; value: number; color: string; categoryId: string }>, t) => {
        const categoryName = t.category_name || "Outros";
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            value: 0,
            color: t.category_color || CATEGORY_COLORS[categoryName] || "#6B7280",
            categoryId: t.category_id || "",
          };
        }
        acc[categoryName].value += Number(t.amount);
        return acc;
      }, {});
    
    return Object.values(grouped);
  }, [filteredTransactions]);

  // Budget alerts - check which categories exceeded 80% of budget
  const budgetAlerts = useMemo(() => {
    return expensesByCategory
      .map((expense) => {
        const goal = budgetGoals.find(bg => bg.category_id === expense.categoryId);
        if (!goal) return null;
        
        const percentage = (expense.value / Number(goal.monthly_limit)) * 100;
        if (percentage >= 80) {
          return {
            categoryName: expense.name,
            spent: expense.value,
            limit: Number(goal.monthly_limit),
            percentage,
            exceeded: percentage >= 100,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [expensesByCategory, budgetGoals]);

  // Monthly data for bar chart
  const monthlyDate = useMemo(() => {
    const grouped = filteredTransactions.reduce((acc: Record<string, { income: number; expense: number }>, t) => {
      const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        acc[month].income += Number(t.amount);
      } else {
        acc[month].expense += Number(t.amount);
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      Income: data.income,
      Expenses: data.expense,
    }));
  }, [filteredTransactions]);

  // Line chart data - evolution over time
  const lineChartDate = useMemo(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    const grouped: Record<string, { income: number; expense: number }> = {};

    sorted.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      if (!grouped[date]) {
        grouped[date] = { income: cumulativeIncome, expense: cumulativeExpense };
      }
      if (t.type === "income") {
        cumulativeIncome += Number(t.amount);
      } else {
        cumulativeExpense += Number(t.amount);
      }
      grouped[date] = { income: cumulativeIncome, expense: cumulativeExpense };
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      Income: data.income,
      Expenses: data.expense,
    }));
  }, [filteredTransactions]);

  // Stacked area chart data - expense composition over time
  const stackedAreaDate = useMemo(() => {
    const categoryNames = [...new Set(filteredTransactions
      .filter(t => t.type === "expense")
      .map(t => t.category_name || "Outros"))];

    const dateGroups: Record<string, Record<string, number>> = {};

    filteredTransactions
      .filter(t => t.type === "expense")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        const date = new Date(t.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
        const categoryName = t.category_name || "Outros";
        
        if (!dateGroups[date]) {
          dateGroups[date] = {};
          categoryNames.forEach(cat => dateGroups[date][cat] = 0);
        }
        dateGroups[date][categoryName] += Number(t.amount);
      });

    return Object.entries(dateGroups).map(([date, categories]) => ({
      date,
      ...categories,
    }));
  }, [filteredTransactions]);

  // Month comparison data
  const comparisonDate = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      months.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        monthNum: monthDate.getMonth(),
        yearNum: monthDate.getFullYear(),
      });
    }

    return months.map(({ month, monthNum, yearNum }) => {
      const monthTransactions = cardFilteredTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === monthNum && date.getFullYear() === yearNum;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const expense = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

      return {
        month,
        Income: income,
        Expenses: expense,
        Balance: income - expense,
      };
    });
  }, [cardFilteredTransactions]);

  // Get unique category colors for stacked area
  const categoryColorsForArea = useMemo(() => {
    const colors: Record<string, string> = {};
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const name = t.category_name || "Outros";
        if (!colors[name]) {
          colors[name] = t.category_color || CATEGORY_COLORS[name] || "#6B7280";
        }
      });
    return colors;
  }, [filteredTransactions]);

  const periodLabels: Record<PeriodFilter, string> = {
    today: "Today",
    month: "This month",
    year: "This year",
    custom: "Custom",
    all: "All time",
  };

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriod(newPeriod);
    if (newPeriod === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generatePDF({
        period: periodLabels[period],
        totalIncome: filteredTotalIncome,
        totalExpense: filteredTotalExpense,
        balance: filteredTotalIncome - filteredTotalExpense,
        expensesByCategory,
        monthlyDate,
      });
      toast({
        title: "PDF exportado!",
        description: "O relatório foi salvo no seu dispositivo.",
      });
    } catch (error) {
      toast({
        title: "Error ao exportar",
        description: "No foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCardName = selectedCardId 
    ? cards.find(c => c.id === selectedCardId)?.name 
    : "All Cards";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
              </button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          {selectedCardId ? `Analysis: ${selectedCardName}` : "Detailed analysis of your finances"}
        </p>

        {/* Card Selector */}
        <CardSelector
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          getCardBalance={getCardBalance}
          formatCurrency={formatCurrency}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setShowMonthlySummary(!showMonthlySummary)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              showMonthlySummary ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            <FileText size={16} />
            Summary
          </button>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
          >
            <Target size={16} />
            Goals
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
          >
            <Tag size={16} />
            Categories
          </button>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              showComparison ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            <ArrowLeftRight size={16} />
            Compare
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(Object.keys(periodLabels) as PeriodFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => handlePeriodChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                period === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {periodLabels[key]}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {showCustom && (
          <div className="finance-card mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-primary" />
              <span className="text-foreground font-medium">Custom Period</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {budgetAlerts.map((alert: any) => (
              <div
                key={alert.categoryName}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  alert.exceeded ? "bg-destructive/20" : "bg-amber-500/20"
                }`}
              >
                <AlertTriangle
                  size={20}
                  className={alert.exceeded ? "text-destructive" : "text-amber-500"}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${alert.exceeded ? "text-destructive" : "text-amber-500"}`}>
                    {alert.categoryName}: {alert.percentage.toFixed(0)}% of budget
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(alert.spent)} de {formatCurrency(alert.limit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cardFilteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Not enough data</h3>
            <p className="text-muted-foreground text-center max-w-xs">
              {selectedCardId ? "Add transactions to this card" : "Add transactions to see your reports"}
            </p>
          </div>
        ) : (
          <>
            {/* Monthly Summary Mode */}
            {showMonthlySummary && (
              <div className="finance-card mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">📊 Monthly Summary</h3>
                <MonthlySummary transactions={cardFilteredTransactions} />
              </div>
            )}

            {/* Month Comparison Mode */}
            {showComparison && (
              <div className="finance-card mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Last 6 Months Comparison</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonDate}>
                      <XAxis dataKey="month" stroke="#737373" fontSize={10} />
                      <YAxis stroke="#737373" fontSize={10} tickFormatter={(value) => formatCurrency(value).replace(/[^\d,.]/g, '')} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 8%)",
                          border: "1px solid hsl(0 0% 18%)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recurring Transactions Chart */}
            <RecurringCharts recurringTransactions={recurringTransactions} variant="reports" />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="finance-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-income" size={18} />
                  <span className="text-sm text-muted-foreground">Total Income</span>
                </div>
                <p className="text-xl font-bold text-income">{formatCurrency(filteredTotalIncome)}</p>
              </div>
              <div className="finance-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-expense" size={18} />
                  <span className="text-sm text-muted-foreground">Total Expenses</span>
                </div>
                <p className="text-xl font-bold text-expense">{formatCurrency(filteredTotalExpense)}</p>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="finance-card mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Period Balance</span>
                <span className={`text-2xl font-bold ${filteredTotalIncome - filteredTotalExpense >= 0 ? "text-income" : "text-expense"}`}>
                  {formatCurrency(filteredTotalIncome - filteredTotalExpense)}
                </span>
              </div>
            </div>

            {/* Pie Chart - Expenses by Category */}
            {expensesByCategory.length > 0 && (
              <div className="finance-card mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🍕 Expenses by Category</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'hsl(0 0% 70%)', strokeWidth: 1 }}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 8%)",
                          border: "1px solid hsl(0 0% 18%)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                        itemStyle={{ color: "white" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {expensesByCategory.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name}: {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stacked Area Chart - Expense Composition Over Time */}
            {stackedAreaDate.length > 1 && Object.keys(categoryColorsForArea).length > 0 && (
              <div className="finance-card mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Expense Composition</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stackedAreaDate}>
                      <XAxis dataKey="date" stroke="#737373" fontSize={10} />
                      <YAxis stroke="#737373" fontSize={10} tickFormatter={(value) => formatCurrency(value).replace(/[^\d,.]/g, '')} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 8%)",
                          border: "1px solid hsl(0 0% 18%)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      {Object.entries(categoryColorsForArea).map(([name, color]) => (
                        <Area
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stackId="1"
                          stroke={color}
                          fill={color}
                          fillOpacity={0.6}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Line Chart - Evolution */}
            {lineChartDate.length > 1 && (
              <div className="finance-card mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses Trend</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartDate}>
                      <XAxis dataKey="date" stroke="#737373" fontSize={10} />
                      <YAxis stroke="#737373" fontSize={10} tickFormatter={(value) => formatCurrency(value).replace(/[^\d,.]/g, '')} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 8%)",
                          border: "1px solid hsl(0 0% 18%)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Income" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Expenses" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Bar Chart - Monthly Comparison */}
            {monthlyDate.length > 0 && (
              <div className="finance-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Comparison</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyDate}>
                      <XAxis dataKey="month" stroke="#737373" fontSize={10} />
                      <YAxis stroke="#737373" fontSize={10} tickFormatter={(value) => formatCurrency(value).replace(/[^\d,.]/g, '')} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 8%)",
                          border: "1px solid hsl(0 0% 18%)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {filteredTransactions.length === 0 && (
              <div className="finance-card text-center py-8">
                <p className="text-muted-foreground">No transactions found para este período</p>
              </div>
            )}
          </>
        )}
      </div>

      <BudgetGoalModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
      />

      <NewCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      <BottomNav />
    </div>
  );
};

export default RelatoriosPage;
