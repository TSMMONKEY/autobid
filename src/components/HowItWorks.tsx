import { UserPlus, Search, Gavel, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Register for free and complete your bidder verification to start bidding.",
  },
  {
    icon: Search,
    title: "Find Your Car",
    description: "Browse our curated collection of luxury and exotic vehicles up for auction.",
  },
  {
    icon: Gavel,
    title: "Place Your Bid",
    description: "Bid in real-time auctions or set your maximum bid and let us handle the rest.",
  },
  {
    icon: Truck,
    title: "Secure Delivery",
    description: "Complete your purchase and we'll arrange safe delivery to your location.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            How <span className="text-gradient-gold">It Works</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our streamlined auction process makes buying your dream car simple and secure.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="bg-secondary/50 rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 hover-lift h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 shadow-gold group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
