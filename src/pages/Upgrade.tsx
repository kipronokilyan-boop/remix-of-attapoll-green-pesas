import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Phone, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardNav from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const packages = [
  { name: "Business Basic", key: "basic", price: 200, surveys: 10, earningsMonth: 8000, dailyIncome: 250, earningsSurvey: "Ksh 50 - 100" },
  { name: "Business Premium", key: "premium", price: 400, surveys: 15, earningsMonth: 15000, dailyIncome: 500, earningsSurvey: "Ksh 50 - 100" },
  { name: "Business Expert", key: "expert", price: 800, surveys: 20, earningsMonth: 30000, dailyIncome: 1500, earningsSurvey: "Ksh 50 - 100" },
  { name: "PLATINUM", key: "platinum", price: 1200, surveys: 40, earningsMonth: 60000, dailyIncome: 3000, earningsSurvey: "Ksh 100 - 150" },
  { name: "DIAMOND", key: "diamond", price: 2000, surveys: 60, earningsMonth: 90000, dailyIncome: 4500, earningsSurvey: "Ksh 100 - 200" },
  { name: "ELITE", key: "elite", price: 3500, surveys: 80, earningsMonth: 150000, dailyIncome: 7500, earningsSurvey: "Ksh 150 - 250" },
];

type PaymentState = 'idle' | 'sending' | 'waiting' | 'success' | 'failed';

const Upgrade = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshAccount } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId || paymentState !== 'waiting') return;

    const channel = supabase
      .channel(`payment-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${paymentId}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'completed') {
            setPaymentState('success');
            await refreshAccount();
          } else if (newStatus === 'failed') {
            setPaymentState('failed');
          }
        }
      )
      .subscribe();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('id', paymentId)
        .maybeSingle();

      if (data?.status === 'completed') {
        setPaymentState('success');
        await refreshAccount();
        clearInterval(interval);
      } else if (data?.status === 'failed') {
        setPaymentState('failed');
        clearInterval(interval);
      }
    }, 1500);

    const timeout = setTimeout(() => {
      if (paymentState === 'waiting') {
        setPaymentState('failed');
      }
    }, 120000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId, paymentState]);

  const handlePayment = async () => {
    if (!selectedPackage || !phoneNumber) return;

    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast({ title: "Invalid phone number", description: "Use format like 0712345678", variant: "destructive" });
      return;
    }

    setPaymentState('sending');
    try {
      const { data, error } = await supabase.functions.invoke('lipwa-stk-push', {
        body: {
          amount: selectedPackage.price,
          phone_number: phoneNumber,
          package_name: selectedPackage.key,
          user_id: user?.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setPaymentId(data.payment_id);
        setPaymentState('waiting');
      } else {
        throw new Error(data?.error || "Payment initiation failed");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setPaymentState('failed');
      toast({
        title: "Payment Failed",
        description: err.message || "Could not send STK push. Try again.",
        variant: "destructive",
      });
    }
  };

  const resetPayment = () => {
    setPaymentState('idle');
    setPaymentId(null);
    setPhoneNumber("");
  };

  const closeDialog = () => {
    setSelectedPackage(null);
    resetPayment();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="container mx-auto px-4 mt-6 pb-8">
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2">Select Package</h1>
        <p className="text-center text-muted-foreground mb-8">Upgrade your account to unlock more surveys and earn more</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.name} className="rounded-xl bg-card border border-border p-6 shadow-card flex flex-col">
              <h2 className="font-display text-xl font-bold text-primary mb-4">{pkg.name}</h2>
              <div className="space-y-3 flex-1 text-sm">
                {[
                  { label: "Surveys per day", value: pkg.surveys },
                  { label: "Earnings per month", value: `Ksh ${pkg.earningsMonth.toLocaleString()}` },
                  { label: "Daily income", value: `Ksh ${pkg.dailyIncome.toLocaleString()}` },
                  { label: "Minimum withdrawals", value: `Ksh ${pkg.minWithdraw.toLocaleString()}` },
                  { label: "Earnings per survey", value: pkg.earningsSurvey },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item.label}: <span className="text-foreground font-bold">{item.value}</span></span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-foreground">Ksh {pkg.price.toLocaleString()}</span>
                <Button onClick={() => setSelectedPackage(pkg)} className="gradient-green text-primary-foreground gap-1 font-semibold">
                  Pay Now <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedPackage} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              {paymentState === 'success' ? 'Payment Successful!' : paymentState === 'failed' ? 'Payment Failed' : `Pay for ${selectedPackage?.name}`}
            </DialogTitle>
          </DialogHeader>

          {paymentState === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="h-20 w-20 text-primary mx-auto" />
              <h3 className="font-display text-xl font-bold text-primary">Payment Confirmed!</h3>
              <p className="text-muted-foreground">
                Your account has been upgraded to <span className="text-primary font-bold">{selectedPackage?.name}</span>.
                You now have <span className="text-primary font-bold">{selectedPackage?.surveys} surveys per day</span>!
              </p>
              <Button onClick={() => { closeDialog(); navigate("/dashboard"); }} className="gradient-green text-primary-foreground font-semibold w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {paymentState === 'failed' && (
            <div className="text-center space-y-4 py-4">
              <XCircle className="h-20 w-20 text-destructive mx-auto" />
              <h3 className="font-display text-xl font-bold text-destructive">Payment Not Completed</h3>
              <p className="text-muted-foreground">
                The M-Pesa payment was not completed. This could be because the request timed out, was cancelled, or there were insufficient funds.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={resetPayment} className="gradient-green text-primary-foreground font-semibold">
                  Try Again
                </Button>
                <Button onClick={closeDialog} variant="outline" className="border-primary text-primary">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {paymentState === 'waiting' && (
            <div className="text-center space-y-4 py-4">
              <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
              <h3 className="font-display text-lg font-bold text-foreground">Waiting for M-Pesa Payment...</h3>
              <p className="text-muted-foreground">
                An STK push has been sent to your phone. Please enter your <span className="text-primary font-bold">M-Pesa PIN</span> to complete the payment.
              </p>
              <div className="gradient-green rounded-lg p-3">
                <p className="text-primary-foreground text-sm font-medium">💡 Check your phone for the M-Pesa prompt</p>
              </div>
              <p className="text-xs text-muted-foreground">This will timeout after 2 minutes</p>
            </div>
          )}

          {(paymentState === 'idle' || paymentState === 'sending') && (
            <div className="space-y-4">
              <div className="gradient-green rounded-lg p-4 text-center">
                <p className="text-primary-foreground text-sm font-medium">Amount to Pay</p>
                <p className="text-primary-foreground text-3xl font-bold">Ksh {selectedPackage?.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">M-Pesa Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-secondary/50 border-border pl-10"
                    placeholder="0712345678"
                    maxLength={13}
                    disabled={paymentState === 'sending'}
                  />
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={paymentState === 'sending' || !phoneNumber}
                className="w-full gradient-green text-primary-foreground font-semibold h-12 text-base"
              >
                {paymentState === 'sending' ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending STK Push...</>
                ) : (
                  `Pay Ksh ${selectedPackage?.price.toLocaleString()} via M-Pesa`
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You will receive an M-Pesa prompt on your phone. Enter your PIN to complete payment.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upgrade;
