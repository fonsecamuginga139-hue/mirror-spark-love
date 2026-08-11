import { useState } from "react";
import { X, Check, CreditCard, Wallet, Camera, PiggyBank, Landmark, DollarSign, Euro, CircleDollarSign, Coins, Bitcoin, Building2, TrendingUp } from "lucide-react";

const colors = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#f97316", // orange
  "#ef4444", // red
  "#eab308", // yellow
  "#06b6d4", // cyan
];

const icons = [
  { name: "card", Icon: CreditCard },
  { name: "wallet", Icon: Wallet },
  { name: "camera", Icon: Camera },
  { name: "piggy", Icon: PiggyBank },
  { name: "bank", Icon: Landmark },
  { name: "dollar", Icon: DollarSign },
  { name: "euro", Icon: Euro },
  { name: "circle-dollar", Icon: CircleDollarSign },
  { name: "coins", Icon: Coins },
  { name: "bitcoin", Icon: Bitcoin },
  { name: "building", Icon: Building2 },
  { name: "trending", Icon: TrendingUp },
];

interface Card {
  id: string;
  name: string;
  number?: string;
  color: string;
  icon: string;
}

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: Omit<Card, "id">) => void;
}

const NewCardModal = ({ isOpen, onClose, onAdd }: NewCardModalProps) => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedIcon, setSelectedIcon] = useState("card");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      name,
      number: number || undefined,
      color: selectedColor,
      icon: selectedIcon,
    });

    setName("");
    setNumber("");
    setSelectedColor(colors[0]);
    setSelectedIcon("card");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Novo Cartão</h2>
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
              Nome do Cartão *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Chase, Millennium BCP..."
              className="input-field"
              required
            />
          </div>

          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número do Cartão (opcional)
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="**** **** **** 1234"
              className="input-field"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cor
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="aspect-square rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check className="text-white" size={24} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ícone
            </label>
            <input
              type="text"
              placeholder="Pesquisar ícone..."
              className="input-field mb-3"
            />
            <div className="grid grid-cols-6 gap-2">
              {icons.map(({ name: iconName, Icon }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === iconName
                      ? "border-2 border-primary bg-primary/10"
                      : "border border-border bg-secondary"
                  }`}
                >
                  <Icon
                    size={20}
                    className={selectedIcon === iconName ? "text-primary" : "text-muted-foreground"}
                  />
                </button>
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
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCardModal;
