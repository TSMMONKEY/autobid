import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  Gavel, 
  Heart, 
  Trophy, 
  TrendingUp,
  ArrowRight,
  Loader2,
  FileText,
  CreditCard,
  RefreshCw,
  ShoppingCart,
  Receipt,
  ScrollText,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRegistrationStatus } from "@/hooks/useRegistrationStatus";
import { supabase } from "@/integrations/supabase/client";
import RegistrationChecklist from "@/components/RegistrationChecklist";

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
    is_live: boolean;
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
  const { registration, loading: regLoading, completionItems, isComplete, canBid } = useRegistrationStatus();
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    walletBalance: 0,
    activeBids: 0,
    likedCars: 0,
    wonAuctions: 0,
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
              image,
              is_live
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

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
            is_live: bid.vehicles.is_live,
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
          .limit(20);

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
        const wonBids = transformedBids.filter(
          bid => bid.vehicle && !bid.vehicle.is_live && bid.amount === bid.vehicle.current_bid
        );

        setStats({
          walletBalance: registration?.deposit_amount || 0,
          activeBids: uniqueVehicleIds.length,
          likedCars: transformedWatchlist.length,
          wonAuctions: wonBids.length,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id, registration?.deposit_amount]);

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
    if (!bid.vehicle.is_live && bid.amount === bid.vehicle.current_bid) return "won";
    return bid.amount === bid.vehicle.current_bid ? "winning" : "outbid";
  };

  if (authLoading || loading || regLoading) {
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
      label: "Deposit Balance", 
      value: `R${stats.walletBalance.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-green-600",
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

  const menuItems = [
    { label: "My Sales", icon: ShoppingCart, description: "View your sold vehicles" },
    { label: "Registration Status", icon: User, description: "Complete your profile", link: "/profile" },
    { label: "Deposit", icon: CreditCard, description: "Manage your deposit", link: "/activate-bidding" },
    { label: "Refunds", icon: RefreshCw, description: "View refund requests" },
    { label: "Current Sales Orders", icon: ShoppingCart, description: "Active sales orders" },
    { label: "Sales Invoices", icon: Receipt, description: "View your invoices" },
    { label: "Statement", icon: ScrollText, description: "Account statement" },
    { label: "Bid History", icon: History, description: "All your bids", active: true },
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
                Welcome back, {user?.email?.split("@")[0]}! Here's your account overview.
              </p>
            </div>

            {/* Registration Status Alert */}
            {!isComplete && (
              <div className="mb-8">
                <RegistrationChecklist />
              </div>
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
                </div>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bids">Bid History</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Recent Bids */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">Recent Bids</CardTitle>
                      <Link to="#" className="text-primary text-sm hover:underline" onClick={() => document.querySelector('[value="bids"]')?.dispatchEvent(new MouseEvent('click'))}>
                        View All
                      </Link>
                    </CardHeader>
                    <CardContent>
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
                                    getBidStatus(bid) === "won"
                                      ? "bg-primary/20 text-primary border-primary/50"
                                      : getBidStatus(bid) === "winning" 
                                        ? "bg-green-500/20 text-green-700 border-green-500/50" 
                                        : "bg-red-500/20 text-red-700 border-red-500/50"
                                  }
                                >
                                  {getBidStatus(bid) === "won" ? (
                                    <><Trophy className="w-3 h-3 mr-1" /> Won</>
                                  ) : getBidStatus(bid) === "winning" ? (
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
                    </CardContent>
                  </Card>

                  {/* Liked Cars (Watchlist) */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">Liked Cars</CardTitle>
                      <Link to="/auctions" className="text-primary text-sm hover:underline">
                        Browse More
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {watchlistItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No liked vehicles yet. Browse auctions!</p>
                        ) : (
                          watchlistItems.slice(0, 5).map((item) => (
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
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Menu */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Menu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {menuItems.map((item, index) => (
                        item.link ? (
                          <Link key={index} to={item.link}>
                            <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                              <item.icon className="w-6 h-6 text-primary mb-2" />
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </Link>
                        ) : (
                          <div key={index} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer opacity-60">
                            <item.icon className="w-6 h-6 text-muted-foreground mb-2" />
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">Coming soon</p>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bids" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Complete Bid History
                    </CardTitle>
                    <CardDescription>All bids you have placed on vehicles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userBids.length === 0 ? (
                      <div className="text-center py-12">
                        <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">You haven't placed any bids yet.</p>
                        <Link to="/auctions">
                          <Button className="mt-4">Browse Auctions</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userBids.map((bid) => (
                          <Link key={bid.id} to={`/car/${bid.vehicle_id}`}>
                            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                              <img 
                                src={bid.vehicle?.image || "/placeholder.svg"}
                                alt="Vehicle"
                                className="w-20 h-14 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {bid.vehicle ? `${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}` : "Vehicle"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Bid: R{bid.amount.toLocaleString()} • {getRelativeTime(bid.created_at)}
                                </p>
                              </div>
                              <Badge 
                                className={
                                  getBidStatus(bid) === "won"
                                    ? "bg-primary/20 text-primary border-primary/50"
                                    : getBidStatus(bid) === "winning" 
                                      ? "bg-green-500/20 text-green-700 border-green-500/50" 
                                      : "bg-red-500/20 text-red-700 border-red-500/50"
                                }
                              >
                                {getBidStatus(bid) === "won" ? "Won" : getBidStatus(bid) === "winning" ? "Winning" : "Outbid"}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="registration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Registration Status
                    </CardTitle>
                    <CardDescription>Complete all steps to start bidding on vehicles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {completionItems.map((item) => (
                        <div
                          key={item.key}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            item.complete ? "bg-green-500/10 border-green-500/30" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.complete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <span className={item.complete ? "text-muted-foreground" : "font-medium"}>
                              {item.label}
                            </span>
                          </div>
                          {!item.complete && (
                            <Link to="/profile">
                              <Button size="sm" variant="outline">
                                Complete
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {isComplete && (
                      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">Registration Complete!</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          You can now bid on all available vehicles.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Deposit Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Deposit Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Required Deposit</p>
                        <p className="text-2xl font-bold text-primary">R5,000</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {canBid ? "Deposit paid" : "Deposit required to start bidding"}
                        </p>
                      </div>
                      {canBid ? (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      ) : (
                        <Link to="/activate-bidding">
                          <Button>
                            Pay Deposit
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Sales</CardTitle>
                      <CardDescription>Vehicles you have sold</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No sales yet</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Refunds</CardTitle>
                      <CardDescription>Refund requests and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No refund requests</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Orders</CardTitle>
                      <CardDescription>Current active orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No active orders</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Statement</CardTitle>
                      <CardDescription>Account transaction history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transactions yet</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

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
                  <User className="w-5 h-5" />
                  Edit Profile
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
                  <AlertCircle className="w-5 h-5" />
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
