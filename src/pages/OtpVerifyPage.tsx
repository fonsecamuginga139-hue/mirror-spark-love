import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

const OTP_LENGTH = 8;

const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const email = location.state?.email as string | undefined;
  const password = location.state?.password as string | undefined;
  const isSignup = !!location.state?.isSignup;

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (!email) navigate("/auth", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const verify = async (token: string) => {
    if (!email) return;
    if (token.length !== OTP_LENGTH) {
      toast({
        title: "Incomplete code",
        description: "Please enter the full 8-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      let description = "Invalid verification code.";
      if (msg.includes("expired")) description = "This code has expired. Request a new one.";
      else if (msg.includes("rate") || msg.includes("too many"))
        description = "Too many attempts. Please try again later.";
      toast({ title: "Verification failed", description, variant: "destructive" });
      setVerifying(false);
      setCode("");
      return;
    }

    if (isSignup && password) {
      await supabase.auth.updateUser({ password });
    }

    toast({ title: "Verified", description: "Welcome to Vault." });
    navigate(isSignup ? "/onboarding" : "/dashboard", { replace: true });
  };

  const onChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    if (digits.length === OTP_LENGTH && !verifying) verify(digits);
  };

  const resend = async () => {
    if (!email || resendIn > 0) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: isSignup },
    });
    if (error) {
      toast({ title: "Could not resend", description: error.message, variant: "destructive" });
      return;
    }
    setResendIn(30);
    toast({ title: "Code sent", description: "Check your inbox for the new code." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <div className="relative z-10 p-4">
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm">
              Enter the 8-digit verification code sent to
              <br />
              <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          <div className="flex justify-center w-full">
            <InputOTP
              maxLength={OTP_LENGTH}
              value={code}
              onChange={onChange}
              disabled={verifying}
              inputMode="numeric"
              pattern="[0-9]*"
              containerClassName="gap-1.5"
            >
              <InputOTPGroup className="gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-9 sm:h-14 sm:w-11 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md text-lg font-semibold transition-all data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/40 data-[active=true]:shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
                  />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator className="text-muted-foreground" />
              <InputOTPGroup className="gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InputOTPSlot
                    key={i + 4}
                    index={i + 4}
                    className="h-12 w-9 sm:h-14 sm:w-11 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md text-lg font-semibold transition-all data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/40 data-[active=true]:shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={() => verify(code)}
            disabled={code.length !== OTP_LENGTH || verifying}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 font-semibold"
          >
            {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
          </Button>

          <button
            onClick={resend}
            disabled={resendIn > 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;