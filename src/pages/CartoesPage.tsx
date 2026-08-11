import { useState } from "react";
import { Plus, CreditCard, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import NewCardModal from "@/components/NewCardModal";
import { useCards } from "@/hooks/useCards";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

const CartoesPage = () => {
  const { cards, loading, addCard, deleteCard } = useCards();
  const { getCardBalance } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCard = async (data: any) => {
    const result = await addCard({
      name: data.name,
      number: data.number || null,
      color: data.color,
      icon: data.icon,
    });

    if (result) {
      toast.success("Cartão criado com sucesso!");
      setIsModalOpen(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
    toast.success("Cartão removido");
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Cartões</h1>
        <p className="text-muted-foreground mb-6">Gere os teus cartões financeiros</p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} />
          New Card
        </button>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Ainda sem cartões</h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Create your first card to start managing your finances
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-6 flex items-center gap-2"
            >
              <Plus size={18} />
              Create First Card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl p-5 relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)` 
                }}
              >
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  aria-label={`Delete card ${card.name}`}
                  className="absolute top-3 right-3 p-2 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                >
                  <Trash2 size={16} className="text-white" />
                </button>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Saldo</p>
                    <p className="text-white text-2xl font-bold">
                      {formatCurrency(getCardBalance(card.id))}
                    </p>
                  </div>
                  <CreditCard className="text-white/80" size={28} />
                </div>
                <div className="mt-6">
                  <p className="text-white font-semibold">{card.name}</p>
                  {card.number && (
                    <p className="text-white/60 text-sm mt-1">
                      •••• •••• •••• {card.number.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCard}
      />

      <BottomNav />
    </div>
  );
};

export default CartoesPage;
