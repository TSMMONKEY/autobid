import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuctionEvents, AuctionEvent } from "@/hooks/useAuctionEvents";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Car, 
  Truck, 
  Settings, 
  Loader2, 
  ChevronRight,
  Radio
} from "lucide-react";
import { format, isPast, isToday, isFuture } from "date-fns";

const Auctions = () => {
  const { events, loading, error } = useAuctionEvents();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState("upcoming");

  const categorizedEvents = useMemo(() => {
    const now = new Date();
    
    const live = events.filter(e => e.status === 'live');
    const upcoming = events.filter(e => {
      const eventDate = new Date(e.auction_date);
      return e.status === 'upcoming' && (isFuture(eventDate) || isToday(eventDate));
    });
    const past = events.filter(e => {
      const eventDate = new Date(e.auction_date);
      return e.status === 'completed' || (e.status !== 'live' && isPast(eventDate) && !isToday(eventDate));
    });

    return { live, upcoming, past };
  }, [events]);

  const getStatusBadge = (event: AuctionEvent) => {
    if (event.status === 'live') {
      return (
        <Badge className="bg-red-500 text-white animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          LIVE
        </Badge>
      );
    }
    if (event.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    }
    const eventDate = new Date(event.auction_date);
    if (isToday(eventDate)) {
      return <Badge className="bg-orange-500 text-white">Today</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getVehicleTypeIcons = (types: string[]) => {
    return (
      <div className="flex items-center gap-2">
        {types.includes('car') && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Car className="w-4 h-4" />
            <span className="text-xs">Cars</span>
          </div>
        )}
        {types.includes('taxi') && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span className="text-xs">Taxis</span>
          </div>
        )}
      </div>
    );
  };

  const EventCard = ({ event }: { event: AuctionEvent }) => (
    <Link to={`/auction-event/${event.id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
            {getStatusBadge(event)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(event.auction_date), "h:mm a")}</span>
            </div>
          </div>
          
          {getVehicleTypeIcons(event.vehicle_types)}
          
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center text-primary text-sm font-medium">
            View Auction <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12 text-destructive">
          <p>Failed to load auctions. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Auctions | AutoBid</title>
        <meta
          name="description"
          content="Browse upcoming and live vehicle auctions. Find cars and taxis at great prices."
        />
      </Helmet>
      
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Vehicle <span className="text-primary">Auctions</span>
              </h1>
              <p className="text-muted-foreground">
                Browse upcoming and live auctions. Find your next vehicle at a great price.
              </p>
            </div>
            {isAdmin && (
              <Link to="/admin/auction-events">
                <Button className="mt-4 md:mt-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Auctions
                </Button>
              </Link>
            )}
          </div>

          {/* Live Auctions Banner */}
          {categorizedEvents.live.length > 0 && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-red-600">Live Now</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedEvents.live.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Tabs for Upcoming and Past */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({categorizedEvents.upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({categorizedEvents.past.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {categorizedEvents.upcoming.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming auctions scheduled.</p>
                  <p className="text-sm mt-2">Check back soon for new auction events!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedEvents.upcoming.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {categorizedEvents.past.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No past auctions yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedEvents.past.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Auctions;
