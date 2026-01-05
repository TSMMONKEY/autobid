import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CountdownTimer from "@/components/CountdownTimer";
import { getCarById } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Gauge,
  Calendar,
  Fuel,
  Settings,
  Palette,
  Hash,
  Radio,
  Heart,
  Share2,
  Gavel,
  AlertTriangle,
} from "lucide-react";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const car = getCarById(id || "");
  const [bidAmount, setBidAmount] = useState("");

  if (!car) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Car Not Found
            </h1>
            <Button variant="green" onClick={() => navigate("/auctions")}>
              Browse All Auctions
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-ZA").format(mileage);
  };

  const handlePlaceBid = () => {
    const bid = parseFloat(bidAmount.replace(/[^0-9.]/g, ""));
    if (bid && bid > car.currentBid) {
      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of ${formatPrice(bid)} has been recorded.`,
      });
      setBidAmount("");
    } else {
      toast({
        title: "Invalid Bid",
        description: "Your bid must be higher than the current bid.",
        variant: "destructive",
      });
    }
  };

  const minNextBid = car.currentBid + 500;
  const isCrashed = car.condition === "crashed" || car.condition === "salvage";

  const getConditionColor = () => {
    switch (car.condition) {
      case "excellent":
        return "bg-green-500/20 text-green-700 border-green-500/50";
      case "good":
        return "bg-blue-500/20 text-blue-700 border-blue-500/50";
      case "fair":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/50";
      case "crashed":
        return "bg-orange-500/20 text-orange-700 border-orange-500/50";
      case "salvage":
        return "bg-red-500/20 text-red-700 border-red-500/50";
    }
  };

  const specs = [
    { icon: Calendar, label: "Year", value: car.year.toString() },
    { icon: Gauge, label: "Mileage", value: `${formatMileage(car.mileage)} km` },
    { icon: Settings, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Engine", value: car.engine },
    { icon: Palette, label: "Exterior", value: car.exterior },
    { icon: Palette, label: "Interior", value: car.interior },
    { icon: MapPin, label: "Location", value: car.location },
    { icon: Hash, label: "VIN", value: car.vin },
  ];

  return (
    <>
      <Helmet>
        <title>{`${car.year} ${car.make} ${car.model} | AutoBid SA Auction`}</title>
        <meta
          name="description"
          content={`Bid on this ${car.year} ${car.make} ${car.model}. ${car.description}`}
        />
      </Helmet>
      <Layout>
        <div className="pt-20 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Auctions
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image */}
                <div className="relative rounded-xl overflow-hidden shadow-card">
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full aspect-[16/10] object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {car.isLive && (
                      <Badge className="bg-destructive text-destructive-foreground">
                        <Radio className="w-3 h-3 mr-1 animate-pulse" />
                        LIVE
                      </Badge>
                    )}
                    {isCrashed && (
                      <Badge className="bg-orange-500 text-white">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {car.condition.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {car.year} {car.make} {car.model}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {car.location}
                      </p>
                      <span className={`px-3 py-1 rounded-full border text-sm capitalize ${getConditionColor()}`}>
                        {car.condition}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Condition Warning */}
                {isCrashed && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-700 mb-1">
                        {car.condition === "crashed" ? "Accident Damaged Vehicle" : "Salvage Title Vehicle"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This vehicle has been in an accident and may require significant repairs. 
                        Sold as-is. Inspection recommended before bidding.
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {car.description}
                  </p>
                </div>

                {/* Specifications */}
                <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Specifications
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <spec.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {spec.label}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {spec.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Bidding */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-xl p-6 border border-border shadow-card">
                  {/* Current Bid */}
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">
                      Current Bid
                    </p>
                    <p className="font-display text-3xl font-bold text-primary">
                      {formatPrice(car.currentBid)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {car.bidCount} bids placed
                    </p>
                  </div>

                  {/* Time Remaining */}
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Time Remaining
                    </p>
                    <CountdownTimer endTime={car.endTime} variant="large" />
                  </div>

                  {/* Place Bid */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Your Bid (min. {formatPrice(minNextBid)})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R
                        </span>
                        <Input
                          type="text"
                          placeholder={minNextBid.toLocaleString()}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="pl-8 h-12 text-lg"
                        />
                      </div>
                    </div>
                    <Button
                      variant="green"
                      size="lg"
                      className="w-full"
                      onClick={handlePlaceBid}
                    >
                      <Gavel className="w-5 h-5" />
                      Place Bid
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By placing a bid, you agree to our Terms of Service
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CarDetail;