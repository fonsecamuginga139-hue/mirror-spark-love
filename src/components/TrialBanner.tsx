import { useNavigate } from "react-router-dom";
import { Clock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/context/LanguageContext";

const TrialBanner = () => {
  const { isTrialActive, daysLeft } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!isTrialActive) return null;

  return (
    <div
      onClick={() => navigate("/plans")}
      className="mx-4 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-between cursor-pointer hover:from-primary/30 hover:to-primary/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {daysLeft === 1 ? t("trial.oneDayLeft") : t("trial.daysLeft", { days: daysLeft })}
          </p>
          <p className="text-xs text-muted-foreground">{t("trial.tapToSee")}</p>
        </div>
      </div>
      <Sparkles className="w-5 h-5 text-primary" />
    </div>
  );
};

export default TrialBanner;

