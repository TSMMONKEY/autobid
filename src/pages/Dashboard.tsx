import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
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
  Plus
} from "lucide-react";

// Mock data for dashboard
const mockData = {
  walletBalance: 0,
  activeBids: 3,
  likedCars: 7,
  wonAuctions: 0,
  biddingActive: false,
  recentBids: [
    { id: "1", car: "2019 Toyota Hilux", amount: 185000, status: "outbid", time: "2 hours ago" },
    { id: "2", car: "2020 VW Polo", amount: 145000, status: "winning", time: "5 hours ago" },
    { id: "3", car: "2018 Ford Ranger", amount: 220000, status: "outbid", time: "1 day ago" },
  ],
  likedCarsList: [
    { id: "4", name: "2021 Hyundai Tucson", currentBid: 275000, image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=300" },
    { id: "5", name: "2019 Mazda CX-5", currentBid: 245000, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300" },
  ],
};

const Dashboard = () => {
  const stats = [
    { 
      label: "Wallet Balance", 
      value: `R${mockData.walletBalance.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-green-600",
      action: "Add Funds"
    },
    { 
      label: "Active Bids", 
      value: mockData.activeBids.toString(), 
      icon: Gavel, 
      color: "text-blue-600" 
    },
    { 
      label: "Liked Cars", 
      value: mockData.likedCars.toString(), 
      icon: Heart, 
      color: "text-red-500" 
    },
    { 
      label: "Won Auctions", 
      value: mockData.wonAuctions.toString(), 
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
                Welcome back! Here's your bidding overview.
              </p>
            </div>

            {/* Bidding Status Alert */}
            {!mockData.biddingActive && (
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
              {stats.map((stat, index) => (
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
                  <Link to="/my-bids" className="text-primary text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {mockData.recentBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{bid.car}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            R{bid.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">• {bid.time}</span>
                        </div>
                      </div>
                      <Badge 
                        className={
                          bid.status === "winning" 
                            ? "bg-green-500/20 text-green-700 border-green-500/50" 
                            : "bg-red-500/20 text-red-700 border-red-500/50"
                        }
                      >
                        {bid.status === "winning" ? (
                          <><TrendingUp className="w-3 h-3 mr-1" /> Winning</>
                        ) : (
                          "Outbid"
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liked Cars */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Liked Cars</h2>
                  <Link to="/my-likes" className="text-primary text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {mockData.likedCarsList.map((car) => (
                    <Link key={car.id} to={`/car/${car.id}`}>
                      <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{car.name}</p>
                          <p className="text-sm text-primary font-semibold">
                            R{car.currentBid.toLocaleString()}
                          </p>
                        </div>
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>
                    </Link>
                  ))}
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
