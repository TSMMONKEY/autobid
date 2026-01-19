import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShoppingCart, Calendar, DollarSign, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SalesOrder {
  id: string;
  vehicle_id: string;
  sale_amount: number;
  status: string;
  created_at: string;
  delivery_date: string | null;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    image: string;
  };
}

const SalesOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sales")
          .select(`
            id,
            vehicle_id,
            sale_amount,
            status,
            created_at,
            delivery_date,
            vehicles (
              make,
              model,
              year,
              image
            )
          `)
          .eq("buyer_id", user.id)
          .in("status", ["pending_payment", "paid", "shipped"])
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedOrders = (data || []).map((order: any) => ({
          id: order.id,
          vehicle_id: order.vehicle_id,
          sale_amount: order.sale_amount,
          status: order.status,
          created_at: order.created_at,
          delivery_date: order.delivery_date,
          vehicle: order.vehicles ? {
            make: order.vehicles.make,
            model: order.vehicles.model,
            year: order.vehicles.year,
            image: order.vehicles.image,
          } : undefined,
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending_payment: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
      paid: "bg-blue-500/20 text-blue-700 border-blue-500/50",
      shipped: "bg-purple-500/20 text-purple-700 border-purple-500/50",
    };
    return statusStyles[status] || "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_payment: "Awaiting Payment",
      paid: "Payment Received",
      shipped: "In Transit",
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sales Orders | AutoBid SA</title>
        <meta name="description" content="View your current sales orders and track deliveries" />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Current <span className="text-primary">Sales Orders</span>
              </h1>
              <p className="text-muted-foreground">
                Track your active orders and deliveries
              </p>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Active Orders</h2>
                  <p className="text-muted-foreground mb-6">
                    You don't have any active orders at the moment.
                  </p>
                  <Link to="/auctions">
                    <Button>Browse Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <img
                          src={order.vehicle?.image || "/placeholder.svg"}
                          alt={order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : "Vehicle"}
                          className="w-full md:w-48 h-32 object-cover"
                        />
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {order.vehicle ? `${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}` : "Vehicle"}
                              </h3>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium text-foreground">
                                    R{order.sale_amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Order placed: {format(new Date(order.created_at), "MMM dd, yyyy")}
                                </div>
                                {order.delivery_date && (
                                  <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Expected delivery: {format(new Date(order.delivery_date), "MMM dd, yyyy")}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusBadge(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                              <Link to={`/car/${order.vehicle_id}`}>
                                <Button variant="outline" size="sm" className="mt-4">
                                  View Vehicle
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SalesOrders;