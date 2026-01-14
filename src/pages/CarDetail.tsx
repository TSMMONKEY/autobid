import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin, Gauge, Key, Zap, AlertTriangle, Radio, Users, Pencil } from "lucide-react";
import { useRealtimeVehicle } from "@/hooks/useRealtimeVehicle";
import { useBids } from "@/hooks/useBids";
import { useUserRole } from "@/hooks/useUserRole";
import LiveBidForm from "@/components/LiveBidForm";
import BidHistory from "@/components/BidHistory";
import WatchlistButton from "@/components/WatchlistButton";
import CountdownTimer from "@/components/CountdownTimer";
import Layout from "@/components/Layout";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { car, loading, error } = useRealtimeVehicle(id);
  const { bids } = useBids(id);
  const { isAdmin } = useUserRole();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The car you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate("/auctions")}>
            Back to Auctions
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to results
          </Button>
          {isAdmin && (
            <Link to={`/admin/edit-vehicle/${car.id}`}>
              <Button variant="outline">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Vehicle
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-muted rounded-xl overflow-hidden aspect-video">
              {car.isLive && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">
                <WatchlistButton vehicleId={car.id} />
              </div>
              <img
                src={car.image}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            
            {/* Additional images */}
            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.slice(0, 4).map((img, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${car.year} ${car.make} ${car.model} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Bid History ({bids.length} bids)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BidHistory vehicleId={car.id} />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {car.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {car.year} {car.make} {car.model}
                  </h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{car.location}</span>
                  </div>
                </div>
                <Badge variant={car.isLive ? "destructive" : "secondary"}>
                  {car.isLive ? "Live" : "Ended"}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Badge variant="outline" className="capitalize">
                  {car.condition}
                </Badge>
                {car.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
            </div>

            {/* Live Auction Card */}
            <Card className={car.isLive ? "border-destructive/50 bg-destructive/5" : ""}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  {car.isLive && <Radio className="w-5 h-5 text-destructive animate-pulse" />}
                  Live Auction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-3xl font-bold text-primary">
                      R{car.currentBid.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Count</p>
                    <p className="text-xl font-semibold">{car.bidCount} bids</p>
                  </div>
                </div>

                {car.isLive && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">Time Remaining</p>
                    <CountdownTimer endTime={car.endTime} variant="large" />
                  </div>
                )}

                <div className="pt-2">
                  <LiveBidForm
                    vehicleId={car.id}
                    currentBid={car.currentBid}
                    isLive={car.isLive}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Make</p>
                    <p>{car.make}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p>{car.model}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p>{car.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <div className="flex items-center">
                      <Gauge className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span>{car.mileage.toLocaleString()} km</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p>{car.transmission}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-mono text-xs">{car.vin}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Exterior</p>
                    <p>{car.exterior}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Interior</p>
                    <p>{car.interior}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-2 space-y-2 border-t">
                  <div className="flex items-center pt-2">
                    <Key className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{car.hasKey ? "Key Available" : "No Key"}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{car.engineStarts ? "Engine Starts" : "Engine Doesn't Start"}</span>
                  </div>
                  {car.primaryDamage && car.primaryDamage !== 'None' && (
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>Primary Damage: {car.primaryDamage}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Watchlist Button */}
            <WatchlistButton vehicleId={car.id} variant="full" className="w-full" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarDetail;
