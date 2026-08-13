import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Delete, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { getCategoryIcon } from "@/lib/categoryIcons";

type TxType = "expense" | "income";

const NovaTransacaoPage = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { categories, loading: loadingCategories } = useCategories();
  const { formatCurrency } = useCurrency();

  const [type, setType] = useState<TxType>("expense");
  const [digits, setDigits] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /** Os dígitos são sempre centavos — evita teclado nativo e valores inválidos. */
  const amount = useMemo(() => Number(digits || "0") / 100, [digits]);

  /** O valor nunca deve sair do ecrã: encolhe conforme cresce. */
  const amountFontSize = useMemo(() => {
    const n = formatCurrency(amount).length;
    if (n <= 10) return "3rem";
    if (n <= 13) return "2.5rem";
    if (n <= 16) return "2rem";
    if (n <= 19) return "1.6rem";
    return "1.3rem";
  }, [amount, formatCurrency]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => !c.type || c.type === type),
    [categories, type],
  );

  const press = (key: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (key === "del") {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    // Máximo 9 dígitos (até 9 999 999,99) — evita números "quebrados" no ecrã.
    setDigits((d) => {
      const next = (d + key).replace(/^0+(?=\d)/, "");
      return next.length > 9 ? d : next;
    });
  };


  const handleSave = async () => {
    if (amount <= 0) {
      toast.error("Introduz um valor maior que zero");
      return;
    }
    if (!categoryId) {
      toast.error("Escolhe uma categoria");
      return;
    }
    setSaving(true);
    const result = await addTransaction({
      type,
      amount,
      category_id: categoryId,
      description: description.trim() || null,
      source: "manual",
      occurred_on: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    if (!result) {
      toast.error("Não foi possível guardar. Tenta novamente.");
      return;
    }
    toast.success(type === "expense" ? "Despesa adicionada" : "Receita adicionada");
    navigate("/dashboard");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Cabeçalho */}
      <header className="flex items-center gap-2 p-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Nova transação</h1>
      </header>

      {/* Selector Despesa / Receita */}
      <div className="px-4">
        <div className="relative flex rounded-full border border-border bg-card/60 p-1">
          {(["expense", "income"] as TxType[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                setType(option);
                setCategoryId(null);
              }}
              className={`relative flex-1 h-11 rounded-full text-sm font-semibold transition-colors ${
                type === option ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {type === option && (
                <motion.span
                  layoutId="tx-type-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{option === "expense" ? "Despesa" : "Receita"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div className="px-4 py-8 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Valor</p>
        <p
          className={`font-bold tabular-nums leading-none whitespace-nowrap ${
            amount > 0 ? (type === "income" ? "text-emerald-400" : "text-foreground") : "text-muted-foreground/50"
          }`}
          style={{ fontSize: amountFontSize }}
        >
          {formatCurrency(amount)}
        </p>
      </div>


      {/* Descrição */}
      <div className="px-4">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className="w-full h-12 rounded-xl border border-border bg-card/60 px-4 text-sm outline-none focus:border-primary/60"
        />
      </div>

      {/* Categorias */}
      <div className="px-4 pt-6 flex-1">
        <p className="text-sm font-medium text-muted-foreground mb-3">Categoria</p>
        {loadingCategories ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {visibleCategories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const selected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all active:scale-95 ${
                    selected
                      ? "border-primary bg-primary/15"
                      : "border-border bg-card/50 hover:border-primary/40"
                  }`}
                >
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}22`, color: category.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] leading-tight text-center line-clamp-2">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Teclado numérico próprio */}
      <div className="px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => press(key)}
              className="h-14 rounded-xl border border-border bg-card/60 text-xl font-semibold flex items-center justify-center active:scale-95 active:bg-primary/15 transition-all"
              aria-label={key === "del" ? "Apagar" : key}
            >
              {key === "del" ? <Delete className="w-5 h-5" /> : key}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Guardar
        </button>
      </div>
    </div>
  );
};

export default NovaTransacaoPage;
