import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Play,
  Square,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Radio,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  auction_status: string;
  is_live: boolean;
  current_bid: number;
  bid_count: number;
  end_time: string;
  auction_duration_minutes: number | null;
}

interface QueueItem {
  id: string;
  vehicle_id: string;
  position: number;
  scheduled_time: string | null;
  vehicle?: Vehicle;
}

const AuctionQueueAdmin = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [auctionDuration, setAuctionDuration] = useState<number>(5);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast.error("Admin access required");
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all vehicles
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (vehicleError) throw vehicleError;
      setVehicles(vehicleData || []);

      // Fetch queue with vehicle info
      const { data: queueData, error: queueError } = await supabase
        .from("auction_queue")
        .select("*")
        .order("position", { ascending: true });

      if (queueError) throw queueError;

      // Attach vehicle info to queue items
      const queueWithVehicles = (queueData || []).map((q) => ({
        ...q,
        vehicle: (vehicleData || []).find((v) => v.id === q.vehicle_id),
      }));
      setQueue(queueWithVehicles);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load auction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();

      // Subscribe to realtime updates
      const vehicleChannel = supabase
        .channel("admin-vehicles")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicles" },
          () => fetchData()
        )
        .subscribe();

      const queueChannel = supabase
        .channel("admin-queue")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "auction_queue" },
          () => fetchData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(vehicleChannel);
        supabase.removeChannel(queueChannel);
      };
    }
  }, [isAdmin]);

  const addToQueue = async () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    try {
      setProcessing("add");
      const maxPosition = queue.length > 0 ? Math.max(...queue.map((q) => q.position)) : 0;

      const { error } = await supabase.from("auction_queue").insert({
        vehicle_id: selectedVehicle,
        position: maxPosition + 1,
      });

      if (error) throw error;
      
      // Update vehicle duration
      await supabase
        .from("vehicles")
        .update({ auction_duration_minutes: auctionDuration })
        .eq("id", selectedVehicle);

      toast.success("Vehicle added to queue");
      setSelectedVehicle("");
      fetchData();
    } catch (error: any) {
      console.error("Error adding to queue:", error);
      toast.error(error.message || "Failed to add to queue");
    } finally {
      setProcessing(null);
    }
  };

  const removeFromQueue = async (queueId: string) => {
    try {
      setProcessing(queueId);
      const { error } = await supabase
        .from("auction_queue")
        .delete()
        .eq("id", queueId);

      if (error) throw error;
      toast.success("Removed from queue");
      fetchData();
    } catch (error) {
      console.error("Error removing from queue:", error);
      toast.error("Failed to remove from queue");
    } finally {
      setProcessing(null);
    }
  };

  const moveInQueue = async (queueId: string, direction: "up" | "down") => {
    const currentIndex = queue.findIndex((q) => q.id === queueId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === queue.length - 1)
    ) {
      return;
    }

    try {
      setProcessing(queueId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const currentItem = queue[currentIndex];
      const targetItem = queue[targetIndex];

      // Swap positions
      await supabase
        .from("auction_queue")
        .update({ position: targetItem.position })
        .eq("id", currentItem.id);

      await supabase
        .from("auction_queue")
        .update({ position: currentItem.position })
        .eq("id", targetItem.id);

      fetchData();
    } catch (error) {
      console.error("Error moving in queue:", error);
      toast.error("Failed to reorder queue");
    } finally {
      setProcessing(null);
    }
  };

  const startAuction = async (vehicleId: string, durationMinutes: number = 5) => {
    try {
      setProcessing(vehicleId);
      const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);

      const { error } = await supabase
        .from("vehicles")
        .update({
          is_live: true,
          auction_status: "live",
          end_time: endTime.toISOString(),
          auction_duration_minutes: durationMinutes,
        })
        .eq("id", vehicleId);

      if (error) throw error;
      toast.success("Auction started!");
      fetchData();
    } catch (error) {
      console.error("Error starting auction:", error);
      toast.error("Failed to start auction");
    } finally {
      setProcessing(null);
    }
  };

  const stopAuction = async (vehicleId: string) => {
    try {
      setProcessing(vehicleId);

      // Call end_auction function
      const { error } = await supabase.rpc("end_auction", {
        vehicle_uuid: vehicleId,
      });

      if (error) throw error;

      // Remove from queue
      await supabase.from("auction_queue").delete().eq("vehicle_id", vehicleId);

      toast.success("Auction ended");
      fetchData();
    } catch (error) {
      console.error("Error stopping auction:", error);
      toast.error("Failed to stop auction");
    } finally {
      setProcessing(null);
    }
  };

  const startNextInQueue = async () => {
    const nextItem = queue.find((q) => {
      const vehicle = vehicles.find((v) => v.id === q.vehicle_id);
      return vehicle && !vehicle.is_live && vehicle.auction_status === "pending";
    });

    if (!nextItem) {
      toast.error("No pending vehicles in queue");
      return;
    }

    const vehicle = vehicles.find((v) => v.id === nextItem.vehicle_id);
    await startAuction(nextItem.vehicle_id, vehicle?.auction_duration_minutes || 5);
  };

  const getStatusBadge = (status: string, isLive: boolean) => {
    if (isLive) {
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          <Radio className="w-3 h-3 mr-1 animate-pulse" />
          LIVE
        </Badge>
      );
    }
    switch (status) {
      case "sold":
        return <Badge className="bg-green-500">Sold</Badge>;
      case "unsold":
        return <Badge variant="secondary">Unsold</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingVehicles = vehicles.filter(
    (v) =>
      v.auction_status === "pending" &&
      !queue.some((q) => q.vehicle_id === v.id)
  );

  const liveVehicle = vehicles.find((v) => v.is_live);

  if (roleLoading || loading) {
    return (
      <Layout>
        <div className="pt-28 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Auction Queue Management | Admin</title>
      </Helmet>
      <Layout>
        <div className="pt-28 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl font-bold text-foreground mb-8">
              Auction Queue Management
            </h1>

            {/* Current Live Auction */}
            {liveVehicle && (
              <div className="mb-8 p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Radio className="w-6 h-6 text-destructive animate-pulse" />
                    <div>
                      <h2 className="font-semibold text-lg">Currently Live</h2>
                      <p className="text-muted-foreground">
                        {liveVehicle.year} {liveVehicle.make} {liveVehicle.model}
                      </p>
                      <p className="text-sm">
                        Current Bid: R{liveVehicle.current_bid.toLocaleString()} •{" "}
                        {liveVehicle.bid_count} bids
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => stopAuction(liveVehicle.id)}
                    disabled={processing === liveVehicle.id}
                  >
                    {processing === liveVehicle.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    End Auction
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Queue */}
            <div className="mb-8 p-6 bg-card border rounded-lg">
              <h2 className="font-semibold text-lg mb-4">Add to Queue</h2>
              <div className="flex gap-4 flex-wrap">
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingVehicles.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No pending vehicles available
                      </SelectItem>
                    ) : (
                      pendingVehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(parseInt(e.target.value) || 5)}
                    className="w-20"
                    min={1}
                    max={60}
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <Button
                  onClick={addToQueue}
                  disabled={!selectedVehicle || processing === "add"}
                >
                  {processing === "add" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add to Queue
                </Button>
              </div>
            </div>

            {/* Queue */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Auction Queue</h2>
                {!liveVehicle && queue.length > 0 && (
                  <Button onClick={startNextInQueue}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Next Auction
                  </Button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-8 bg-card border rounded-lg">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Queue is empty</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Position</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-bold">{item.position}</TableCell>
                        <TableCell>
                          {item.vehicle
                            ? `${item.vehicle.year} ${item.vehicle.make} ${item.vehicle.model}`
                            : "Unknown"}
                        </TableCell>
                        <TableCell>
                          {item.vehicle?.auction_duration_minutes || 5} min
                        </TableCell>
                        <TableCell>
                          {item.vehicle &&
                            getStatusBadge(
                              item.vehicle.auction_status,
                              item.vehicle.is_live
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => moveInQueue(item.id, "up")}
                              disabled={index === 0 || processing === item.id}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => moveInQueue(item.id, "down")}
                              disabled={
                                index === queue.length - 1 || processing === item.id
                              }
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            {item.vehicle && !item.vehicle.is_live && (
                              <Button
                                variant="default"
                                size="icon"
                                onClick={() =>
                                  startAuction(
                                    item.vehicle_id,
                                    item.vehicle?.auction_duration_minutes || 5
                                  )
                                }
                                disabled={!!liveVehicle || processing === item.vehicle_id}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeFromQueue(item.id)}
                              disabled={processing === item.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* All Vehicles */}
            <div>
              <h2 className="font-semibold text-lg mb-4">All Vehicles</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Bids</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>R{vehicle.current_bid.toLocaleString()}</TableCell>
                      <TableCell>{vehicle.bid_count}</TableCell>
                      <TableCell>
                        {getStatusBadge(vehicle.auction_status, vehicle.is_live)}
                      </TableCell>
                      <TableCell className="text-right">
                        {vehicle.is_live ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => stopAuction(vehicle.id)}
                            disabled={processing === vehicle.id}
                          >
                            {processing === vehicle.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "End"
                            )}
                          </Button>
                        ) : vehicle.auction_status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              startAuction(vehicle.id, vehicle.auction_duration_minutes || 5)
                            }
                            disabled={!!liveVehicle || processing === vehicle.id}
                          >
                            {processing === vehicle.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Start"
                            )}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AuctionQueueAdmin;
