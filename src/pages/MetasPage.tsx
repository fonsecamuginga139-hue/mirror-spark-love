import { useState } from "react";
import { Plus, Target, Trash2, Check, PartyPopper } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import NewGoalModal from "@/components/NewGoalModal";
import CardSelector from "@/components/CardSelector";
import { useGoals } from "@/hooks/useGoals";
import { useCards } from "@/hooks/useCards";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

const GoalsPage = () => {
  const { cards } = useCards();
  const { getCardBalance } = useTransactions();
  const { formatCurrency } = useCurrency();
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { goals, loading, addGoal, deleteGoal, markAsCompleted, addToGoal } = useGoals(selectedCardId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<string | null>(null);
  const [addAmountModal, setAddAmountModal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const handleAddGoal = async (data: any) => {
    const result = await addGoal({
      name: data.name,
      target_amount: data.targetAmount,
      deadline: data.deadline,
      color: data.color,
      icon: data.icon,
      card_id: data.cardId,
    });

    if (result) {
      toast.success("Goal created successfully!");
      setIsModalOpen(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    toast.success("Goal removed");
  };

  const handleMarkAsCompleted = async (id: string) => {
    setCelebratingGoal(id);
    await markAsCompleted(id);
    
    setTimeout(() => {
      setCelebratingGoal(null);
      toast.success("Congratulations! Goal reached! 🎉");
    }, 3000);
  };

  const handleAddAmount = async () => {
    if (!addAmountModal || !addAmount) return;
    
    const amount = parseFloat(addAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    await addToGoal(addAmountModal, amount);
    toast.success(`${formatCurrency(amount)} added to goal!`);
    setAddAmountModal(null);
    setAddAmount("");
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Goals</h1>
        <p className="text-muted-foreground mb-6">Set and track your financial goals</p>

        {/* Card Selector */}
        <CardSelector
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          getCardBalance={getCardBalance}
          formatCurrency={formatCurrency}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} />
          New Goal
        </button>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {selectedCardId ? "No goals for this card" : "No goals yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Set financial goals and track your progress
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-6 flex items-center gap-2"
            >
              <Plus size={18} />
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const isCelebrating = celebratingGoal === goal.id;
              const cardName = cards.find(c => c.id === goal.card_id)?.name;
              
              return (
                <div 
                  key={goal.id} 
                  className={`finance-card relative overflow-hidden group ${
                    goal.completed ? "opacity-75" : ""
                  }`}
                >
                  {/* Celebration Animation */}
                  {isCelebrating && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center z-10 animate-pulse">
                      <div className="text-center">
                        <PartyPopper size={48} className="text-primary mx-auto mb-2 animate-bounce" />
                        <p className="text-xl font-bold text-primary">Goal Reached!</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {goal.name}
                      </h3>
                      {goal.completed && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {Math.min(progress, 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                  
                  {cardName && (
                    <p className="text-xs text-muted-foreground mb-2">
                      📍 {cardName}
                    </p>
                  )}
                  
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">
                      {formatCurrency(Number(goal.current_amount))}
                    </span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(Number(goal.target_amount))}
                    </span>
                  </div>
                  
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Deadline: {new Date(goal.deadline).toLocaleDateString("en-US")}
                    </p>
                  )}

                  {!goal.completed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddAmountModal(goal.id)}
                        className="flex-1 py-2 px-4 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        Add Funds
                      </button>
                      <button
                        onClick={() => handleMarkAsCompleted(goal.id)}
                        className="py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        <Check size={16} />
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Amount Modal */}
      {addAmountModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Add Funds to Goal
            </h3>
            <input
              type="text"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="0,00"
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAddAmountModal(null);
                  setAddAmount("");
                }}
                className="flex-1 py-3 rounded-full border border-border text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAmount}
                className="flex-1 btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <NewGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddGoal}
        cards={cards}
        defaultCardId={selectedCardId}
      />

      <BottomNav />
    </div>
  );
};

export default GoalsPage;
