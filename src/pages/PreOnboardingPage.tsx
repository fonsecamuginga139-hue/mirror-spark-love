import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  ArrowRight, TrendingUp, Wallet, Target, Repeat, PieChart, Calendar,
  Sparkles, ShieldCheck, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import LandingFooter from "@/components/LandingFooter";
import LanguageToggle from "@/components/LanguageToggle";

const featureIcons = [Wallet, Target, PieChart, Repeat, TrendingUp, Calendar];

const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: [0, -8, 0] }}
    transition={{ opacity: { duration: 0.6, delay }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay } }}
    className={className}
  >
    {children}
  </motion.div>
);

const HeroVisual = () => (
  <div className="relative h-[340px] w-full max-w-[360px] mx-auto">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25),transparent_70%)] blur-2xl" />
    <FloatingCard className="absolute left-2 right-2 top-4">
      <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-5 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]">
        <p className="text-xs text-muted-foreground">Total Balance</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">$12,450.00</p>
        <div className="mt-4 grid grid-cols-7 gap-1 items-end h-10">
          {[35, 55, 42, 70, 50, 80, 95].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/50 to-primary" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </FloatingCard>
    <FloatingCard delay={0.4} className="absolute -left-2 top-44">
      <div className="rounded-xl border border-primary/30 bg-card/90 backdrop-blur-xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div><p className="text-[10px] text-muted-foreground">Income</p><p className="text-sm font-bold text-primary">+$4,200</p></div>
        </div>
      </div>
    </FloatingCard>
    <FloatingCard delay={0.8} className="absolute right-0 top-56">
      <div className="rounded-xl border border-primary/30 bg-card/90 backdrop-blur-xl px-4 py-3 shadow-xl w-[160px]">
        <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-primary" /><p className="text-xs font-semibold">Emergency Fund</p></div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full w-[68%] bg-gradient-to-r from-primary to-primary/60" /></div>
        <p className="text-[10px] text-muted-foreground mt-1">68%</p>
      </div>
    </FloatingCard>
  </div>
);

const PreOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, tArray } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    localStorage.setItem("pre_onboarding_seen", "true");
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!loading && user && profile) {
    return <Navigate to={profile.onboarding_completed ? "/dashboard" : "/onboarding"} replace />;
  }

  const goSignup = () => navigate("/auth", { state: { mode: "signup" } });
  const scrollToFeatures = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });

  const pains = tArray("landing.pains");
  const clarityBullets = tArray("landing.clarityBullets");
  // features: array of {title,desc}
  const featuresRaw = (JSON.parse(JSON.stringify(tArray("landing.features"))) as unknown as { title: string; desc: string }[]) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <SEO
        title="Vault — Take control of your personal finances"
        description="Vault helps you track spending, manage cards, set goals and automate recurring bills with a premium mobile-first experience."
        path="/pre-onboarding"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.18),transparent)] pointer-events-none" />

      <header className={`sticky top-0 z-30 transition-all ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/40" : ""}`}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/vault-logo.png" alt="VAULT financial management logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-bold tracking-wider text-foreground">VAULT</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.signIn")}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-4 pb-16">
        <section className="pt-6 pb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary">
              <Sparkles className="w-3 h-3" /> {t("landing.badge")}
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] text-foreground">
              {t("landing.heroTitle1")}<br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t("landing.heroTitle2")}</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed px-2">{t("landing.heroSub")}</p>
          </motion.div>

          <HeroVisual />

          <div className="mt-8 space-y-3">
            <Button onClick={goSignup} size="lg" className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30">
              {t("landing.startFree")}<ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={scrollToFeatures} variant="outline" size="lg" className="w-full h-12 rounded-2xl border-border/60 bg-card/40">
              {t("landing.howItWorks")}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-1">{t("landing.trialHint")}</p>
          </div>
        </section>

        <section className="py-10 space-y-3">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider text-center mb-2">{t("landing.painsTitle")}</h2>
          {pains.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm px-5 py-4 text-foreground">{p}</motion.div>
          ))}
        </section>

        <section id="features" className="py-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{t("landing.featuresTitle")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("landing.featuresSub")}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {featuresRaw.map((f, i) => {
              const Icon = featureIcons[i] || Wallet;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-primary/15 bg-card/50 backdrop-blur-sm p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 space-y-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h3 className="text-xl font-bold leading-snug">{t("landing.clarityTitle")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {clarityBullets.map((b, i) => (
                <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {b}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-10">
          <div className="text-center space-y-5">
            <h2 className="text-3xl font-bold leading-tight">
              {t("landing.ctaTitle1")}<br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t("landing.ctaTitle2")}</span>
            </h2>
            <p className="text-muted-foreground text-sm">{t("landing.ctaSub")}</p>
            <Button onClick={goSignup} size="lg" className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-lg shadow-primary/30">
              {t("landing.startFree")}<ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default PreOnboardingPage;
