import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, ShoppingCart, Search, CreditCard, Mic, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-4 pb-3">
        <div className="relative flex items-center justify-between rounded-full border border-primary/20 bg-card/85 backdrop-blur-xl px-3 py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]">
          <Item to="/nova-transacao" label="Nova transação" icon={Plus} />
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
  );
};

export default BottomNav;
