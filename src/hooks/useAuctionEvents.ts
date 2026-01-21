import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuctionEvent {
  id: string;
  title: string;
  description: string | null;
  auction_date: string;
  vehicle_types: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuctionVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  current_bid: number;
  asking_bid: number;
  image: string;
  images: string[];
  mileage: number;
  location: string;
  transmission: string;
  lot_number: number | null;
  auction_phase: string;
  auction_event_id: string | null;
  vehicle_type: string;
  is_live: boolean;
  bid_count: number;
  end_time: string;
}

export const useAuctionEvents = () => {
  const [events, setEvents] = useState<AuctionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("auction_events")
        .select("*")
        .order("auction_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching auction events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("auction-events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_events" },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const createEvent = async (event: Omit<AuctionEvent, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("auction_events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateEvent = async (id: string, updates: Partial<AuctionEvent>) => {
    const { data, error } = await supabase
      .from("auction_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from("auction_events")
      .delete()
      .eq("id", id);

    if (error) throw error;
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

export const useEventVehicles = (eventId?: string) => {
  const [vehicles, setVehicles] = useState<AuctionVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    if (!eventId) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("auction_event_id", eventId)
        .order("lot_number", { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error("Error fetching event vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchVehicles();

    if (!eventId) return;

    const channel = supabase
      .channel(`event-vehicles-${eventId}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "vehicles",
          filter: `auction_event_id=eq.${eventId}`
        },
        () => fetchVehicles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchVehicles]);

  return { vehicles, loading, refetch: fetchVehicles };
};
