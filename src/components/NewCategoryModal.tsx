import { useState } from "react";
import { X, Tag, Palette, Trash2 } from "lucide-react";
import { useCategories, Category } from "@/hooks/useCategories";
import { CATEGORY_ICONS, ICON_OPTIONS, getCategoryIcon, suggestIconForCategory } from "@/lib/categoryIcons";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6",
  "#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
];

const NewCategoryModal = ({ isOpen, onClose }: NewCategoryModalProps) => {
  const { addCategory, updateCategory, deleteCategory, categories } = useCategories();
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(PRESET_COLORS[5]);
  const [icon, setIcon] = useState("tag");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  if (!isOpen) return null;

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-suggest icon based on name
    if (value.length > 2) {
      const suggestedIcon = suggestIconForCategory(value);
      setIcon(suggestedIcon);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await addCategory(name.trim(), type, color, icon);
    setIsSubmitting(false);

    if (result) {
      toast.success("Categoria criada!");
      setName("");
      setColor(PRESET_COLORS[5]);
      setIcon("tag");
      onClose();
    } else {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteConfirm.id) {
      const success = await deleteCategory(deleteConfirm.id);
      if (success) {
        toast.success("Categoria removida");
      } else {
        toast.error("Erro ao remover categoria");
      }
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const userCategories = categories.filter(c => !c.is_default);

  const IconComponent = getCategoryIcon(icon);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Tag className="text-primary" size={22} />
              <h2 className="text-xl font-semibold text-foreground">Gerir Categorias</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
              <X size={24} className="text-muted-foreground" />
            </button>
          </div>

          <div className="p-4">
            {/* Existing Custom Categories */}
            {userCategories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">As Suas Categorias</h3>
                <div className="grid grid-cols-2 gap-2">
                  {userCategories.map((cat) => {
                    const CatIcon = getCategoryIcon(cat.icon);
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat.color + "20" }}
                          >
                            <CatIcon size={16} style={{ color: cat.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground font-medium truncate">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.type === "income" ? "Receita" : "Despesa"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: cat.id })}
                          className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Category Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Criar Nova Categoria</h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Assinaturas, Animais..."
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      type === "income"
                        ? "border-income bg-income/10 text-income"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      type === "expense"
                        ? "border-expense bg-expense/10 text-expense"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ícone</label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color + "20" }}
                  >
                    <IconComponent size={20} style={{ color }} />
                  </div>
                  <span className="text-foreground">Alterar ícone</span>
                </button>
                
                {showIconPicker && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="grid grid-cols-6 gap-2">
                      {ICON_OPTIONS.map((iconKey) => {
                        const Icon = CATEGORY_ICONS[iconKey];
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => {
                              setIcon(iconKey);
                              setShowIconPicker(false);
                            }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              icon === iconKey
                                ? "bg-primary/20 ring-2 ring-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <Icon size={18} className={icon === iconKey ? "text-primary" : "text-muted-foreground"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Palette size={14} className="inline mr-1" />
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === presetColor ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110" : ""
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-full border border-border text-foreground font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? "A criar..." : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
};

export default NewCategoryModal;
