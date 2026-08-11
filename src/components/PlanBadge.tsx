import { Crown, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";

interface PlanBadgeProps {
  className?: string;
  showLabel?: boolean;
}

const PlanBadge = ({ className, showLabel = true }: PlanBadgeProps) => {
  const { plano, planLabel, isActive } = useSubscription();

  const getIcon = () => {
    switch (plano) {
      case "admin":
        return <Crown className="w-4 h-4" />;
      case "mensal":
        return <Zap className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getColorClasses = () => {
    switch (plano) {
      case "admin":
        return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30";
      case "mensal":
        return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
        getColorClasses(),
        className
      )}
    >
      {getIcon()}
      {showLabel && (
        <span>{isActive ? planLabel : "Sem plano ativo"}</span>
      )}
    </div>
  );
};

export default PlanBadge;
