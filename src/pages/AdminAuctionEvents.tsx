import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useAuctionEvents, AuctionEvent } from "@/hooks/useAuctionEvents";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Play, Square, Car } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  auction_event_id: string | null;
  lot_number: number | null;
  asking_bid: number;
  image: string;
}

const AdminAuctionEvents = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent, refetch } = useAuctionEvents();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuctionEvent | null>(null);
  const [unassignedVehicles, setUnassignedVehicles] = useState<Vehicle[]>([]);
  const [eventVehicles, setEventVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    auction_date: "",
    vehicle_types: ["car", "taxi"] as string[],
  });

  if (roleLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleCreateEvent = async () => {
    try {
      await createEvent({
        title: formData.title,
        description: formData.description || null,
        auction_date: new Date(formData.auction_date).toISOString(),
        vehicle_types: formData.vehicle_types,
        status: "upcoming",
      });
      toast({ title: "Event created successfully" });
      setShowCreateDialog(false);
      setFormData({ title: "", description: "", auction_date: "", vehicle_types: ["car", "taxi"] });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      toast({ title: "Event deleted" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleStartEvent = async (event: AuctionEvent) => {
    try {
      await updateEvent(event.id, { status: "live" });
      toast({ title: "Event is now LIVE" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEndEvent = async (event: AuctionEvent) => {
    try {
      await updateEvent(event.id, { status: "completed" });
      toast({ title: "Event ended" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openAssignDialog = async (event: AuctionEvent) => {
    setSelectedEvent(event);
    setLoadingVehicles(true);
    setShowAssignDialog(true);

    try {
      // Fetch unassigned vehicles
      const { data: unassigned } = await supabase
        .from("vehicles")
        .select("*")
        .is("auction_event_id", null)
        .in("vehicle_type", event.vehicle_types);

      // Fetch vehicles assigned to this event
      const { data: assigned } = await supabase
        .from("vehicles")
        .select("*")
        .eq("auction_event_id", event.id)
        .order("lot_number", { ascending: true });

      setUnassignedVehicles(unassigned || []);
      setEventVehicles(assigned || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const assignVehicle = async (vehicleId: string, lotNumber: number, askingBid: number) => {
    if (!selectedEvent) return;

    try {
      await supabase
        .from("vehicles")
        .update({
          auction_event_id: selectedEvent.id,
          lot_number: lotNumber,
          asking_bid: askingBid,
          auction_phase: "pre_bidding",
        })
        .eq("id", vehicleId);

      toast({ title: "Vehicle assigned" });
      openAssignDialog(selectedEvent);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const unassignVehicle = async (vehicleId: string) => {
    try {
      await supabase
        .from("vehicles")
        .update({
          auction_event_id: null,
          lot_number: null,
          asking_bid: 0,
          auction_phase: "pending",
        })
        .eq("id", vehicleId);

      if (selectedEvent) {
        openAssignDialog(selectedEvent);
      }
      toast({ title: "Vehicle removed from event" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Manage Auction Events | Admin</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Auction Events</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Auction Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Weekly Car Auction"
                  />
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.auction_date}
                    onChange={(e) => setFormData({ ...formData, auction_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                  />
                </div>
                <div>
                  <Label>Vehicle Types</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.vehicle_types.includes("car")}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            vehicle_types: checked
                              ? [...formData.vehicle_types, "car"]
                              : formData.vehicle_types.filter((t) => t !== "car"),
                          });
                        }}
                      />
                      Cars
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.vehicle_types.includes("taxi")}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            vehicle_types: checked
                              ? [...formData.vehicle_types, "taxi"]
                              : formData.vehicle_types.filter((t) => t !== "taxi"),
                          });
                        }}
                      />
                      Taxis
                    </label>
                  </div>
                </div>
                <Button onClick={handleCreateEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {event.title}
                      {event.status === "live" && (
                        <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                      )}
                      {event.status === "completed" && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(event.auction_date), "PPP 'at' p")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {event.status === "upcoming" && (
                      <Button size="sm" onClick={() => handleStartEvent(event)}>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {event.status === "live" && (
                      <Button size="sm" variant="destructive" onClick={() => handleEndEvent(event)}>
                        <Square className="w-4 h-4 mr-1" />
                        End
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openAssignDialog(event)}>
                      <Car className="w-4 h-4 mr-1" />
                      Vehicles
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {event.vehicle_types.map((type) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No auction events yet. Create your first one!
            </div>
          )}
        </div>
      </div>

      {/* Assign Vehicles Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Vehicles to {selectedEvent?.title}</DialogTitle>
          </DialogHeader>

          {loadingVehicles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">
                  Assigned Vehicles ({eventVehicles.length})
                </h3>
                {eventVehicles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No vehicles assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {eventVehicles.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image}
                            alt=""
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">
                              Lot #{v.lot_number}: {v.year} {v.make} {v.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Asking: R{v.asking_bid?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => unassignVehicle(v.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">
                  Available Vehicles ({unassignedVehicles.length})
                </h3>
                {unassignedVehicles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No unassigned vehicles available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unassignedVehicles.map((v) => (
                      <VehicleAssignRow
                        key={v.id}
                        vehicle={v}
                        nextLotNumber={eventVehicles.length + 1}
                        onAssign={assignVehicle}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Sub-component for assigning a vehicle
const VehicleAssignRow = ({
  vehicle,
  nextLotNumber,
  onAssign,
}: {
  vehicle: Vehicle;
  nextLotNumber: number;
  onAssign: (id: string, lot: number, asking: number) => void;
}) => {
  const [lotNumber, setLotNumber] = useState(nextLotNumber.toString());
  const [askingBid, setAskingBid] = useState("");

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <img src={vehicle.image} alt="" className="w-16 h-12 object-cover rounded" />
      <div className="flex-1">
        <p className="font-medium">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        <Badge variant="outline" className="text-xs">
          {vehicle.vehicle_type}
        </Badge>
      </div>
      <Input
        type="number"
        placeholder="Lot #"
        value={lotNumber}
        onChange={(e) => setLotNumber(e.target.value)}
        className="w-20"
      />
      <Input
        type="number"
        placeholder="Asking bid"
        value={askingBid}
        onChange={(e) => setAskingBid(e.target.value)}
        className="w-32"
      />
      <Button
        size="sm"
        onClick={() => onAssign(vehicle.id, parseInt(lotNumber), parseFloat(askingBid) || 0)}
        disabled={!lotNumber || !askingBid}
      >
        Assign
      </Button>
    </div>
  );
};

export default AdminAuctionEvents;
