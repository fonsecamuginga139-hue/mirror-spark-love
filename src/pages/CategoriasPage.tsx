import { useState } from "react";
import { Plus, Tag, Trash2, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useCategories, Category } from "@/hooks/useCategories";
import { getCategoryIcon, suggestIconForCategory } from "@/lib/categoryIcons";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

const colorOptions = [
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899", 
  "#f97316", "#eab308", "#14b8a6", "#ef4444",
];

const CategoriesPage = () => {
  const { categories, incomeCategories, expenseCategories, addCategory, deleteCategory, setAsDefault, loading } = useCategories();
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense");
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const suggestedIcon = suggestIconForCategory(newCategoryName);
    const result = await addCategory(newCategoryName, newCategoryType, newCategoryColor, suggestedIcon);
    
    if (result) {
      toast.success("Categoria criada!");
      setNewCategoryName("");
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      const success = await deleteCategory(deleteConfirm.id);
      if (success) {
        toast.success("Categoria removida");
      }
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleSetDefault = async (category: Category) => {
    if (!category.type) return;
    const success = await setAsDefault(category.id, category.type);
    if (success) {
      toast.success(`${category.name} set as default!`);
    }
  };

  const renderCategoryCard = (category: Category) => {
    const IconComponent = getCategoryIcon(category.icon || "tag");
    const canDelete = !category.is_default;
    const isUserDefault = category.is_user_default;
    
    return (
      <div
        key={category.id}
        className="glass-card flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent size={20} style={{ color: category.color || "#10B981" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{category.name}</p>
              {isUserDefault && (
                <Star size={14} className="text-amber-500 fill-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {category.is_default ? "Padrão do sistema" : isUserDefault ? "A tua categoria padrão" : "Personalizada"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {category.type && !isUserDefault && (
            <button
              onClick={() => handleSetDefault(category)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-amber-500/20 rounded-lg transition-all"
              title="Definir como padrão"
            >
              <Star size={16} className="text-amber-500" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteClick(category.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/20 rounded-lg transition-all"
            >
              <Trash2 size={16} className="text-destructive" />
            </button>
          )}
        </div>
      </div>
    );
  };

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Tag className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground text-sm">Organiza as tuas transações</p>
          </div>
        </div>

        {/* Create New Category */}
        {isCreating ? (
          <form onSubmit={handleCreateCategory} className="finance-card mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Nova Categoria</h3>
            
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewCategoryType("expense")}
                className={`p-3 rounded-xl border-2 transition-all ${
                  newCategoryType === "expense"
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-secondary"
                }`}
              >
                <span className={newCategoryType === "expense" ? "text-destructive font-medium" : "text-muted-foreground"}>
                  Expense
                </span>
              </button>
              <button
                type="button"
                onClick={() => setNewCategoryType("income")}
                className={`p-3 rounded-xl border-2 transition-all ${
                  newCategoryType === "income"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary"
                }`}
              >
                <span className={newCategoryType === "income" ? "text-primary font-medium" : "text-muted-foreground"}>
                  Income
                </span>
              </button>
            </div>

            {/* Name Input */}
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria..."
              className="input-field"
              autoFocus
              required
            />

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      newCategoryColor === color ? "ring-2 ring-offset-2 ring-offset-card ring-white" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 rounded-full border border-border text-foreground font-medium"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 btn-primary">
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={20} />
            New Category
          </button>
        )}

        {/* Tip */}
        <div className="glass-card mb-6 flex items-start gap-3">
          <Star size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Hover over a category and click the star to set it as default. The default category is pre-selected when creating new transactions.
          </p>
        </div>

        {/* Expense Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-expense" />
            Expenses ({expenseCategories.length})
          </h3>
          <div className="space-y-2">
            {expenseCategories.map(renderCategoryCard)}
          </div>
        </div>

        {/* Income Categories */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-income" />
            Income ({incomeCategories.length})
          </h3>
          <div className="space-y-2">
            {incomeCategories.map(renderCategoryCard)}
          </div>
        </div>
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

export default CategoriesPage;
