import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/hooks/useCurrency";
import { LANGUAGES, LanguageCode } from "@/lib/i18n/languages";
import { CURRENCIES, POPULAR_CURRENCIES } from "@/lib/currencies";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

/** First-open experience: pick language, then currency. Saved permanently to the profile. */
const LocaleSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [phase, setPhase] = useState<"language" | "currency">("language");
  const [pickedLang, setPickedLang] = useState<LanguageCode>(language);
  const [pickedCurrency, setPickedCurrency] = useState<string>(currency);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...CURRENCIES].sort((a, b) => {
      const ai = POPULAR_CURRENCIES.indexOf(a.code);
      const bi = POPULAR_CURRENCIES.indexOf(b.code);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.code.localeCompare(b.code);
    });
    if (!q) return sorted;
    return sorted.filter((c) => `${c.code} ${c.name} ${c.symbol}`.toLowerCase().includes(q));
  }, [query]);

  const finish = async () => {
    setSaving(true);
    await setLanguage(pickedLang);
    await setCurrency(pickedCurrency);
    if (user) {
      await supabase
        .from("profiles")
        .update({ locale_setup_completed: true } as any)
        .eq("user_id", user.id);
    }
    localStorage.setItem("vault_locale_setup", "1");
    setSaving(false);
    navigate("/onboarding", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 px-5 py-10">
      <div className="mx-auto w-full max-w-lg">
        <AnimatePresence mode="wait">
          {phase === "language" ? (
            <motion.div
              key="lang"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                {t("locale.chooseLanguage")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("locale.chooseLanguageSub")}</p>

              <div className="mt-8 space-y-3">
                {LANGUAGES.map((l, i) => {
                  const active = pickedLang === l.code;
                  return (
                    <motion.button
                      key={l.code}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={async () => {
                        setPickedLang(l.code);
                        await setLanguage(l.code);
                      }}
                      className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left backdrop-blur-xl transition-all active:scale-[0.98] ${
                        active
                          ? "border-primary bg-primary/10 shadow-[0_0_36px_-8px_hsl(var(--primary)/0.55)]"
                          : "border-border/60 bg-card/60 hover:border-primary/40"
                      }`}
                    >
                      <span className="text-3xl">{l.flag}</span>
                      <span className="flex-1">
                        <span className="block font-bold text-foreground">{l.native}</span>
                        <span className="block text-xs text-muted-foreground">{l.english}</span>
                      </span>
                      {active && <Check className="w-5 h-5 text-primary" />}
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => setPhase("currency")}
                className="mt-8 w-full h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-[0_0_40px_-12px_hsl(var(--primary))] active:scale-[0.98] transition-transform"
              >
                {t("locale.continue")} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="curr"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                {t("locale.chooseCurrency")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("locale.chooseCurrencySub")}</p>

              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("locale.searchCurrency")}
                  className="pl-9 h-12 rounded-2xl bg-card/60 backdrop-blur border-border/60"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1">
                {list.map((c) => {
                  const active = pickedCurrency === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setPickedCurrency(c.code)}
                      className={`rounded-2xl border p-4 text-left backdrop-blur-xl transition-all active:scale-[0.97] ${
                        active
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.6)]"
                          : "border-border/60 bg-card/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-foreground">{c.symbol}</span>
                        {active && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="mt-1 block text-sm font-bold text-foreground">{c.code}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">{t("locale.changeLater")}</p>

              <button
                disabled={saving}
                onClick={finish}
                className="mt-4 w-full h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-[0_0_40px_-12px_hsl(var(--primary))] active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t("locale.continue")} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LocaleSetupPage;
