import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";
import { Card } from "@/hooks/useCards";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  cardId?: string | null;
}

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, "id" | "currentAmount">) => void;
  cards?: Card[];
  defaultCardId?: string | null;
}

const colors = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#eab308", // yellow
];

const NewGoalModal = ({ isOpen, onClose, onAdd, cards = [], defaultCardId }: NewGoalModalProps) => {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(defaultCardId || null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCardId(defaultCardId || null);
    }
  }, [isOpen, defaultCardId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      name,
      targetAmount: targetAmount,
      deadline: deadline || undefined,
      color: selectedColor,
      cardId: selectedCardId,
    });

    setName("");
    setTargetAmount(0);
    setDeadline("");
    setSelectedColor(colors[0]);
    setSelectedCardId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">New Goal</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vacation, New car..."
              className="input-field"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target Amount *
            </label>
            <CurrencyInput
              value={targetAmount}
              onChange={setTargetAmount}
              placeholder="0,00"
              required
            />
          </div>

          {/* Card Selection */}
          {cards.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Card (optional)
              </label>
              <select
                value={selectedCardId || ""}
                onChange={(e) => setSelectedCardId(e.target.value || null)}
                className="input-field"
              >
                <option value="">All cards</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Link this goal to a specific card
              </p>
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Deadline (optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Color
            </label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color ? "ring-2 ring-offset-2 ring-offset-card ring-white" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGoalModal;
