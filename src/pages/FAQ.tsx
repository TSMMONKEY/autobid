import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I register to bid?",
    answer: "Simply click on 'Sign Up' and complete the registration form with your details. Once registered, you'll need to pay a R250 refundable deposit to activate your bidding account."
  },
  {
    question: "What is the R250 bidding deposit?",
    answer: "The R250 deposit is a one-time refundable payment that activates your bidding privileges. This ensures serious bidders only and is fully refundable if you don't win any auctions."
  },
  {
    question: "How do I place a bid?",
    answer: "Navigate to any car listing, enter your bid amount (must be higher than the current bid), and click 'Place Bid'. You'll receive confirmation once your bid is recorded."
  },
  {
    question: "What happens if I win an auction?",
    answer: "You'll be notified immediately via email and SMS. You'll have 48 hours to complete payment. Once payment is confirmed, you can arrange vehicle collection or delivery."
  },
  {
    question: "Can I inspect vehicles before bidding?",
    answer: "Yes! We encourage all bidders to inspect vehicles. Contact us to schedule a viewing at our Johannesburg yard during business hours."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept EFT, bank deposits, and cash payments at our office. Full payment must be received within 48 hours of winning an auction."
  },
  {
    question: "Are there any buyer fees?",
    answer: "Yes, a 5% buyer's premium is added to the final bid price. This covers admin, documentation, and storage fees."
  },
  {
    question: "Do you offer vehicle delivery?",
    answer: "Yes, we offer nationwide delivery at additional cost. Delivery fees depend on location and vehicle size. Contact us for a quote."
  },
  {
    question: "What does 'crashed' or 'salvage' condition mean?",
    answer: "Crashed vehicles have accident damage but may be repairable. Salvage vehicles have extensive damage and are typically used for parts. All vehicles are sold as-is."
  },
  {
    question: "Can I get financing for auction vehicles?",
    answer: "We don't offer direct financing, but you can arrange your own financing through banks or private lenders before bidding."
  },
];

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | AutoBid SA</title>
        <meta name="description" content="Find answers to common questions about bidding, payments, and vehicle purchases at AutoBid SA car auctions." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h1>
              <p className="text-muted-foreground">
                Everything you need to know about bidding on AutoBid SA
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FAQ;
