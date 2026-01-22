import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useAuctionEvents, AuctionEvent } from "@/hooks/useAuctionEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Car, Truck, Loader2, Settings, Radio, Package, ChevronRight } from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

interface UnassignedCategory {
  id: string;
  title: string;
  vehicleType: string;
  condition: string;
  count: number;
}

const AuctionEvents = () => {
  const { events, loading, error } = useAuctionEvents();
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [unassignedVehicles, setUnassignedVehicles] = useState<any[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(true);

  useEffect(() => {
    const fetchUnassigned = async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("id, vehicle_type, condition")
        .is("auction_event_id", null);
      
      setUnassignedVehicles(data || []);
      setLoadingUnassigned(false);
    };
    fetchUnassigned();
  }, []);

  const unassignedCategories = useMemo(() => {
    const categories: UnassignedCategory[] = [];
    const grouped: Record<string, Record<string, number>> = {};

    unassignedVehicles.forEach(v => {
      const type = v.vehicle_type || "car";
      const condition = v.condition || "fair";
      if (!grouped[type]) grouped[type] = {};
      if (!grouped[type][condition]) grouped[type][condition] = 0;
      grouped[type][condition]++;
    });

    Object.entries(grouped).forEach(([type, conditions]) => {
      Object.entries(conditions).forEach(([condition, count]) => {
        categories.push({
          id: `${type}-${condition}`,
          title: `Auction Ready - ${type.charAt(0).toUpperCase() + type.slice(1)}s (${condition.charAt(0).toUpperCase() + condition.slice(1)})`,
          vehicleType: type,
          condition,
          count,
        });
      });
    });

    return categories;
  }, [unassignedVehicles]);

  const upcomingEvents = events.filter(e => e.status === "upcoming" && !isPast(new Date(e.auction_date)));
  const liveEvents = events.filter(e => e.status === "live" || isToday(new Date(e.auction_date)));
  const pastEvents = events.filter(e => e.status === "completed" || (isPast(new Date(e.auction_date)) && !isToday(new Date(e.auction_date))));

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

  const UnassignedCard = ({ category }: { category: UnassignedCategory }) => (
    <Link to={`/auctions?type=${category.vehicleType}&condition=${category.condition}&unassigned=true`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50 bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold">{category.title}</CardTitle>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <Package className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            {category.vehicleType === "car" ? <Car className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            <span className="text-sm">{category.count} vehicles awaiting auction assignment</span>
          </div>
          <div className="flex items-center text-primary text-sm font-medium">
            View Vehicles <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (loading || loadingUnassigned) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12 text-destructive">
          <p>Failed to load auction events.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Auction Events | AutoBid</title>
        <meta name="description" content="Browse upcoming and live auction events. Find cars and taxis at great prices." />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Auction <span className="text-primary">Events</span>
              </h1>
              <p className="text-muted-foreground">
                Browse scheduled auction events and auction-ready vehicles.
              </p>
            </div>
            {isAdmin && (
              <Link to="/admin/auction-events">
                <Button className="mt-4 md:mt-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
              </Link>
            )}
          </div>

          {/* Live Auctions Banner */}
          {liveEvents.length > 0 && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-5 h-5 text-destructive animate-pulse" />
                <h2 className="text-lg font-semibold text-destructive">Live Now</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Auction Ready Section */}
          {unassignedCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-warning" />
                Auction Ready
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Vehicles ready to be assigned to an upcoming auction event.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {unassignedCategories.map(cat => (
                  <UnassignedCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="live">Live ({liveEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming auction events.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="live">
              {liveEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No live auctions at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {liveEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No past auction events.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionEvents;
