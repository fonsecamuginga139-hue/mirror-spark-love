import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import LandingFooter from "@/components/LandingFooter";

interface LegalLayoutProps {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, path, children }: LegalLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-foreground">
      <SEO title={title} description={description} path={path} />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
      <header className="sticky top-0 z-10 border-b border-border/40 bg-black/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Link to="/" className="text-sm font-semibold tracking-wide text-primary">
            FinanceFLOW
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl p-6 sm:p-10 shadow-xl shadow-primary/5">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mb-8">
            Last updated: June 23, 2026
          </p>
          <div className="prose prose-invert max-w-none space-y-5 text-[15px] leading-relaxed text-foreground/90 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-muted-foreground [&_a]:text-primary [&_a]:underline">
            {children}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LegalLayout;