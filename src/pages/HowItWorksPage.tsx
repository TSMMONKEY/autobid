import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Search,
  Gavel,
  Truck,
  Shield,
  CreditCard,
  Clock,
  Award,
  ArrowRight,
} from "lucide-react";

const HowItWorksPage = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      description:
        "Sign up for free and complete your bidder verification. This process ensures a safe and trustworthy auction environment for all participants.",
    },
    {
      icon: Search,
      title: "Discover Your Dream Car",
      description:
        "Browse our curated collection of luxury, exotic, and collector vehicles. Use filters to find the perfect match for your preferences and budget.",
    },
    {
      icon: Gavel,
      title: "Place Your Bid",
      description:
        "Bid in real-time during live auctions or set your maximum bid amount. Our system will automatically bid on your behalf up to your limit.",
    },
    {
      icon: Truck,
      title: "Secure Delivery",
      description:
        "Once you win, complete your purchase securely. We'll coordinate safe transport and delivery of your new vehicle to your desired location.",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Verified Vehicles",
      description:
        "Every vehicle undergoes thorough inspection and verification before listing.",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description:
        "Protected transactions with escrow service for buyer and seller confidence.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Our dedicated team is available around the clock to assist you.",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description:
        "All listings must meet our strict quality standards before going live.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>How It Works | AutoElite - Premium Car Auctions</title>
        <meta
          name="description"
          content="Learn how to buy luxury and exotic cars at AutoElite auctions. Simple process from registration to delivery."
        />
      </Helmet>
      <Layout>
        <div className="pt-28 pb-16">
          {/* Hero */}
          <section className="container mx-auto px-4 text-center mb-20">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              How <span className="text-gradient-gold">It Works</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Buying your dream car has never been easier. Follow our simple
              four-step process to join the elite world of automotive collecting.
            </p>
          </section>

          {/* Steps */}
          <section className="container mx-auto px-4 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-primary to-[hsl(28,90%,45%)] rounded-full flex items-center justify-center font-bold text-primary-foreground text-lg shadow-gold">
                    {index + 1}
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-card py-20 mb-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Why Choose <span className="text-gradient-gold">AutoElite</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  We provide a premium auction experience with unmatched service and security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="text-center p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(28,90%,45%)] flex items-center justify-center mx-auto mb-4 shadow-gold">
                      <benefit.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-secondary to-card rounded-3xl p-12 border border-border">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start Bidding?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Create your free account today and join thousands of collectors
                bidding on the world's finest automobiles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="gold" size="xl" className="group">
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auctions">
                  <Button variant="glass" size="xl">
                    Browse Auctions
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default HowItWorksPage;
