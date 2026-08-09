import { useState, useCallback } from "react";
import { Crown, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openCheckout } from "@/components/CheckoutRedirect";
import { useCheckoutUrl } from "@/hooks/usePaymentSettings";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface ExpiredPaywallProps {
  children: React.ReactNode;
}

const ExpiredPaywall = ({ children }: ExpiredPaywallProps) => {
  const [showModal, setShowModal] = useState(true);
  const { checkoutUrl } = useCheckoutUrl();
  const { profile } = useAuth();
  const { t } = useLanguage();

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isNavLink = target.closest("nav") || target.closest("[data-nav]");
    if (isNavLink) return;
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  }, []);

  const price = "US$ 4,99";

  return (
    <div className="relative">
      <div onClickCapture={handleInteraction} className="pointer-events-auto">
        {children}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-primary/20 bg-card/90 backdrop-blur-xl p-8 shadow-2xl shadow-primary/10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">{t("paywall.expiredTitle")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("paywall.expiredSub")}</p>
            </div>
            <Button
              onClick={() => {
                setShowModal(false);
                openCheckout(checkoutUrl, profile?.email ?? undefined);
              }}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/30 transition-all"
            >
              <Crown className="w-5 h-5 mr-2" />
              {t("paywall.expiredCta", { price })}
            </Button>
            <button onClick={() => setShowModal(false)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredPaywall;
