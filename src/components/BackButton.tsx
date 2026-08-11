import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton = ({ to, label, className = "" }: Props) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label={label || "Voltar"}
      className={`inline-flex items-center gap-2 h-10 px-3 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 active:scale-95 transition ${className}`}
    >
      <ArrowLeft size={18} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};

export default BackButton;
