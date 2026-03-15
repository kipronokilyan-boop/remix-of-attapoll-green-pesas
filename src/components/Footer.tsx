import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="py-10 bg-secondary border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src={logo} alt="SurveyissPay" className="h-6 w-6 rounded" />
          <span className="font-display text-lg font-bold text-primary">SurveyissPay</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © 2025 SurveyissPay. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;