import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES, LanguageCode, getLanguageMeta } from "@/lib/i18n/languages";

interface Props {
  className?: string;
  variant?: "default" | "minimal";
}

/** Functional language switcher — persists to the profile and updates the app instantly. */
const LanguageToggle = ({ className = "" }: Props) => {
  const { language, setLanguage } = useLanguage();
  const current = getLanguageMeta(language);

  return (
    <label
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-card/60 backdrop-blur ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span className="text-primary font-bold">
        {current.flag} {current.native}
      </span>
      <select
        aria-label="App language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.native}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageToggle;
