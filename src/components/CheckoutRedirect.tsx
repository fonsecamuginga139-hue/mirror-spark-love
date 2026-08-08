import { Button } from "@/components/ui/button";
import { useCheckoutUrl } from "@/hooks/usePaymentSettings";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}

/**
 * Redirects the user to the Hotmart checkout in the same tab, so the
 * whole flow stays inside the app (no new browser window opens).
 * Hotmart's return URL brings the user back to Vault after purchase.
 */
export const openCheckout = (url: string, email?: string) => {
  if (!url) {
    toast.error("Checkout is not configured yet. Please contact support.");
    return;
  }
  let finalUrl = url;
  if (email) {
    const separator = url.includes("?") ? "&" : "?";
    finalUrl = `${url}${separator}email=${encodeURIComponent(email)}`;
  }
  // In-app navigation (same tab) — user is returned to Vault after checkout.
  window.location.assign(finalUrl);
};

export const CheckoutButton = ({ className, children, variant = "default" }: CheckoutButtonProps) => {
  const { checkoutUrl, loading } = useCheckoutUrl();
  return (
    <Button onClick={() => openCheckout(checkoutUrl)} disabled={loading} className={className} variant={variant}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
      {children || "Continue to checkout"}
    </Button>
  );
};

export default CheckoutButton;
