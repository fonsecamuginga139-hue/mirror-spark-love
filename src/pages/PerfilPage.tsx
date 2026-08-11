import { User, LogOut, DollarSign, Euro, Crown, Shield, HelpCircle, MessageSquare } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import PlanBadge from "@/components/PlanBadge";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { isAdmin, isActive, planLabel, planPrice } = useSubscription();
  const { currency } = useCurrency();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await signOut();
    toast.success(t("common.logout"));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t("profile.title")}</h1>

        <div className="finance-card flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{profile?.name || t("common.user")}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
          <PlanBadge showLabel={false} />
        </div>

        {/* Plan Info — read-only. Users subscribe only from the onboarding paywall. */}
        <div className="finance-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">{t("profile.subscription")}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">{t("profile.currentPlan")}</span>
            <span className="text-primary font-medium">{planLabel}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">{t("profile.price")}</span>
            <span className="text-foreground">{planPrice}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">{t("profile.status")}</span>
            <span className={`font-medium ${isActive ? "text-green-500" : "text-yellow-500"}`}>
              {isActive ? t("profile.active") : t("profile.inactive")}
            </span>
          </div>
        </div>

        {/* Currency + Language */}
        <div className="finance-card mb-6">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <span className="text-foreground">{t("profile.currency")}</span>
            <div className="flex items-center gap-2">
              {currency === "EUR" ? <Euro size={18} className="text-primary" /> : <DollarSign size={18} className="text-primary" />}
              <span className="text-primary font-medium">
                {currency === "EUR" ? "Euro (€)" : currency === "BRL" ? "Real (R$)" : currency === "GBP" ? "Libra (£)" : "Dólar Americano ($)"}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-3 mb-6">
            <button onClick={() => navigate("/admin")} className="w-full finance-card flex items-center justify-center gap-2 text-amber-500 hover:bg-amber-500/10 transition-colors">
              <Shield size={20} />
              <span className="font-medium">{t("profile.adminPanel")}</span>
            </button>
            <button onClick={() => navigate("/admin/support")} className="w-full finance-card flex items-center justify-center gap-2 text-amber-500 hover:bg-amber-500/10 transition-colors">
              <MessageSquare size={20} />
              <span className="font-medium">{t("profile.answerSupport")}</span>
            </button>
          </div>
        )}

        <button onClick={() => navigate("/support")} className="w-full finance-card flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors mb-6">
          <HelpCircle size={20} />
          <span className="font-medium">{t("profile.support")}</span>
        </button>

        <button onClick={handleLogout} className="w-full finance-card flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">{t("profile.logout")}</span>
        </button>

        <div className="text-center mt-8">
          <p className="text-primary font-bold italic text-lg">Vault</p>
          <p className="text-muted-foreground text-sm">{t("profile.version")}</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
