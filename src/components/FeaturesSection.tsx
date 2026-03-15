import { Zap, Shield, Clock, MapPin, Star, Gift } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, title: "Instant Payments", desc: "Get paid instantly via M-Pesa with no minimum withdrawal amount." },
  { icon: Shield, title: "Secure & Trusted", desc: "Your data is protected with bank-level security. Trusted by 100,000+ users." },
  { icon: Clock, title: "Quick Surveys", desc: "Complete surveys in just 2-5 minutes and earn Ksh 50-500 per survey." },
  { icon: MapPin, title: "Kenya Focused", desc: "Surveys tailored for Kenyan users with local brands and topics." },
  { icon: Star, title: "High Ratings", desc: "4.8/5 star rating from our community. Join thousands of satisfied users." },
  { icon: Gift, title: "Multiple Rewards", desc: "Earn through surveys, referrals, and special offers. More ways to earn!" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl font-bold text-center text-gradient-green mb-14"
        >
          Why Choose SurveyissPay?
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="gradient-card rounded-xl p-6 border border-border hover:shadow-green transition-shadow"
            >
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
