import { UserPlus, Search, Gavel, CreditCard, FileCheck, ClipboardCheck, Truck, Car } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. Register & Verify",
    description: "Create your free account and complete ID verification to become an approved bidder.",
  },
  {
    icon: Search,
    title: "2. Browse Vehicles",
    description: "Search our inventory of cars and taxis. Filter by make, condition, price, and location.",
  },
  {
    icon: FileCheck,
    title: "3. Inspect Details",
    description: "View full vehicle history, photos, condition reports, and damage assessments before bidding.",
  },
  {
    icon: Gavel,
    title: "4. Place Your Bid",
    description: "Bid online in real-time or set your maximum bid. Watch live auctions from anywhere.",
  },
  {
    icon: ClipboardCheck,
    title: "5. Win the Auction",
    description: "If you're the highest bidder when the auction ends, you'll be notified immediately.",
  },
  {
    icon: CreditCard,
    title: "6. Make Payment",
    description: "Pay securely via EFT or bank deposit. Buyer's premium and fees are clearly shown upfront.",
  },
  {
    icon: FileCheck,
    title: "7. Documentation",
    description: "We handle all paperwork including title transfer, clearance certificates, and registration.",
  },
  {
    icon: Truck,
    title: "8. Collect or Deliver",
    description: "Collect your vehicle from our yard or arrange delivery to your location across South Africa.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-full">
            Step-by-Step Guide
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4">
            How to Buy at <span className="text-primary">AutoBid SA</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Follow these simple steps to purchase your next vehicle through our online auction platform.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover-lift h-full shadow-card">
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-gradient-green flex items-center justify-center mb-5 shadow-green group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-card rounded-xl p-8 border border-border shadow-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-bold text-foreground">Need Help?</h4>
                <p className="text-muted-foreground text-sm">Our team is available to assist you throughout the process.</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center px-4">
                <span className="font-bold text-2xl text-primary">320+</span>
                <p className="text-muted-foreground">Vehicles</p>
              </div>
              <div className="text-center px-4 border-l border-border">
                <span className="font-bold text-2xl text-primary">50+</span>
                <p className="text-muted-foreground">Taxis</p>
              </div>
              <div className="text-center px-4 border-l border-border">
                <span className="font-bold text-2xl text-primary">15+</span>
                <p className="text-muted-foreground">Locations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;