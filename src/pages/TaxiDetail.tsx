import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Users,
  AlertTriangle,
  FileCheck,
  Clock,
  Gavel
} from "lucide-react";
import { getTaxiById } from "@/data/taxis";
import CountdownTimer from "@/components/CountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const TaxiDetail = () => {
  const { id } = useParams<{ id: string }>();
  const taxi = getTaxiById(id || "");
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");

  if (!taxi) {
    return (
      <Layout>
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Taxi Not Found</h1>
          <Link to="/taxis" className="text-primary hover:underline mt-4 inline-block">
            Back to Taxis
          </Link>
        </div>
      </Layout>
    );
  }

  const handleBid = () => {
    const amount = parseInt(bidAmount.replace(/\D/g, ""));
    if (amount <= taxi.currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Your bid must be higher than R ${taxi.currentBid.toLocaleString("en-ZA")}`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Bid Placed Successfully!",
      description: `You bid R ${amount.toLocaleString("en-ZA")} on this ${taxi.make} ${taxi.model}`,
    });
    setBidAmount("");
  };

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      excellent: "bg-green-500/20 text-green-700 border-green-500/30",
      good: "bg-blue-500/20 text-blue-700 border-blue-500/30",
      fair: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      crashed: "bg-orange-500/20 text-orange-700 border-orange-500/30",
      salvage: "bg-red-500/20 text-red-700 border-red-500/30",
    };
    return styles[condition] || "";
  };

  const isCrashed = taxi.condition === "crashed" || taxi.condition === "salvage";

  return (
    <Layout>
      <Helmet>
        <title>{taxi.year} {taxi.make} {taxi.model} | AutoBid SA Taxi Auction</title>
        <meta name="description" content={`Bid on this ${taxi.year} ${taxi.make} ${taxi.model} ${taxi.seatingCapacity}-seater taxi. ${taxi.condition} condition. Located in ${taxi.location}.`} />
      </Helmet>

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/taxis"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Taxis
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-card border border-border">
                <img
                  src={taxi.image}
                  alt={`${taxi.year} ${taxi.make} ${taxi.model}`}
                  className="w-full aspect-[4/3] object-cover"
                />
                {taxi.isLive && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      LIVE AUCTION
                    </Badge>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={getConditionBadge(taxi.condition)}>
                    {isCrashed && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {taxi.condition}
                  </Badge>
                  {taxi.operatingLicense && (
                    <Badge className="bg-primary/90 text-primary-foreground">
                      <FileCheck className="w-3 h-3 mr-1" />
                      Licensed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Warning for damaged vehicles */}
              {isCrashed && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-700">Damaged Vehicle</h4>
                      <p className="text-sm text-orange-600 mt-1">
                        This taxi has been in an accident. Please inspect carefully before bidding. 
                        Sold as-is with no warranty.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {taxi.year} {taxi.make} {taxi.model}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {taxi.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {taxi.seatingCapacity} Seater
                  </span>
                </div>
              </div>

              {/* Bidding Card */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-3xl font-bold text-primary">
                      R {taxi.currentBid.toLocaleString("en-ZA")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-4 h-4" />
                      Time Left
                    </p>
                    <CountdownTimer endTime={taxi.endTime} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Gavel className="w-4 h-4" />
                  <span>{taxi.bidCount} bids placed</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={`Min: R ${(taxi.currentBid + 1000).toLocaleString("en-ZA")}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="green" onClick={handleBid}>
                    Place Bid
                  </Button>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <h3 className="font-display font-bold text-foreground mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="font-medium text-foreground">{taxi.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="font-medium text-foreground">{taxi.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Engine</p>
                      <p className="font-medium text-foreground">{taxi.engine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Transmission</p>
                      <p className="font-medium text-foreground">{taxi.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="font-medium text-foreground">{taxi.seatingCapacity} Passengers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">License</p>
                      <p className="font-medium text-foreground">{taxi.operatingLicense ? "Included" : "Not Included"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                <h3 className="font-display font-bold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground">{taxi.description}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>VIN:</strong> {taxi.vin}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaxiDetail;