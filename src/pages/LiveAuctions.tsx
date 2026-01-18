import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useRealtimeAuctions } from "@/hooks/useRealtimeAuctions";
import LiveAuctionCard from "@/components/LiveAuctionCard";
import AuctionQueue from "@/components/AuctionQueue";
import RecentlySold from "@/components/RecentlySold";
import { Radio, Loader2, Clock, Trophy, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const LiveAuctions = () => {
  const { liveVehicle, queuedVehicles, recentlySold, loading, error, refetch } =
    useRealtimeAuctions();
  const { isAdmin } = useUserRole();

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
            <div className="flex items-start justify-between mb-8">
              <div>
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
                  These auctions are happening right now. Bid in real-time and don't
                  miss your chance to own these extraordinary vehicles.
                </p>
              </div>
              {isAdmin && (
                <Link to="/admin/auction-queue">
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Queue
                  </Button>
                </Link>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading live auctions...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8 bg-card rounded-2xl border border-destructive/50 mb-8">
                <p className="text-destructive mb-2">{error}</p>
                <Button variant="outline" onClick={refetch}>
                  Try Again
                </Button>
              </div>
            )}

            {!loading && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Live Auction */}
                <div className="lg:col-span-2">
                  {liveVehicle ? (
                    <LiveAuctionCard vehicle={liveVehicle} onAuctionEnd={refetch} />
                  ) : (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                      <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                        No Live Auction Right Now
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Check the queue below for upcoming auctions.
                      </p>
                      {isAdmin && (
                        <Link to="/admin/auction-queue">
                          <Button>Start an Auction</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Queue */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-lg font-semibold">
                        Up Next ({queuedVehicles.length})
                      </h3>
                    </div>
                    <AuctionQueue vehicles={queuedVehicles} />
                  </div>

                  {/* Recently Sold */}
                  {recentlySold.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-green-500" />
                        <h3 className="font-display text-lg font-semibold">
                          Recently Sold
                        </h3>
                      </div>
                      <RecentlySold vehicles={recentlySold} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LiveAuctions;
