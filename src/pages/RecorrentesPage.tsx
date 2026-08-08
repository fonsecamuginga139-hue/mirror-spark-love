import { useState, useMemo } from "react";
import { Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, TrendingUp, TrendingDown, Pencil, CheckCircle, Clock, Zap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CardSelector from "@/components/CardSelector";
import MonthlyBillsSection from "@/components/MonthlyBillsSection";
import { useRecurringTransactions, RecurringTransactionWithDetails } from "@/hooks/useRecurringTransactions";
import { useCards } from "@/hooks/useCards";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const RecurringPage = () => {
  const { 
    activeRecurring, 
    inactiveRecurring, 
    loading, 
    addRecurringTransaction, 
    updateRecurringTransaction,
    toggleActive, 
    deleteRecurringTransaction,
    processManualRecurring,
    getPendingManualRecurring
  } = useRecurringTransactions();
  const { cards } = useCards();
  const { expenseCategories, incomeCategories } = useCategories();
  const { formatCurrency } = useCurrency();
  const { getCardBalance } = useTransactions();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [autoProcess, setAutoProcess] = useState(true);

  // Filter by selected card
  const filteredActive = useMemo(() => {
    if (!selectedCardId) return activeRecurring;
    return activeRecurring.filter(r => r.card_id === selectedCardId);
  }, [activeRecurring, selectedCardId]);

  const filteredInactive = useMemo(() => {
    if (!selectedCardId) return inactiveRecurring;
    return inactiveRecurring.filter(r => r.card_id === selectedCardId);
  }, [inactiveRecurring, selectedCardId]);

  const pendingManual = useMemo(() => getPendingManualRecurring(), [activeRecurring]);

  const resetForm = () => {
    setDescription("");
    setAmount(0);
    setDayOfMonth("");
    setSelectedCard("");
    setSelectedCategory("");
    setType("expense");
    setAutoProcess(true);
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await updateRecurringTransaction(isEditing, {
        type,
        description,
        amount: amount,
        day_of_month: parseInt(dayOfMonth),
        card_id: selectedCard,
        category_id: selectedCategory || null,
        auto_process: autoProcess,
      });
      toast.success("Recurring updated!");
    } else {
      const result = await addRecurringTransaction({
        type,
        description,
        amount: amount,
        day_of_month: parseInt(dayOfMonth),
        card_id: selectedCard,
        category_id: selectedCategory || null,
        auto_process: autoProcess,
      });

      if (result) {
        toast.success("Recurring transaction created!");
      }
    }
    
    resetForm();
  };

  const openEditForm = (recurring: RecurringTransactionWithDetails) => {
    setIsEditing(recurring.id);
    setType(recurring.type);
    setDescription(recurring.description || "");
    setAmount(recurring.amount);
    setDayOfMonth(String(recurring.day_of_month));
    setSelectedCard(recurring.card_id);
    setSelectedCategory(recurring.category_id || "");
    setAutoProcess(recurring.auto_process);
    setIsAdding(true);
  };

  const handleConfirmManual = async (id: string) => {
    const success = await processManualRecurring(id);
    if (success) {
      toast.success("Transaction confirmed and posted!");
    } else {
      toast.error("Error confirming transaction");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRecurringTransaction(id);
    toast.success("Recurring removed");
  };

  const categories = type === "income" ? incomeCategories : expenseCategories;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Monthly Bills</h1>
        <p className="text-muted-foreground mb-6">Manage your recurring monthly expenses and automated transactions</p>

        {/* Monthly Fixed Expenses (new) */}
        <MonthlyBillsSection />

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Automated Transactions</h2>
          <p className="text-sm text-muted-foreground">Recurring income and expenses posted to your cards</p>
        </div>

        {/* Card Selector */}
        <CardSelector
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          getCardBalance={getCardBalance}
          formatCurrency={formatCurrency}
        />

        {isAdding ? (
          <div className="finance-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {isEditing ? "Edit Recurring" : "New Recurring"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setType("expense")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 ${type === "expense" ? "border-destructive bg-destructive/10" : "border-border"}`}>
                  <TrendingDown className={type === "expense" ? "text-destructive" : "text-muted-foreground"} size={18} />
                  <span className={type === "expense" ? "text-destructive" : "text-muted-foreground"}>Expense</span>
                </button>
                <button type="button" onClick={() => setType("income")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 ${type === "income" ? "border-primary bg-primary/10" : "border-border"}`}>
                  <TrendingUp className={type === "income" ? "text-primary" : "text-muted-foreground"} size={18} />
                  <span className={type === "income" ? "text-primary" : "text-muted-foreground"}>Income</span>
                </button>
              </div>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="input-field" required />
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                placeholder="0,00"
                required
              />
              <input type="number" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} placeholder="Day of month (1-31)" className="input-field" min="1" max="31" required />
              <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)} className="input-field" required>
                <option value="">Select a card</option>
                {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
                <option value="">Category (optional)</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              {/* Auto Process Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  {autoProcess ? (
                    <Zap size={18} className="text-primary" />
                  ) : (
                    <Clock size={18} className="text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="auto-process" className="text-sm font-medium cursor-pointer">
                      {autoProcess ? "Automatic" : "Manual"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {autoProcess ? "Posted automatically on day" : "Requires manual confirmation"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="auto-process"
                  checked={autoProcess}
                  onCheckedChange={setAutoProcess}
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-full border border-border">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{isEditing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="btn-primary w-full flex items-center justify-center gap-2 mb-6" disabled={cards.length === 0}>
            <Plus size={20} /> New Recurring
          </button>
        )}

        {cards.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground text-sm mb-6">
            Create a card first to add recurring transactions
          </p>
        )}

        {/* Pending Manual Confirmations */}
        {pendingManual.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock size={18} className="text-warning" />
              Pending Confirmation
            </h3>
            <div className="space-y-3">
              {pendingManual.map((r) => (
                <div key={r.id} className="finance-card border-2 border-warning/50 bg-warning/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">{r.description}</p>
                      <p className="text-sm text-muted-foreground">Day {r.day_of_month} • {r.card_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={r.type === "income" ? "text-income font-semibold" : "text-expense font-semibold"}>
                        {r.type === "income" ? "+" : "-"}{formatCurrency(Number(r.amount))}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConfirmManual(r.id)}
                    className="mt-3 w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Confirm and Post
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredActive.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Active</h3>
            <div className="space-y-3">
              {filteredActive.map((r) => (
                <div key={r.id} className="finance-card flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium truncate">{r.description}</p>
                      {r.auto_process ? (
                        <span title="Automatic"><Zap size={14} className="text-primary flex-shrink-0" /></span>
                      ) : (
                        <span title="Manual"><Clock size={14} className="text-muted-foreground flex-shrink-0" /></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Day {r.day_of_month} • {r.card_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={r.type === "income" ? "text-income font-semibold" : "text-expense font-semibold"}>
                      {r.type === "income" ? "+" : "-"}{formatCurrency(Number(r.amount))}
                    </p>
                    <button onClick={() => openEditForm(r)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all">
                      <Pencil size={16} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => toggleActive(r.id)} className="p-1">
                      <ToggleRight size={20} className="text-primary" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded transition-all">
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredInactive.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-3">Inactive</h3>
            <div className="space-y-3">
              {filteredInactive.map((r) => (
                <div key={r.id} className="finance-card flex items-center justify-between opacity-60 group">
                  <div>
                    <p className="text-foreground font-medium">{r.description}</p>
                    <p className="text-sm text-muted-foreground">Day {r.day_of_month}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground font-semibold">{formatCurrency(Number(r.amount))}</p>
                    <button onClick={() => toggleActive(r.id)} className="p-1">
                      <ToggleLeft size={20} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded transition-all">
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredActive.length === 0 && filteredInactive.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw size={40} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {selectedCardId ? "No recurring for this card" : "No recurring transactions"}
            </h3>
            <p className="text-muted-foreground text-center">Create transactions that repeat every month</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default RecurringPage;
