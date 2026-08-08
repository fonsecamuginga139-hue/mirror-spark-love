import { useState, useMemo } from "react";
import { History, Filter, Calendar, Tag, Search, Trash2, X, ChevronDown, RefreshCw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import CardSelector from "@/components/CardSelector";
import { useTransactions, TransactionWithDetails } from "@/hooks/useTransactions";
import { useCards } from "@/hooks/useCards";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface Filters {
  search: string;
  categoryId: string | null;
  type: "all" | "income" | "expense";
  startDate: string;
  endDate: string;
  onlyRecurring: boolean;
}

const HistoricoPage = () => {
  const { transactions, loading, deleteTransaction, getCardBalance } = useTransactions();
  const { cards } = useCards();
  const { categories } = useCategories();
  const { formatCurrency } = useCurrency();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    categoryId: null,
    type: "all",
    startDate: "",
    endDate: "",
    onlyRecurring: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  // Filter by selected card first
  const cardFilteredTransactions = useMemo(() => {
    if (!selectedCardId) return transactions;
    return transactions.filter(t => t.card_id === selectedCardId);
  }, [transactions, selectedCardId]);

  const filteredTransactions = useMemo(() => {
    return cardFilteredTransactions.filter((t) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDesc = t.description?.toLowerCase().includes(searchLower);
        const matchesCategory = t.category_name?.toLowerCase().includes(searchLower);
        const matchesCard = t.card_name?.toLowerCase().includes(searchLower);
        if (!matchesDesc && !matchesCategory && !matchesCard) return false;
      }

      // Category filter
      if (filters.categoryId && t.category_id !== filters.categoryId) return false;

      // Type filter
      if (filters.type !== "all" && t.type !== filters.type) return false;

      // Recurring filter
      if (filters.onlyRecurring && !t.is_auto_generated) return false;

      // Date range filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const transactionDate = new Date(t.date);
        if (transactionDate < startDate) return false;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        const transactionDate = new Date(t.date);
        if (transactionDate > endDate) return false;
      }

      return true;
    });
  }, [cardFilteredTransactions, filters]);

  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: TransactionWithDetails[] } = {};
    
    filteredTransactions.forEach((t) => {
      const dateKey = new Date(t.date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    return groups;
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTransaction(deleteConfirm.id);
      toast.success("Transaction removed");
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: null,
      type: "all",
      startDate: "",
      endDate: "",
      onlyRecurring: false,
    });
  };

  const hasActiveFilters = filters.search || filters.categoryId || filters.type !== "all" || filters.startDate || filters.endDate || filters.onlyRecurring;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCardName = selectedCardId 
    ? cards.find(c => c.id === selectedCardId)?.name 
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-background p-4 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <History className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">History</h1>
              <p className="text-muted-foreground text-sm">
                {selectedCardName ? `Transações: ${selectedCardName}` : "All your transactions"}
              </p>
            </div>
          </div>

          {/* Card Selector */}
          <CardSelector
            cards={cards}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            getCardBalance={getCardBalance}
            formatCurrency={formatCurrency}
          />

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search transactions..."
              className="input-field pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            )}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Todos" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expenses" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ ...filters, type: option.value as any })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.type === option.value
                        ? option.value === "income"
                          ? "bg-income text-white"
                          : option.value === "expense"
                          ? "bg-expense text-white"
                          : "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  onClick={() => setFilters({ ...filters, onlyRecurring: !filters.onlyRecurring })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    filters.onlyRecurring
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <RefreshCw size={14} />
                  Recurring
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Tag size={14} /> Category
              </label>
              <select
                value={filters.categoryId || ""}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value || null })}
                className="input-field"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Income</p>
            <p className="text-sm font-bold text-income">{formatCurrency(totals.income)}</p>
          </div>
          <div className="glass-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Expenses</p>
            <p className="text-sm font-bold text-expense">{formatCurrency(totals.expense)}</p>
          </div>
          <div className="glass-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className={`text-sm font-bold ${totals.balance >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(totals.balance)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filteredTransactions.length} transação(ões) encontrada(s)
        </p>

        {/* Transactions List */}
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <History size={48} className="mb-4 opacity-50" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm text-center mt-2">Adjust filters or add new transactions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, txs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2">
                  {date}
                </h3>
                <div className="space-y-2">
                  {txs.map((t) => (
                    <div
                      key={t.id}
                      className="glass-card flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {t.description || t.category_name || "No description"}
                          </p>
                          {t.is_auto_generated && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary flex-shrink-0">
                              <RefreshCw size={10} className="inline mr-1" />
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t.card_name}
                          {t.category_name && ` • ${t.category_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold font-display ${
                            t.type === "income" ? "text-income" : "text-expense"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(t.amount))}
                        </p>
                        <button
                          onClick={() => handleDeleteClick(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
      />

      <BottomNav />
    </div>
  );
};

export default HistoricoPage;
