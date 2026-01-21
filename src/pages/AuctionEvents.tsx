import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useAuctionEvents, AuctionEvent } from "@/hooks/useAuctionEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Car, Truck, Loader2, Plus } from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

const AuctionEvents = () => {
  const { events, loading, error } = useAuctionEvents();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingEvents = events.filter(e => e.status === "upcoming" || isFuture(new Date(e.auction_date)));
  const liveEvents = events.filter(e => e.status === "live" || isToday(new Date(e.auction_date)));
  const pastEvents = events.filter(e => e.status === "completed" || isPast(new Date(e.auction_date)));

  const getStatusBadge = (event: AuctionEvent) => {
    if (event.status === "live" || isToday(new Date(event.auction_date))) {
      return <Badge className="bg-destructive animate-pulse">LIVE NOW</Badge>;
    }
    if (event.status === "completed" || isPast(new Date(event.auction_date))) {
      return <Badge variant="secondary">Completed</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getVehicleTypeIcons = (types: string[]) => {
    return (
      <div className="flex gap-2">
        {types.includes("car") && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>Cars</span>
          </div>
        )}
        {types.includes("taxi") && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span>Taxis</span>
          </div>
        )}
      </div>
    );
  };

  const EventCard = ({ event }: { event: AuctionEvent }) => (
    <Link to={`/auction-event/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            {getStatusBadge(event)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "h:mm a")}</span>
            </div>
            {getVehicleTypeIcons(event.vehicle_types)}
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Auction Events | AutoBid</title>
        <meta name="description" content="Browse upcoming and live vehicle auctions" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Auction Events</h1>
            <p className="text-muted-foreground mt-2">
              Browse upcoming auctions and place pre-bids on vehicles
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/auction-events">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <div className="text-center py-8 text-destructive">
            Error loading events: {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live ({liveEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming auctions scheduled
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live">
            {liveEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No live auctions at the moment
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No past auctions
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AuctionEvents;
