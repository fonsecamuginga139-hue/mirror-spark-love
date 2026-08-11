import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, ShoppingCart, Search, CreditCard, Mic, Shield, Keyboard, ScanLine, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [addOpen, setAddOpen] = useState(false);

  const openVoice = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
      setTimeout(() => window.dispatchEvent(new CustomEvent("vault:voice-transaction")), 60);
    } else {
      window.dispatchEvent(new CustomEvent("vault:voice-transaction"));
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const Item = ({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: typeof Plus;
  }) => (
    <Link
      to={to}
      aria-label={label}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
        isActive(to)
          ? "text-primary bg-primary/15"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={22} strokeWidth={2.2} />
      {isActive(to) && (
        <motion.span
          layoutId="nav-dot"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
        />
      )}
    </Link>
  );

  return (
    <>
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 pb-32"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[28px] border border-primary/20 bg-card/95 backdrop-blur-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Adicionar transação</p>
                <button
                  onClick={() => setAddOpen(false)}
                  aria-label="Fechar"
                  className="w-8 h-8 rounded-full bg-muted/40 text-muted-foreground flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setAddOpen(false);
                    navigate("/nova-transacao");
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-5 text-foreground active:scale-[0.98] transition"
                >
                  <Keyboard className="text-primary" size={26} />
                  <span className="text-sm font-semibold">Manual</span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    Teclado e categorias
                  </span>
                </button>

                <button
                  onClick={() => {
                    setAddOpen(false);
                    navigate("/scan");
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-background/60 px-4 py-5 text-foreground active:scale-[0.98] transition"
                >
                  <ScanLine className="text-primary" size={26} />
                  <span className="text-sm font-semibold">Digitalizar</span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    Recibo ou fatura
                  </span>
                </button>
              </div>

              <button
                onClick={() => {
                  setAddOpen(false);
                  openVoice();
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-primary/20 px-4 py-3 text-sm font-semibold text-primary"
              >
                <Mic size={18} /> Registar por voz
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-lg px-4 pb-3">
          <div className="relative flex items-center justify-between rounded-full border border-primary/20 bg-card/85 backdrop-blur-xl px-3 py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]">
            <button
              onClick={() => setAddOpen(true)}
              aria-label="Adicionar transação"
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                addOpen ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus size={22} strokeWidth={2.2} />
            </button>
            <Item to="/lista" label={t("nav.shopping")} icon={ShoppingCart} />
            <Item to="/busca" label={t("nav.search")} icon={Search} />
            <Item to="/parcelas" label={t("nav.installments")} icon={CreditCard} />
            <Item to="/emergency" label={t("nav.emergency")} icon={Shield} />

            <button
              onClick={openVoice}
              aria-label={t("nav.voice")}
              className="ml-1 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95 transition-transform"
            >
              <Mic size={26} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
