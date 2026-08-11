import { useState } from "react";
import { X, ArrowRightLeft, CreditCard } from "lucide-react";
import { Card } from "@/hooks/useCards";
import { useCurrency } from "@/hooks/useCurrency";
import CurrencyInput from "@/components/CurrencyInput";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  getCardBalance: (cardId: string) => number;
  onTransfer: (fromCardId: string, toCardId: string, amount: number, description: string) => Promise<boolean>;
}

const TransferModal = ({ isOpen, onClose, cards, getCardBalance, onTransfer }: TransferModalProps) => {
  const { formatCurrency } = useCurrency();
  const [fromCardId, setFromCardId] = useState("");
  const [toCardId, setToCardId] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromCardId || !toCardId || amount <= 0) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (fromCardId === toCardId) {
      toast.error("Selecione cartões diferentes");
      return;
    }

    const fromBalance = getCardBalance(fromCardId);
    if (amount > fromBalance) {
      toast.error("Saldo insuficiente no cartão de origem");
      return;
    }

    setIsSubmitting(true);
    const success = await onTransfer(fromCardId, toCardId, amount, description || "Transferência entre cartões");
    setIsSubmitting(false);

    if (success) {
      toast.success("Transferência concluída!");
      setFromCardId("");
      setToCardId("");
      setAmount(0);
      setDescription("");
      onClose();
    } else {
      toast.error("Erro na transferência");
    }
  };

  const fromCard = cards.find(c => c.id === fromCardId);
  const toCard = cards.find(c => c.id === toCardId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="text-primary" size={22} />
            <h2 className="text-xl font-semibold text-foreground">Transferência</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* From Card */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">De</label>
            <div className="space-y-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setFromCardId(card.id)}
                  disabled={card.id === toCardId}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                    fromCardId === card.id
                      ? "border-primary bg-primary/10"
                      : card.id === toCardId
                      ? "border-border/50 bg-muted/30 opacity-50"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: card.color + "20" }}
                    >
                      <CreditCard size={20} style={{ color: card.color }} />
                    </div>
                    <span className="font-medium text-foreground">{card.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(getCardBalance(card.id))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowRightLeft className="text-primary" size={20} />
            </div>
          </div>

          {/* To Card */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Para</label>
            <div className="space-y-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setToCardId(card.id)}
                  disabled={card.id === fromCardId}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                    toCardId === card.id
                      ? "border-income bg-income/10"
                      : card.id === fromCardId
                      ? "border-border/50 bg-muted/30 opacity-50"
                      : "border-border hover:border-income/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: card.color + "20" }}
                    >
                      <CreditCard size={20} style={{ color: card.color }} />
                    </div>
                    <span className="font-medium text-foreground">{card.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(getCardBalance(card.id))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Valor</label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0,00"
            />
            {fromCard && (
              <p className="text-xs text-muted-foreground mt-1">
                Saldo disponível: {formatCurrency(getCardBalance(fromCard.id))}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descrição (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Transferência para poupança"
              className="input-field"
            />
          </div>

          {/* Summary */}
          {fromCard && toCard && amount > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Resumo da transferência:</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{fromCard.name}</span>
                <span className="text-expense font-semibold">-{formatCurrency(amount)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-medium text-foreground">{toCard.name}</span>
                <span className="text-income font-semibold">+{formatCurrency(amount)}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
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
              disabled={isSubmitting || !fromCardId || !toCardId || amount <= 0}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isSubmitting ? "A transferir..." : "Transferir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
