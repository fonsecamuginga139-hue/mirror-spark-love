import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { useInstallments } from "@/hooks/useInstallments";
import { useCurrency } from "@/hooks/useCurrency";

const ParcelasPage = () => {
  const { installments, loading, add, remove, markPaid } = useInstallments();
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    direction: "pay" as "pay" | "receive",
    total_amount: "",
    installments_count: "12",
  });

  const totalToPay = installments
    .filter((i) => i.direction === "pay")
    .reduce((s, i) => s + Number(i.monthly_amount) * (i.installments_count - i.installments_paid), 0);

  const totalToReceive = installments
    .filter((i) => i.direction === "receive")
    .reduce((s, i) => s + Number(i.monthly_amount) * (i.installments_count - i.installments_paid), 0);

  const submit = async () => {
    const total = Number(form.total_amount);
    const count = Number(form.installments_count);
    if (!form.description.trim() || !total || !count) {
      toast.error("Preenche todos os campos");
      return;
    }
    setSaving(true);
    const r = await add({
      description: form.description.trim(),
      direction: form.direction,
      total_amount: total,
      installments_count: count,
    });
    setSaving(false);
    if (r) {
      toast.success("Parcela adicionada");
      setOpen(false);
      setForm({ description: "", direction: "pay", total_amount: "", installments_count: "12" });
    } else {
      toast.error("Não foi possível guardar");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <BackButton to="/dashboard" />
          <h1 className="text-lg font-semibold font-display text-foreground">Parcelas</h1>
          <button
            onClick={() => setOpen(true)}
            aria-label="Adicionar parcela"
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="finance-card !p-3">
            <div className="flex items-center gap-2 text-expense">
              <ArrowUpCircle size={14} />
              <span className="text-xs uppercase">Em dívida</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground mt-1">
              {formatCurrency(totalToPay)}
            </p>
          </div>
          <div className="finance-card !p-3">
            <div className="flex items-center gap-2 text-income">
              <ArrowDownCircle size={14} />
              <span className="text-xs uppercase">A receber</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground mt-1">
              {formatCurrency(totalToReceive)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : installments.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No installments yet.</p>
            <p className="text-xs mt-1">Tap + to track a payment plan or something you'll receive in parts.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {installments.map((i) => {
              const pct = (i.installments_paid / i.installments_count) * 100;
              return (
                <motion.li
                  key={i.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                  className="finance-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${
                        i.direction === "pay"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {i.icon || (i.direction === "pay" ? "💳" : "💰")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{i.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(i.monthly_amount))} × {i.installments_count} ·{" "}
                        {i.installments_paid}/{i.installments_count} paid
                      </p>
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      aria-label="Remover"
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-primary/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className={`h-full rounded-full ${
                        i.direction === "pay"
                          ? "bg-gradient-to-r from-destructive/60 to-destructive shadow-[0_0_15px_hsl(var(--destructive)/0.4)]"
                          : "bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                      }`}
                    />
                  </div>
                  {i.installments_paid < i.installments_count && (
                    <button
                      onClick={() => markPaid(i)}
                      className="mt-3 w-full h-10 rounded-full border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Mark next installment {i.direction === "pay" ? "paid" : "received"}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => !saving && setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-primary/20 bg-card p-5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold font-display text-foreground">
                  New installment
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex bg-primary/5 rounded-full p-1 mb-4">
                {(["pay", "receive"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((f) => ({ ...f, direction: d }))}
                    className={`flex-1 h-10 rounded-full text-sm font-medium capitalize transition ${
                      form.direction === d
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d === "pay" ? "I'll pay" : "I'll receive"}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição (ex: Telemóvel novo)"
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.total_amount}
                    onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                    type="number"
                    step="0.01"
                    placeholder="Valor total"
                    className="input-field"
                  />
                  <input
                    value={form.installments_count}
                    onChange={(e) => setForm({ ...form, installments_count: e.target.value })}
                    type="number"
                    min={1}
                    placeholder="Número de parcelas"
                    className="input-field"
                  />
                </div>
                {Number(form.total_amount) > 0 && Number(form.installments_count) > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ≈ {formatCurrency(Number(form.total_amount) / Number(form.installments_count))} / month
                  </p>
                )}
              </div>

              <button
                onClick={submit}
                disabled={saving}
                className="w-full h-12 mt-5 rounded-full bg-primary text-primary-foreground font-medium shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "A guardar…" : "Guardar parcela"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default ParcelasPage;
