import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WithdrawalReminder = () => {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    // Show reminder if no phone number (withdrawal details) set
    if (!profile?.phone_number) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  const handleAddNow = () => {
    setOpen(false);
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border w-[calc(100%-3rem)] max-w-sm rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-6 w-6 text-primary" />
            <DialogTitle className="font-display text-primary">Add Withdrawal Details</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            You haven't added your M-Pesa withdrawal details yet. Add them now so you can withdraw your survey earnings easily.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button onClick={handleAddNow} className="flex-1 gradient-green text-primary-foreground font-semibold">
            Add Now
          </Button>
          <Button onClick={() => setOpen(false)} variant="outline" className="flex-1 border-border">
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalReminder;
