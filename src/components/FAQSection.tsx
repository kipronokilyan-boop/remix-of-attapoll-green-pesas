import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is it free to join SurveyissPay?", a: "Yes, joining SurveyissPay is completely free with no hidden fees." },
  { q: "How do I get paid?", a: "You can cash out instantly via M-Pesa, PayPal, or gift cards with no minimum threshold." },
  { q: "Are there any hidden fees?", a: "No, SurveyissPay has no hidden fees. You keep what you earn." },
  { q: "How much can I earn?", a: "You can earn Ksh 500-3,000 daily, with top earners making up to Ksh 23,250 monthly through surveys and referrals." },
  { q: "Is my data safe?", a: "Absolutely. We use bank-level encryption and never share your personal data with third parties." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl font-bold text-center text-gradient-green mb-14"
        >
          Frequently Asked Questions
        </motion.h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="gradient-card rounded-xl border border-border px-4">
              <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
