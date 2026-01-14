import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Gavel, 
  Heart, 
  Trophy, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserBid {
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
  };
}

interface WatchlistVehicle {
  id: string;
  vehicle_id: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    current_bid: number;
    image: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    walletBalance: 0,
    activeBids: 0,
    likedCars: 0,
    wonAuctions: 0,
    biddingActive: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Fetch user's bids with vehicle info
        const { data: bidsData, error: bidsError } = await supabase
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
              image
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (bidsError) throw bidsError;

        // Transform bids data
        const transformedBids = (bidsData || []).map((bid: any) => ({
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
          } : undefined,
        }));

        setUserBids(transformedBids);

        // Fetch user's watchlist with vehicle info
        const { data: watchlistData, error: watchlistError } = await supabase
          .from("watchlist")
          .select(`
            id,
            vehicle_id,
            vehicles (
              id,
              make,
              model,
              year,
              current_bid,
              image
            )
          `)
          .eq("user_id", user.id)
          .limit(5);

        if (watchlistError) throw watchlistError;

        // Transform watchlist data
        const transformedWatchlist = (watchlistData || []).map((item: any) => ({
          id: item.id,
          vehicle_id: item.vehicle_id,
          vehicle: item.vehicles ? {
            id: item.vehicles.id,
            make: item.vehicles.make,
            model: item.vehicles.model,
            year: item.vehicles.year,
            current_bid: item.vehicles.current_bid,
            image: item.vehicles.image,
          } : undefined,
        }));

        setWatchlistItems(transformedWatchlist);

        // Calculate stats
        const uniqueVehicleIds = [...new Set(transformedBids.map(b => b.vehicle_id))];
        const winningBids = transformedBids.filter(
          bid => bid.vehicle && bid.amount === bid.vehicle.current_bid
        );

        setStats({
          walletBalance: 0,
          activeBids: uniqueVehicleIds.length,
          likedCars: transformedWatchlist.length,
          wonAuctions: 0, // Would need to check ended auctions
          biddingActive: transformedBids.length > 0,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getBidStatus = (bid: UserBid) => {
    if (!bid.vehicle) return "unknown";
    return bid.amount === bid.vehicle.current_bid ? "winning" : "outbid";
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const statsData = [
    { 
      label: "Wallet Balance", 
      value: `R${stats.walletBalance.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-green-600",
      action: "Add Funds"
    },
    { 
      label: "Active Bids", 
      value: stats.activeBids.toString(), 
      icon: Gavel, 
      color: "text-blue-600" 
    },
    { 
      label: "Liked Cars", 
      value: stats.likedCars.toString(), 
      icon: Heart, 
      color: "text-red-500" 
    },
    { 
      label: "Won Auctions", 
      value: stats.wonAuctions.toString(), 
      icon: Trophy, 
      color: "text-yellow-600" 
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | AutoBid SA</title>
        <meta name="description" content="Manage your bids, wallet, and liked cars on AutoBid SA." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                My <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split("@")[0]}! Here's your bidding overview.
              </p>
            </div>

            {/* Bidding Status Alert */}
            {!stats.biddingActive && (
              <Link to="/activate-bidding">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8 flex items-center justify-between hover:bg-orange-500/15 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-700">Activate Bidding</h3>
                      <p className="text-sm text-muted-foreground">
                        Pay R250 deposit to start bidding on vehicles
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-600" />
                </div>
              </Link>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statsData.map((stat, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.action && (
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                      <Plus className="w-4 h-4 mr-1" />
                      {stat.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Bids */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Recent Bids</h2>
                  <Link to="/auctions" className="text-primary text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {userBids.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No bids yet. Start bidding on vehicles!</p>
                  ) : (
                    userBids.slice(0, 5).map((bid) => (
                      <Link key={bid.id} to={`/car/${bid.vehicle_id}`}>
                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div>
                            <p className="font-medium text-foreground">
                              {bid.vehicle ? `${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}` : "Vehicle"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                R{bid.amount.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">• {getRelativeTime(bid.created_at)}</span>
                            </div>
                          </div>
                          <Badge 
                            className={
                              getBidStatus(bid) === "winning" 
                                ? "bg-green-500/20 text-green-700 border-green-500/50" 
                                : "bg-red-500/20 text-red-700 border-red-500/50"
                            }
                          >
                            {getBidStatus(bid) === "winning" ? (
                              <><TrendingUp className="w-3 h-3 mr-1" /> Winning</>
                            ) : (
                              "Outbid"
                            )}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Liked Cars (Watchlist) */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Liked Cars</h2>
                  <Link to="/auctions" className="text-primary text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {watchlistItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No liked vehicles yet. Browse auctions!</p>
                  ) : (
                    watchlistItems.map((item) => (
                      <Link key={item.id} to={`/car/${item.vehicle_id}`}>
                        <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                          <img 
                            src={item.vehicle?.image || "/placeholder.svg"} 
                            alt={item.vehicle ? `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model}` : "Vehicle"} 
                            className="w-16 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {item.vehicle ? `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model}` : "Vehicle"}
                            </p>
                            <p className="text-sm text-primary font-semibold">
                              R{item.vehicle?.current_bid?.toLocaleString() || 0}
                            </p>
                          </div>
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <Link to="/auctions">
                  <Button variant="outline" className="w-full mt-4">
                    Browse More Cars
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/auctions">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Gavel className="w-5 h-5" />
                  Browse Auctions
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Clock className="w-5 h-5" />
                  View Profile
                </Button>
              </Link>
              <Link to="/shipping">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Trophy className="w-5 h-5" />
                  Track Delivery
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Heart className="w-5 h-5" />
                  Get Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;