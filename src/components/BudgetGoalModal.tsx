import { useState, useEffect } from "react";
import { X, Target, AlertTriangle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useBudgetGoals } from "@/hooks/useBudgetGoals";
import { useCurrency } from "@/hooks/useCurrency";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "sonner";

interface BudgetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BudgetGoalModal = ({ isOpen, onClose }: BudgetGoalModalProps) => {
  const { expenseCategories } = useCategories();
  const { budgetGoals, addBudgetGoal, deleteBudgetGoal } = useBudgetGoals();
  const { formatCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory("");
      setMonthlyLimit(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || monthlyLimit <= 0) return;

    setIsSubmitting(true);
    const result = await addBudgetGoal(selectedCategory, monthlyLimit);
    setIsSubmitting(false);

    if (result) {
      toast.success("Budget goal saved!");
      setSelectedCategory("");
      setMonthlyLimit(0);
    } else {
      toast.error("Error saving goal");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteBudgetGoal(id);
    if (success) {
      toast.success("Goal removed");
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = expenseCategories.find(c => c.id === categoryId);
    return cat?.name || "Category";
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="text-primary" size={22} />
            <h2 className="text-xl font-semibold text-foreground">Budget Goals</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          {/* Existing Goals */}
          {budgetGoals.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Goals</h3>
              <div className="space-y-2">
                {budgetGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{getCategoryName(goal.category_id)}</p>
                      <p className="text-sm text-muted-foreground">
                        Limit: {formatCurrency(Number(goal.monthly_limit))}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Goal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Add New Goal</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a category</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Monthly Limit</label>
              <CurrencyInput
                value={monthlyLimit}
                onChange={setMonthlyLimit}
                placeholder="0,00"
                required
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-500">
                You'll get visual alerts when spending exceeds 80% of the limit.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory || monthlyLimit <= 0}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add Goal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetGoalModal;
