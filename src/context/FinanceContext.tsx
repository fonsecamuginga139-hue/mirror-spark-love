import { useState, createContext, useContext, ReactNode } from "react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  cardId?: string;
}

interface Card {
  id: string;
  name: string;
  number?: string;
  color: string;
  icon: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

interface FutureBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  paid: boolean;
}

interface FinanceContextType {
  transactions: Transaction[];
  cards: Card[];
  goals: Goal[];
  futureBills: FutureBill[];
  currency: string;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addCard: (card: Omit<Card, "id">) => void;
  addGoal: (goal: Omit<Goal, "id" | "currentAmount">) => void;
  addFutureBill: (bill: Omit<FutureBill, "id">) => void;
  deleteTransaction: (id: string) => void;
  deleteCard: (id: string) => void;
  deleteGoal: (id: string) => void;
  deleteFutureBill: (id: string) => void;
  updateGoalAmount: (id: string, amount: number) => void;
  toggleBillPaid: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [futureBills, setFutureBills] = useState<FutureBill[]>([]);
  const currency = "USD";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      ...prev,
      { ...transaction, id: crypto.randomUUID() },
    ]);
  };

  const addCard = (card: Omit<Card, "id">) => {
    setCards((prev) => [...prev, { ...card, id: crypto.randomUUID() }]);
  };

  const addGoal = (goal: Omit<Goal, "id" | "currentAmount">) => {
    setGoals((prev) => [
      ...prev,
      { ...goal, id: crypto.randomUUID(), currentAmount: 0 },
    ]);
  };

  const addFutureBill = (bill: Omit<FutureBill, "id">) => {
    setFutureBills((prev) => [...prev, { ...bill, id: crypto.randomUUID() }]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const deleteFutureBill = (id: string) => {
    setFutureBills((prev) => prev.filter((b) => b.id !== id));
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  const toggleBillPaid = (id: string) => {
    setFutureBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b))
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        cards,
        goals,
        futureBills,
        currency,
        addTransaction,
        addCard,
        addGoal,
        addFutureBill,
        deleteTransaction,
        deleteCard,
        deleteGoal,
        deleteFutureBill,
        updateGoalAmount,
        toggleBillPaid,
        formatCurrency,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
