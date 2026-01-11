import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Radio } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { useCars } from "@/hooks/useCars";

const LiveAuctionBanner = () => {
  const { liveCars } = useCars();
  const featuredLive = liveCars[0];

  if (!featuredLive) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-16 relative overflow-hidden bg-card">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={featuredLive.image}
          alt="Live auction"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 rounded-full px-4 py-2 mb-6">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm text-destructive font-semibold uppercase tracking-wider">
                Live Auction
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {featuredLive.year} {featuredLive.make} {featuredLive.model}
            </h2>

            <p className="text-muted-foreground mb-8 max-w-lg">
              {featuredLive.description}
            </p>

            <div className="flex flex-wrap items-center gap-8 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {formatPrice(featuredLive.currentBid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ends In</p>
                <CountdownTimer endTime={featuredLive.endTime} variant="large" />
              </div>
            </div>

            <div className="flex gap-4">
              <Link to={`/car/${featuredLive.id}`}>
                <Button variant="green" size="lg" className="group">
                  Place Bid Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/live">
                <Button variant="outline" size="lg">
                  View All Live ({liveCars.length})
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full" />
              <img
                src={featuredLive.image}
                alt={`${featuredLive.make} ${featuredLive.model}`}
                className="relative rounded-2xl shadow-elevated"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveAuctionBanner;