import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import CurrencyInput from "@/components/CurrencyInput";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: any) => void;
  cards: { id: string; name: string }[];
  defaultCardId?: string | null;
  editTransaction?: {
    id: string;
    type: "income" | "expense";
    amount: number;
    card_id: string;
    category_id: string | null;
    date: string;
    description: string | null;
  } | null;
  onEdit?: (id: string, transaction: any) => void;
}

const NewTransactionModal = ({ isOpen, onClose, onAdd, cards, defaultCardId, editTransaction, onEdit }: NewTransactionModalProps) => {
  const { incomeCategories, expenseCategories, addCategory, getDefaultCategory } = useCategories();
  const [type, setType] = useState<"income" | "expense">(editTransaction?.type || "expense");
  const [amount, setAmount] = useState(editTransaction?.amount || 0);
  const [selectedCard, setSelectedCard] = useState(editTransaction?.card_id || defaultCardId || "");
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">("existing");
  const [selectedCategory, setSelectedCategory] = useState(editTransaction?.category_id || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(editTransaction?.description || "");

  // Reset form when editTransaction changes or set default category
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount);
      setSelectedCard(editTransaction.card_id);
      setSelectedCategory(editTransaction.category_id || "");
      setDate(editTransaction.date);
      setDescription(editTransaction.description || "");
    } else {
      if (defaultCardId) {
        setSelectedCard(defaultCardId);
      }
      // Pre-select user's default category
      const defaultCat = getDefaultCategory(type);
      if (defaultCat && !selectedCategory) {
        setSelectedCategory(defaultCat.id);
      }
    }
  }, [editTransaction, defaultCardId, type, getDefaultCategory]);

  // Update default category when type changes
  useEffect(() => {
    if (!editTransaction && !selectedCategory) {
      const defaultCat = getDefaultCategory(type);
      if (defaultCat) {
        setSelectedCategory(defaultCat.id);
      }
    }
  }, [type, editTransaction, getDefaultCategory]);

  if (!isOpen) return null;

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const isEditing = !!editTransaction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let categoryId = selectedCategory;
    
    if (categoryMode === "new" && newCategoryName.trim()) {
      const newCat = await addCategory(newCategoryName.trim(), type);
      if (newCat) categoryId = newCat.id;
    }

    const transactionDate = {
      type,
      amount: amount, // Already a number from CurrencyInput
      categoryId: categoryId || null,
      description,
      date,
      cardId: selectedCard,
    };

    if (isEditing && onEdit) {
      onEdit(editTransaction.id, transactionDate);
    } else {
      onAdd(transactionDate);
    }

    resetForm();
  };

  const resetForm = () => {
    setAmount(0);
    setSelectedCard(defaultCardId || "");
    setSelectedCategory("");
    setNewCategoryName("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("expense");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg"><X size={24} className="text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setType("income")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${type === "income" ? "border-primary bg-primary/10" : "border-border"}`}>
              <TrendingUp className={type === "income" ? "text-primary" : "text-muted-foreground"} />
              <span className={type === "income" ? "text-primary font-medium" : "text-muted-foreground"}>Receita</span>
            </button>
            <button type="button" onClick={() => setType("expense")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${type === "expense" ? "border-destructive bg-destructive/10" : "border-border"}`}>
              <TrendingDown className={type === "expense" ? "text-destructive" : "text-muted-foreground"} />
              <span className={type === "expense" ? "text-destructive font-medium" : "text-muted-foreground"}>Despesa</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Valor *</label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cartão *</label>
            <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)} className="input-field" required>
              <option value="">Selecione um cartão</option>
              {cards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
            <div className="flex mb-3">
              <button type="button" onClick={() => setCategoryMode("existing")}
                className={`flex-1 py-2 text-sm font-medium rounded-l-lg ${categoryMode === "existing" ? "bg-muted text-foreground" : "bg-secondary text-muted-foreground"}`}>
                Existente
              </button>
              <button type="button" onClick={() => setCategoryMode("new")}
                className={`flex-1 py-2 text-sm font-medium rounded-r-lg ${categoryMode === "new" ? "bg-muted text-foreground" : "bg-secondary text-muted-foreground"}`}>
                Nova
              </button>
            </div>
            {categoryMode === "existing" ? (
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            ) : (
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nome da nova categoria" className="input-field" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Renda, mercearia..." className="input-field min-h-[80px] resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-full border border-border text-foreground font-medium">Cancelar</button>
            <button type="submit" className="flex-1 btn-primary">
              {isEditing ? "Guardar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransactionModal;