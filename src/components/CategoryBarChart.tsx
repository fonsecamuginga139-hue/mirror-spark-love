import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { TransactionWithDetails } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  transactions: TransactionWithDetails[];
  onSelect?: (categoryName: string) => void;
}

// Parent-category → emoji fallback. Items (café, pão, gasolina…) never live here.
const EMOJI_MAP: Record<string, string> = {
  food: "🍽️", alimentação: "🍽️", alimentacao: "🍽️", comida: "🍽️", groceries: "🛒", restaurants: "🍽️", restaurant: "🍽️",
  transport: "🚗", transporte: "🚗", transportation: "🚗",
  housing: "🏠", rent: "🏠", moradia: "🏠", casa: "🏠",
  entertainment: "🎬", entretenimento: "🎬",
  health: "💊", saúde: "💊", saude: "💊", healthcare: "💊",
  education: "📚", educação: "📚", educacao: "📚",
  subscriptions: "💳", assinaturas: "💳",
  shopping: "🛍️",
  travel: "✈️", viagem: "✈️",
  bills: "🧾", utilities: "💡", contas: "🧾",
  salary: "💼", salário: "💼", salario: "💼",
  investments: "📈", investimentos: "📈",
  freelance: "💼", business: "🏢",
  savings: "🐖", pets: "🐾", family: "👨‍👩‍👧",
  other: "🗂️",
};

const guessEmoji = (name: string) => {
  const key = name.trim().toLowerCase();
  if (EMOJI_MAP[key]) return EMOJI_MAP[key];
  for (const k of Object.keys(EMOJI_MAP)) {
    if (key.includes(k)) return EMOJI_MAP[k];
  }
  return "🗂️";
};

// Detects whether an icon string is already an emoji (short, non-ASCII) vs a lucide keyword.
const isEmoji = (s: string | undefined | null) =>
  !!s && s.length <= 4 && /\p{Extended_Pictographic}/u.test(s);

const CategoryBarChart = ({ transactions, onSelect }: Props) => {
  const { formatCurrency } = useCurrency();

  const data = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const map = new Map<string, { name: string; value: number; icon: string }>();
    expenses.forEach((t) => {
      const name = t.category_name || "Other";
      const iconRaw = (t as any).category_icon as string | undefined;
      const icon = isEmoji(iconRaw) ? (iconRaw as string) : guessEmoji(name);
      const prev = map.get(name);
      if (prev) prev.value += Number(t.amount);
      else map.set(name, { name, value: Number(t.amount), icon });
    });
    const list = Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
    const total = list.reduce((s, x) => s + x.value, 0) || 1;
    return { list, total };
  }, [transactions]);

  if (data.list.length === 0) return null;

  return (
    <div className="finance-card animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <BarChart3 className="text-primary" size={16} />
        </div>
        <h3 className="text-lg font-semibold font-display text-foreground">Gastos por Categoria</h3>
      </div>

      <div className="space-y-4">
        {data.list.map((item) => {
          const pct = (item.value / data.total) * 100;
          const width = Math.max(pct, 8); // keep the head visible for tiny values
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelect?.(item.name)}
              className="w-full text-left space-y-1.5 rounded-xl p-1 -m-1 hover:bg-primary/5 active:scale-[0.99] transition"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium truncate pr-2">{item.name}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {formatCurrency(item.value)} <span className="text-foreground/60">· {pct.toFixed(0)}%</span>
                </span>
              </div>
              <div className="relative h-8">
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-primary/5" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${width}%`,
                    background:
                      "linear-gradient(90deg, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary)) 100%)",
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.35)",
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-base shadow-lg ring-2 ring-background transition-[left] duration-700 ease-out"
                  style={{ left: `calc(${width}% - 32px)` }}
                  aria-hidden
                >
                  <span className="leading-none">{item.icon}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBarChart;