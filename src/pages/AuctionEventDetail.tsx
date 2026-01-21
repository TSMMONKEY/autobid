import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useEventVehicles, AuctionEvent } from "@/hooks/useAuctionEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, ArrowLeft, Eye } from "lucide-react";
import { format, isFuture, isPast, isToday } from "date-fns";
import PreBidDialog from "@/components/PreBidDialog";
import LiveAuctionModal from "@/components/LiveAuctionModal";
import { useAuth } from "@/hooks/useAuth";

const AuctionEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<AuctionEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const { vehicles, loading: vehiclesLoading } = useEventVehicles(id);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("auction_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchEvent();

    // Subscribe to event changes
    const channel = supabase
      .channel(`event-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_events", filter: `id=eq.${id}` },
        (payload: any) => {
          if (payload.new) {
            setEvent(payload.new as AuctionEvent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const isUpcoming = event && isFuture(new Date(event.auction_date));
  const isLive = event && (event.status === "live" || isToday(new Date(event.auction_date)));
  const isPastEvent = event && isPast(new Date(event.auction_date)) && !isToday(new Date(event.auction_date));

  const currentLotVehicle = vehicles.find(v => v.auction_phase === "bidding" || v.auction_phase === "going_once" || v.auction_phase === "going_twice" || v.auction_phase === "final_call");

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "pending": return "Pending";
      case "pre_bidding": return "Pre-Bidding Open";
      case "bidding": return "Now Auctioning";
      case "going_once": return "Going Once!";
      case "going_twice": return "Going Twice!";
      case "final_call": return "Final Call!";
      case "sold": return "SOLD";
      case "unsold": return "Unsold";
      default: return phase;
    }
  };

  const getPhaseBadgeVariant = (phase: string) => {
    switch (phase) {
      case "bidding":
      case "going_once":
      case "going_twice":
      case "final_call":
        return "destructive";
      case "sold":
        return "default";
      case "unsold":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link to="/auction-events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{event.title} | AutoBid</title>
        <meta name="description" content={event.description || `Auction event on ${format(new Date(event.auction_date), "MMMM d, yyyy")}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Link to="/auction-events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            {isLive && <Badge className="bg-red-500 animate-pulse">LIVE NOW</Badge>}
            {isPastEvent && <Badge variant="secondary">Completed</Badge>}
            {isUpcoming && <Badge variant="outline">Upcoming</Badge>}
          </div>

          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "h:mm a")}</span>
            </div>
          </div>

          {event.description && (
            <p className="mt-4 text-muted-foreground">{event.description}</p>
          )}
        </div>

        {/* Live Auction Banner */}
        {isLive && currentLotVehicle && (
          <Card className="mb-8 border-destructive bg-destructive/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-destructive font-semibold mb-1">NOW AUCTIONING</p>
                  <h3 className="text-xl font-bold">
                    Lot #{currentLotVehicle.lot_number}: {currentLotVehicle.year} {currentLotVehicle.make} {currentLotVehicle.model}
                  </h3>
                  <p className="text-lg mt-2">
                    Current Bid: <span className="font-bold text-primary">R{currentLotVehicle.current_bid.toLocaleString()}</span>
                  </p>
                </div>
                <Button size="lg" onClick={() => setShowLiveModal(true)}>
                  Join Auction
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-semibold mb-6">
          Vehicles ({vehicles.length})
        </h2>

        {vehiclesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No vehicles assigned to this auction yet
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      Lot #{vehicle.lot_number || "TBD"}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={getPhaseBadgeVariant(vehicle.auction_phase)}>
                      {getPhaseLabel(vehicle.auction_phase)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {vehicle.mileage.toLocaleString()} km • {vehicle.transmission}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Asking Bid</p>
                      <p className="font-bold text-primary">R{vehicle.asking_bid?.toLocaleString() || "0"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Current Bid</p>
                      <p className="font-bold">R{vehicle.current_bid.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/car/${vehicle.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {isUpcoming && isAuthenticated && (
                      <PreBidDialog
                        vehicleId={vehicle.id}
                        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        askingBid={vehicle.asking_bid || 0}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Live Auction Modal */}
      {showLiveModal && currentLotVehicle && (
        <LiveAuctionModal
          vehicle={currentLotVehicle}
          onClose={() => setShowLiveModal(false)}
        />
      )}
    </Layout>
  );
};

export default AuctionEventDetail;
