import { useEffect, useMemo, useState } from "react";
import { Plus, Check, Trash2, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";

interface Item {
  id: string;
  list_id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit_price: number | null;
  is_checked: boolean;
  created_at: string;
}

interface List {
  id: string;
  name: string;
}

const DEFAULT_LIST = "A Minha Lista de Compras";

const ListaPage = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  const ensureList = async () => {
    if (!user) return null;
    const existing = await supabase
      .from("shopping_lists")
      .select("id,name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (existing.data) return existing.data as List;
    const created = await supabase
      .from("shopping_lists")
      .insert({ user_id: user.id, name: DEFAULT_LIST })
      .select("id,name")
      .single();
    return (created.data as List) || null;
  };

  const load = async () => {
    if (!user) return;
    const l = await ensureList();
    if (!l) return;
    setList(l);
    const { data } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("list_id", l.id)
      .order("is_checked", { ascending: true })
      .order("created_at", { ascending: false });
    setItems((data as Item[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const total = useMemo(
    () =>
      items.reduce(
        (s, i) => s + (Number(i.unit_price) || 0) * (Number(i.quantity) || 1),
        0,
      ),
    [items],
  );

  const remaining = useMemo(
    () =>
      items
        .filter((i) => !i.is_checked)
        .reduce(
          (s, i) => s + (Number(i.unit_price) || 0) * (Number(i.quantity) || 1),
          0,
        ),
    [items],
  );

  const addItem = async () => {
    if (!name.trim() || !list || !user) return;
    const p = price.trim() === "" ? null : Number(price);
    const { data, error } = await supabase
      .from("shopping_items")
      .insert({
        user_id: user.id,
        list_id: list.id,
        name: name.trim(),
        quantity: qty || 1,
        unit_price: p ?? undefined,
        is_checked: false,
      })
      .select()
      .single();
    if (error) {
      toast.error("Não foi possível adicionar o item");
      return;
    }
    setItems((prev) => [data as Item, ...prev]);
    setName("");
    setQty(1);
    setPrice("");
  };

  const toggle = async (item: Item) => {
    const next = !item.is_checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: next } : i)));
    await supabase.from("shopping_items").update({ is_checked: next }).eq("id", item.id);
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("shopping_items").delete().eq("id", id);
  };

  const clearChecked = async () => {
    const checked = items.filter((i) => i.is_checked).map((i) => i.id);
    if (checked.length === 0) return;
    setItems((prev) => prev.filter((i) => !i.is_checked));
    await supabase.from("shopping_items").delete().in("id", checked);
    toast.success("Itens marcados removidos");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <BackButton to="/dashboard" />
          <h1 className="text-lg font-semibold font-display text-foreground">Lista de compras</h1>
          <div className="w-10" />
        </div>

        {/* Totals */}
        <div className="finance-card mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total estimado</p>
            <p className="text-3xl font-bold font-display tabular-nums text-foreground">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Falta comprar</p>
            <p className="text-lg font-semibold text-primary tabular-nums">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Add row */}
        <div className="finance-card mb-4 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Adicionar item…"
            className="input-field"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              placeholder="Qtd"
              className="input-field w-20"
            />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preço unitário (opc)"
              className="input-field flex-1"
            />
            <button
              onClick={addItem}
              aria-label="Adicionar"
              className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)] active:scale-95"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="mx-auto mb-3 text-primary/60" size={40} />
            <p>Your list is empty.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className={`finance-card flex items-center gap-3 !p-3 ${
                    item.is_checked ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={() => toggle(item)}
                    aria-label={item.is_checked ? "Desmarcar" : "Marcar"}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${
                      item.is_checked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-primary/40 text-primary/60 hover:bg-primary/10"
                    }`}
                  >
                    <Check size={18} strokeWidth={3} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-foreground font-medium truncate ${
                        item.is_checked ? "line-through" : ""
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                      {item.unit_price
                        ? ` · ${formatCurrency(Number(item.unit_price))} ea`
                        : ""}
                    </p>
                  </div>
                  {item.unit_price ? (
                    <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                      {formatCurrency(Number(item.unit_price) * item.quantity)}
                    </span>
                  ) : null}
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Remover"
                    className="text-muted-foreground hover:text-destructive p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {items.some((i) => i.is_checked) && (
          <button
            onClick={clearChecked}
            className="mt-4 w-full h-11 rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            Clear checked
          </button>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ListaPage;
