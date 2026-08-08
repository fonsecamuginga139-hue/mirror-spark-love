import { createContext, useContext, useState, ReactNode } from "react";

interface CardContextType {
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  return (
    <CardContext.Provider value={{ selectedCardId, setSelectedCardId }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error("useCardContext must be used within a CardProvider");
  }
  return context;
};
