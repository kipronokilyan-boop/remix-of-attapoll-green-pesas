import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    education: "",
    email: "",
    password: "",
    terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }

    // Update profile with name
    if (data.user) {
      await supabase.from("profiles").update({
        first_name: form.firstName,
        last_name: form.lastName,
      }).eq("user_id", data.user.id);

      // Create user_account for this user
      await supabase.from("user_accounts").insert({
        user_id: data.user.id,
        phone_number: data.user.id,
        account_type: "free",
        surveys_per_day: 1,
        min_withdrawal: 0,
        balance: 0,
      });
    }

    setLoading(false);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logo} alt="SurveyissPay" className="h-8 w-8 rounded" />
            <span className="font-display text-2xl font-bold text-primary">
              SurveyissPay
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient-green">Register</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">First Name *</label>
            <Input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="bg-secondary/50 border-border h-12"
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Last Name *</label>
            <Input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="bg-secondary/50 border-border h-12"
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Level of Education *</label>
            <Select value={form.education} onValueChange={(v) => setForm({ ...form, education: v })}>
              <SelectTrigger className="bg-secondary/50 border-border h-12">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary School</SelectItem>
                <SelectItem value="secondary">Secondary School</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email Address *</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-secondary/50 border-border h-12"
              placeholder="Enter email"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="text-sm text-muted-foreground mb-1 block">Password *</label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-secondary/50 border-border h-12 pr-10"
              placeholder="Enter password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.terms}
              onCheckedChange={(c) => setForm({ ...form, terms: !!c })}
              className="border-primary data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-muted-foreground">Accept Our Terms and Conditions</span>
          </div>

          <Button
            type="submit"
            disabled={!form.terms || loading}
            className="w-full h-12 gradient-green text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
