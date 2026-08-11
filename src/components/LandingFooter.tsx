import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="mt-12 border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FinanceFLOW. Todos os direitos reservados.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            to="/privacy-policy"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Política de Privacidade
          </Link>
          <Link
            to="/terms"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Termos de Serviço
          </Link>
          <Link
            to="/contact"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default LandingFooter;