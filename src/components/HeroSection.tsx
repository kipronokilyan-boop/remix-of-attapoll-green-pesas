import { CheckCircle2, Circle, DollarSign, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero pt-20 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center md:text-left"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-gradient-green">Earn Money by Sharing</span>
              <br />
              <span className="text-gradient-green">Your Opinions</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Join the SurveyissPay survey panel
            </p>
            <p className="text-muted-foreground text-lg mb-2">
              and earn up to <span className="text-primary font-semibold">Ksh 23,250</span> /month?
            </p>
            <p className="text-primary font-semibold text-lg mb-4">It is possible!</p>
            <p className="text-muted-foreground text-lg mb-2 font-medium">
              How much would you like to earn?
            </p>
            <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto md:mx-0">
              Your opinions matter! Complete quick surveys and get paid instantly via M-Pesa. Join thousands of Kenyans earning from home.
            </p>

            <div className="animate-bounce-arrow mb-6">
              <ArrowDown className="h-6 w-6 text-primary mx-auto md:mx-0" />
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
              <a href="/register" className="gradient-green gradient-green-hover px-6 py-3 rounded-full font-semibold text-primary-foreground transition-all">
                Sign Up
              </a>
              <a href="/login" className="border border-primary px-6 py-3 rounded-full font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Login
              </a>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href="#" className="gradient-green gradient-green-hover px-5 py-2.5 rounded-full text-sm font-semibold text-primary-foreground transition-all">
                Up to Ksh 6,200
              </a>
              <a href="#" className="gradient-green gradient-green-hover px-5 py-2.5 rounded-full text-sm font-semibold text-primary-foreground transition-all">
                Up to Ksh 23,250
              </a>
              <a href="#" className="gradient-green gradient-green-hover px-5 py-2.5 rounded-full text-sm font-semibold text-primary-foreground transition-all">
                Ksh 23,250 and More
              </a>
            </div>
          </motion.div>

          {/* Right - Survey Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="bg-card rounded-2xl shadow-card overflow-hidden w-full max-w-sm border border-border">
              <div className="gradient-green px-6 py-4">
                <h3 className="font-display text-lg font-bold text-primary-foreground text-center tracking-wider">
                  SURVEY
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground text-sm">Very Satisfied</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground text-sm">Satisfied</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground text-sm">Neutral</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground text-sm">Dissatisfied</span>
                </label>
                <div className="flex justify-end pt-2">
                  <div className="gradient-green h-8 w-8 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
