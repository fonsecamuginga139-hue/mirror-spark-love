import { useState, useMemo } from "react";
import { Plus, Calendar, Check, Trash2, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CardSelector from "@/components/CardSelector";
import { useFutureTransactions, FutureTransactionWithDetails } from "@/hooks/useFutureTransactions";
import { useCards } from "@/hooks/useCards";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useTransactions } from "@/hooks/useTransactions";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "sonner";

const FuturasPage = () => {
  const { 
    pendingTransactions, 
    paidTransactions, 
    loading,
    addFutureTransaction, 
    updateFutureTransaction,
    togglePaid, 
    deleteFutureTransaction,
  } = useFutureTransactions();
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
  const [dueDate, setDueDate] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Filter transactions by selected card
  const filteredPending = useMemo(() => {
    if (!selectedCardId) return pendingTransactions;
    return pendingTransactions.filter(t => t.card_id === selectedCardId);
  }, [pendingTransactions, selectedCardId]);

  const filteredPaid = useMemo(() => {
    if (!selectedCardId) return paidTransactions;
    return paidTransactions.filter(t => t.card_id === selectedCardId);
  }, [paidTransactions, selectedCardId]);

  // Calculate totals based on filtered transactions
  const totalPending = useMemo(() => 
    filteredPending.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0),
    [filteredPending]
  );

  const totalToReceive = useMemo(() => 
    filteredPending.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0),
    [filteredPending]
  );

  const resetForm = () => {
    setDescription("");
    setAmount(0);
    setDueDate("");
    setSelectedCard("");
    setSelectedCategory("");
    setType("expense");
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCard) {
      toast.error("Seleciona um cartão");
      return;
    }

    if (isEditing) {
      await updateFutureTransaction(isEditing, {
        type,
        description,
        amount: amount,
        due_date: dueDate,
        card_id: selectedCard,
        category_id: selectedCategory || null,
      });
      toast.success("Fatura atualizada!");
    } else {
      const result = await addFutureTransaction({
        type,
        description,
        amount: amount,
        due_date: dueDate,
        card_id: selectedCard,
        category_id: selectedCategory || null,
      });

      if (result) {
        toast.success(type === "income" ? "Receivable added!" : "Payable added!");
      }
    }
    
    resetForm();
  };

  const openEditForm = (transaction: FutureTransactionWithDetails) => {
    setIsEditing(transaction.id);
    setType(transaction.type);
    setDescription(transaction.description || "");
    setAmount(transaction.amount);
    setDueDate(transaction.due_date);
    setSelectedCard(transaction.card_id);
    setSelectedCategory(transaction.category_id || "");
    setIsAdding(true);
  };

  const handleTogglePaid = async (id: string) => {
    await togglePaid(id);
    toast.success("Estado atualizado");
  };

  const handleDelete = async (id: string) => {
    await deleteFutureTransaction(id);
    toast.success("Fatura removida");
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
  };

  const isToday = (date: string) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categories = type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Faturas Futuras</h1>
        <p className="text-muted-foreground mb-6">Planeia as tuas faturas e evita surpresas</p>

        {/* Card Selector */}
        <CardSelector
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          getCardBalance={getCardBalance}
          formatCurrency={formatCurrency}
        />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="finance-card bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <p className="text-muted-foreground text-sm mb-1">A Pagar</p>
            <p className="text-xl font-bold text-expense">{formatCurrency(totalPending)}</p>
          </div>
          <div className="finance-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <p className="text-muted-foreground text-sm mb-1">A Receber</p>
            <p className="text-xl font-bold text-income">{formatCurrency(totalToReceive)}</p>
          </div>
        </div>

        {/* Add Button or Form */}
        {isAdding ? (
          <div className="finance-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {isEditing ? "Editar Fatura" : "Nova Fatura Futura"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    type === "expense"
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-secondary"
                  }`}
                >
                  <TrendingDown className={type === "expense" ? "text-destructive" : "text-muted-foreground"} size={18} />
                  <span className={type === "expense" ? "text-destructive font-medium" : "text-muted-foreground"}>
                    To Pay
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    type === "income"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary"
                  }`}
                >
                  <TrendingUp className={type === "income" ? "text-primary" : "text-muted-foreground"} size={18} />
                  <span className={type === "income" ? "text-primary font-medium" : "text-muted-foreground"}>
                    To Receive
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Renda, Internet..."
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount
                </label>
                <CurrencyInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Card
                </label>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Selecionar um cartão</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecionar uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-full border border-border text-foreground font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {isEditing ? "Guardar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
            disabled={cards.length === 0}
          >
            <Plus size={20} />
            New Upcoming Bill
          </button>
        )}

        {cards.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground text-sm mb-6">
            Create a card first to add upcoming bills
          </p>
        )}

        {/* Pending Transactions */}
        {filteredPending.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Pendentes</h3>
            <div className="space-y-3">
              {filteredPending.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`finance-card flex items-center justify-between group ${
                    isOverdue(transaction.due_date) ? "border-destructive/50" : 
                    isToday(transaction.due_date) ? "border-primary/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePaid(transaction.id)}
                      className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Check size={14} className="text-primary opacity-0 hover:opacity-100" />
                    </button>
                    <div>
                      <p className="text-foreground font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.due_date).toLocaleDateString("pt-PT")}
                        {transaction.card_name && ` • ${transaction.card_name}`}
                        {isToday(transaction.due_date) && (
                          <span className="text-primary ml-2">Hoje</span>
                        )}
                        {isOverdue(transaction.due_date) && (
                          <span className="text-destructive ml-2">Atrasada</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${
                      transaction.type === "income" ? "text-income" : "text-expense"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                    <button
                      onClick={() => openEditForm(transaction)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                    >
                      <Pencil size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid Transactions */}
        {filteredPaid.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-3">Paid / Received</h3>
            <div className="space-y-3">
              {filteredPaid.map((transaction) => (
                <div key={transaction.id} className="finance-card flex items-center justify-between opacity-60 group">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePaid(transaction.id)}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </button>
                    <div>
                      <p className="text-foreground font-medium line-through">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.due_date).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground font-semibold">
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredPending.length === 0 && filteredPaid.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {selectedCardId ? "Sem faturas para este cartão" : "Sem faturas futuras"}
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Add your upcoming bills so you never miss a due date
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FuturasPage;
