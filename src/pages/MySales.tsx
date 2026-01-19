import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShoppingCart, Car, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Sale {
  id: string;
  vehicle_id: string;
  sale_amount: number;
  status: string;
  created_at: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    image: string;
  };
}

const MySales = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchSales = async () => {
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
            vehicles (
              make,
              model,
              year,
              image
            )
          `)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedSales = (data || []).map((sale: any) => ({
          id: sale.id,
          vehicle_id: sale.vehicle_id,
          sale_amount: sale.sale_amount,
          status: sale.status,
          created_at: sale.created_at,
          vehicle: sale.vehicles ? {
            make: sale.vehicles.make,
            model: sale.vehicles.model,
            year: sale.vehicles.year,
            image: sale.vehicles.image,
          } : undefined,
        }));

        setSales(transformedSales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending_payment: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
      paid: "bg-blue-500/20 text-blue-700 border-blue-500/50",
      shipped: "bg-purple-500/20 text-purple-700 border-purple-500/50",
      delivered: "bg-green-500/20 text-green-700 border-green-500/50",
      completed: "bg-primary/20 text-primary border-primary/50",
      cancelled: "bg-red-500/20 text-red-700 border-red-500/50",
    };
    return statusStyles[status] || "bg-muted text-muted-foreground";
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
        <title>My Sales | AutoBid SA</title>
        <meta name="description" content="View your purchased vehicles and sales history" />
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
                My <span className="text-primary">Sales</span>
              </h1>
              <p className="text-muted-foreground">
                View all vehicles you have won at auction
              </p>
            </div>

            {sales.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Sales Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't won any auctions yet. Start bidding to win vehicles!
                  </p>
                  <Link to="/auctions">
                    <Button>Browse Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sales.map((sale) => (
                  <Card key={sale.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <img
                          src={sale.vehicle?.image || "/placeholder.svg"}
                          alt={sale.vehicle ? `${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model}` : "Vehicle"}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {sale.vehicle ? `${sale.vehicle.year} ${sale.vehicle.make} ${sale.vehicle.model}` : "Vehicle"}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              R{sale.sale_amount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(sale.created_at), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(sale.status)}>
                          {sale.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <Link to={`/car/${sale.vehicle_id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
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

export default MySales;