import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Star, Wallet, HelpCircle, Tag, CreditCard, Plus, ArrowUpCircle, Banknote, ListChecks, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const packageLimits: Record<string, { surveys: number; name: string }> = {
  free: { surveys: 1, name: "Free Account" },
  basic: { surveys: 10, name: "Business Basic" },
  premium: { surveys: 15, name: "Business Premium" },
  expert: { surveys: 20, name: "Business Expert" },
  platinum: { surveys: 40, name: "PLATINUM" },
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, account, refreshProfile } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payForm, setPayForm] = useState({ name: "", provider: "", number: "" });

  const accountType = account?.account_type || "free";
  const balance = account?.balance || 0;
  const pkg = packageLimits[accountType] || packageLimits.free;
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "User";
  const displayEmail = profile?.email || user?.email || "";

  useEffect(() => {
    if (profile?.phone_number) {
      setPayForm({ name: displayName, provider: "Safaricom (M-Pesa)", number: profile.phone_number });
    }
  }, [profile]);

  const savePayment = async () => {
    if (!payForm.name || !payForm.provider || !payForm.number || !user) return;
    const { error } = await supabase.from("profiles").update({ phone_number: payForm.number }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to save payment details.", variant: "destructive" });
      return;
    }
    await refreshProfile();
    setShowPaymentDialog(false);
    toast({ title: "Saved!", description: "Payment details updated." });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="container mx-auto px-4 mt-6 pb-8">
        <div className="rounded-xl bg-card border border-border p-6 shadow-card">
          <div className="flex items-center gap-3 mb-1">
            <User className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-primary">{displayName}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Mail className="h-4 w-4" /> {displayEmail}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Account type:</p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{pkg.name}</span>
                </div>
                <span className="inline-block mt-1 gradient-green text-primary-foreground px-3 py-0.5 rounded-full text-xs font-bold">{pkg.surveys} survey{pkg.surveys > 1 ? "s" : ""} per day</span>
              </div>
              <Button onClick={() => navigate("/upgrade")} className="gradient-green text-primary-foreground gap-2">
                <ArrowUpCircle className="h-4 w-4" /> Upgrade
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Balance:</p>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-foreground" />
                  <span className="font-bold text-foreground">Ksh {balance.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" className="border-primary text-primary gap-2">
                <Banknote className="h-4 w-4" /> Withdraw
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Surveys:</p>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-foreground" />
                  <span className="font-bold text-foreground">20</span>
                </div>
              </div>
              <Button onClick={() => navigate("/dashboard")} variant="outline" className="border-primary text-primary gap-2">
                <ListChecks className="h-4 w-4" /> Surveys
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Loyalty points:</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-foreground" />
                  <span className="font-bold text-foreground">0</span>
                </div>
              </div>
              <Button onClick={() => navigate("/referrals")} variant="outline" className="border-primary text-primary gap-2">
                <RefreshCw className="h-4 w-4" /> Referrals
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment details:</p>
                {profile?.phone_number ? (
                  <div className="mt-1">
                    <p className="font-bold text-foreground">{displayName}</p>
                    <p className="text-sm text-muted-foreground">M-Pesa — {profile.phone_number}</p>
                  </div>
                ) : (
                  <span className="font-bold text-foreground">Not Provided</span>
                )}
              </div>
              <Button onClick={() => setShowPaymentDialog(true)} className="gradient-green text-primary-foreground gap-2">
                <Plus className="h-4 w-4" /> {profile?.phone_number ? "Edit" : "Add"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 gradient-green rounded-lg p-3 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm text-primary-foreground font-medium">Currency is based on your country for convenience</span>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-3">Transactions History</h3>
          <div className="rounded-xl bg-card border border-border p-6 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Add Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Account Name</label>
              <Input
                value={payForm.name}
                onChange={(e) => setPayForm({ ...payForm, name: e.target.value })}
                className="bg-secondary/50 border-border"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Payment Provider</label>
              <Select value={payForm.provider} onValueChange={(v) => setPayForm({ ...payForm, provider: v })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Safaricom (M-Pesa)">Safaricom (M-Pesa)</SelectItem>
                  <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
              <Input
                value={payForm.number}
                onChange={(e) => setPayForm({ ...payForm, number: e.target.value })}
                className="bg-secondary/50 border-border"
                placeholder="e.g. 0712345678"
              />
            </div>
            <Button onClick={savePayment} className="w-full gradient-green text-primary-foreground font-semibold">
              Save Payment Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
