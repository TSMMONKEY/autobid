import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, History, TrendingUp, Trophy, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  vehicle_id: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    current_bid: number;
    image: string;
    is_live: boolean;
    auction_status: string;
  };
}

const BidHistoryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchBids = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bids")
          .select(`
            id,
            amount,
            created_at,
            vehicle_id,
            vehicles (
              make,
              model,
              year,
              current_bid,
              image,
              is_live,
              auction_status
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedBids = (data || []).map((bid: any) => ({
          id: bid.id,
          amount: bid.amount,
          created_at: bid.created_at,
          vehicle_id: bid.vehicle_id,
          vehicle: bid.vehicles ? {
            make: bid.vehicles.make,
            model: bid.vehicles.model,
            year: bid.vehicles.year,
            current_bid: bid.vehicles.current_bid,
            image: bid.vehicles.image,
            is_live: bid.vehicles.is_live,
            auction_status: bid.vehicles.auction_status,
          } : undefined,
        }));

        setBids(transformedBids);
      } catch (error) {
        console.error("Error fetching bids:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [user?.id]);

  const getBidStatus = (bid: Bid) => {
    if (!bid.vehicle) return "unknown";
    if (bid.vehicle.auction_status === "sold" && bid.amount === bid.vehicle.current_bid) return "won";
    if (bid.vehicle.auction_status === "unsold") return "unsold";
    if (!bid.vehicle.is_live && bid.amount === bid.vehicle.current_bid) return "won";
    return bid.amount === bid.vehicle.current_bid ? "winning" : "outbid";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; label: string }> = {
      won: { className: "bg-primary/20 text-primary border-primary/50", label: "Won" },
      winning: { className: "bg-green-500/20 text-green-700 border-green-500/50", label: "Winning" },
      outbid: { className: "bg-red-500/20 text-red-700 border-red-500/50", label: "Outbid" },
      unsold: { className: "bg-muted text-muted-foreground", label: "Unsold" },
      unknown: { className: "bg-muted text-muted-foreground", label: "Unknown" },
    };
    return styles[status] || styles.unknown;
  };

  // Group bids by vehicle
  const groupedBids = bids.reduce((acc, bid) => {
    if (!acc[bid.vehicle_id]) {
      acc[bid.vehicle_id] = [];
    }
    acc[bid.vehicle_id].push(bid);
    return acc;
  }, {} as Record<string, Bid[]>);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bid History | AutoBid SA</title>
        <meta name="description" content="View your complete bidding history" />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Bid <span className="text-primary">History</span>
              </h1>
              <p className="text-muted-foreground">
                All bids you have placed on vehicles ({bids.length} total bids)
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{bids.length}</p>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{Object.keys(groupedBids).length}</p>
                  <p className="text-sm text-muted-foreground">Vehicles Bid On</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {bids.filter(b => getBidStatus(b) === "winning" || getBidStatus(b) === "won").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Winning/Won</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {bids.filter(b => getBidStatus(b) === "won").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Auctions Won</p>
                </CardContent>
              </Card>
            </div>

            {bids.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Bids Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any bids yet. Start bidding on vehicles!
                  </p>
                  <Link to="/auctions">
                    <Button>Browse Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => {
                  const status = getBidStatus(bid);
                  const statusStyle = getStatusBadge(status);
                  
                  return (
                    <Card key={bid.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={bid.vehicle?.image || "/placeholder.svg"}
                            alt={bid.vehicle ? `${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}` : "Vehicle"}
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {bid.vehicle ? `${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}` : "Vehicle"}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Your bid: R{bid.amount.toLocaleString()}
                              </span>
                              <span>•</span>
                              <span>Current: R{bid.vehicle?.current_bid.toLocaleString() || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(bid.created_at), "MMM dd, yyyy 'at' HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={statusStyle.className}>
                              {status === "won" && <Trophy className="w-3 h-3 mr-1" />}
                              {status === "winning" && <TrendingUp className="w-3 h-3 mr-1" />}
                              {statusStyle.label}
                            </Badge>
                            <Link to={`/car/${bid.vehicle_id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default BidHistoryPage;