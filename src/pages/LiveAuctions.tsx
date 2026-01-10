import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CarCard from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { Radio, Loader2 } from "lucide-react";

const LiveAuctions = () => {
  const { liveCars, isLoading, isError } = useCars();

  return (
    <>
      <Helmet>
        <title>Live Auctions | AutoElite - Bid in Real-Time</title>
        <meta
          name="description"
          content="Join live car auctions now! Bid in real-time on luxury and exotic vehicles at AutoElite."
        />
      </Helmet>
      <Layout>
        <div className="pt-28 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 rounded-full px-4 py-2 mb-6">
                <Radio className="w-4 h-4 text-destructive animate-pulse" />
                <span className="text-sm text-destructive font-semibold uppercase tracking-wider">
                  Live Now
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Live <span className="text-gradient-gold">Auctions</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                These auctions are happening right now. Bid in real-time and don't miss your chance
                to own these extraordinary vehicles.
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading live auctions...</span>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-16 bg-card rounded-2xl border border-destructive/50 mb-8">
                <p className="text-destructive mb-2">Failed to load from API</p>
                <p className="text-muted-foreground text-sm">Showing cached data instead</p>
              </div>
            )}

            {/* Live Cars Grid */}
            {!isLoading && liveCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveCars.map((car, index) => (
                  <div
                    key={car.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                  No Live Auctions Right Now
                </h2>
                <p className="text-muted-foreground">
                  Check back soon or browse our upcoming auctions.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LiveAuctions;
