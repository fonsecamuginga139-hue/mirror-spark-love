import { useState } from "react";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, Receipt, X, Check } from "lucide-react";
import { useMonthlyBills, MonthlyBill } from "@/hooks/useMonthlyBills";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

const MonthlyBillsSection = () => {
  const { bills, totalActiveAmount, addBill, updateBill, deleteBill, toggleActive, loading } = useMonthlyBills();
  const { formatCurrency, currency } = useCurrency();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const symbol = currency === "EUR" ? "€" : "$";

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Enter an expense name");
      return;
    }
    const created = await addBill({
      name: newName.trim(),
      amount: parseFloat(newAmount) || 0,
      currency,
    });
    if (created) {
      toast.success("Bill added");
      setNewName("");
      setNewAmount("");
      setIsAdding(false);
    }
  };

  const startEdit = (b: MonthlyBill) => {
    setEditId(b.id);
    setEditName(b.name);
    setEditAmount(String(b.amount));
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateBill(editId, {
      name: editName.trim() || "Untitled",
      amount: parseFloat(editAmount) || 0,
    });
    setEditId(null);
    toast.success("Updated");
  };

  const handleDelete = async (id: string) => {
    await deleteBill(id);
    toast.success("Removed");
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Monthly Bills</h3>
        </div>
        <span className="text-sm font-semibold text-primary">
          {formatCurrency(totalActiveAmount)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Your recurring fixed expenses. Used to calculate your available monthly balance.
      </p>

      {loading ? (
        <div className="finance-card animate-pulse h-20" />
      ) : (
        <div className="space-y-2">
          {bills.map((b) => (
            <div
              key={b.id}
              className={`finance-card flex items-center justify-between group ${!b.active ? "opacity-60" : ""}`}
            >
              {editId === b.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field flex-1"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="input-field pl-7 text-right"
                    />
                  </div>
                  <button onClick={saveEdit} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30">
                    <Check size={16} className="text-primary" />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-2 rounded-lg hover:bg-muted">
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.active ? "Active" : "Disabled"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-semibold">
                      {formatCurrency(Number(b.amount))}
                    </p>
                    <button
                      onClick={() => startEdit(b)}
                      aria-label="Edit"
                      className="p-1 hover:bg-muted rounded transition-all"
                    >
                      <Pencil size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => toggleActive(b.id)}
                      aria-label="Toggle active"
                      className="p-1"
                    >
                      {b.active ? (
                        <ToggleRight size={20} className="text-primary" />
                      ) : (
                        <ToggleLeft size={20} className="text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      aria-label="Delete"
                      className="p-1 hover:bg-destructive/20 rounded transition-all"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="finance-card flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Expense name"
                className="input-field flex-1"
              />
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {symbol}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  className="input-field pl-7 text-right"
                />
              </div>
              <button onClick={handleAdd} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30">
                <Check size={16} className="text-primary" />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setNewAmount("");
                }}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full h-12 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add monthly bill
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyBillsSection;