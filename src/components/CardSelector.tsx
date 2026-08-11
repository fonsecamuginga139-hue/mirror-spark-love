import { useState, useEffect } from "react";
import { CreditCard, Check, Wallet } from "lucide-react";
import { Card } from "@/hooks/useCards";
import { cn } from "@/lib/utils";

interface CardSelectorProps {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  getCardBalance: (cardId: string) => number;
  formatCurrency: (value: number) => string;
}

const CardSelector = ({
  cards,
  selectedCardId,
  onSelectCard,
  getCardBalance,
  formatCurrency,
}: CardSelectorProps) => {
  if (cards.length <= 1) {
    return null;
  }

  // Calculate total balance across all cards
  const totalBalance = cards.reduce((acc, card) => acc + getCardBalance(card.id), 0);

  return (
    <div className="mb-6 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-3 font-medium">Selecionar um cartão</p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Consolidated View Option */}
        <button
          onClick={() => onSelectCard(null)}
          className={cn(
            "relative p-4 rounded-2xl border-2 transition-all duration-300",
            "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
            !selectedCardId
              ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
              : "border-border/50 hover:border-primary/50 hover:scale-[1.01]"
          )}
        >
          {!selectedCardId && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check size={12} className="text-primary-foreground" />
            </div>
          )}
          <div className="flex flex-col items-start gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
              }}
            >
              <Wallet size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">Todos os Cartões</p>
              <p className={cn(
                "text-xs font-medium",
                totalBalance >= 0 ? "text-income" : "text-expense"
              )}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </button>

        {/* Individual Cards */}
        {cards.map((card) => {
          const balance = getCardBalance(card.id);
          const isSelected = selectedCardId === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all duration-300",
                "bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
                isSelected
                  ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "border-border/50 hover:border-primary/50 hover:scale-[1.01]"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col items-start gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}99)`,
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm truncate max-w-[80px]">
                    {card.name}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    balance >= 0 ? "text-income" : "text-expense"
                  )}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CardSelector;
