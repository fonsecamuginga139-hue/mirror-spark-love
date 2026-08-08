import { Mail } from "lucide-react";
import LegalLayout from "@/components/LegalLayout";

const ContactPage = () => {
  return (
    <LegalLayout
      title="Contact"
      description="Get in touch with the FinanceFLOW team."
      path="/contact"
    >
      <p>
        For any question, feedback, or support request, please reach the FinanceFLOW team directly by
        email. We typically respond within 24–48 hours on business days.
      </p>

      <div className="not-prose mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</p>
          <a
            href="mailto:financeflow.team@gmail.com"
            className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors break-all"
          >
            financeflow.team@gmail.com
          </a>
        </div>
      </div>
    </LegalLayout>
  );
};

export default ContactPage;