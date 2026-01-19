import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, RefreshCw, Plus, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Refund {
  id: string;
  amount: number;
  reason: string | null;
  status: string;
  processed_date: string | null;
  created_at: string;
}

const Refunds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRefund, setNewRefund] = useState({ amount: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchRefunds = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("refunds")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRefunds(data || []);
      } catch (error) {
        console.error("Error fetching refunds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [user?.id]);

  const handleSubmitRefund = async () => {
    if (!user?.id || !newRefund.amount) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("refunds")
        .insert({
          user_id: user.id,
          amount: parseFloat(newRefund.amount),
          reason: newRefund.reason || null,
        });

      if (error) throw error;

      toast({
        title: "Refund Requested",
        description: "Your refund request has been submitted for review.",
      });

      setIsDialogOpen(false);
      setNewRefund({ amount: "", reason: "" });

      // Refresh refunds list
      const { data } = await supabase
        .from("refunds")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setRefunds(data || []);
    } catch (error) {
      console.error("Error submitting refund:", error);
      toast({
        title: "Error",
        description: "Failed to submit refund request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
      approved: "bg-green-500/20 text-green-700 border-green-500/50",
      rejected: "bg-red-500/20 text-red-700 border-red-500/50",
      processed: "bg-primary/20 text-primary border-primary/50",
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
        <title>Refunds | AutoBid SA</title>
        <meta name="description" content="View and request refunds for your deposits" />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  My <span className="text-primary">Refunds</span>
                </h1>
                <p className="text-muted-foreground">
                  Request and track deposit refunds
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Refund
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Refund</DialogTitle>
                    <DialogDescription>
                      Submit a request to refund your deposit. Please provide the amount and reason.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Amount (ZAR)</label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={newRefund.amount}
                        onChange={(e) => setNewRefund({ ...newRefund, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reason</label>
                      <Textarea
                        placeholder="Please explain why you're requesting a refund..."
                        value={newRefund.reason}
                        onChange={(e) => setNewRefund({ ...newRefund, reason: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitRefund} 
                      disabled={submitting || !newRefund.amount}
                      className="w-full"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {refunds.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <RefreshCw className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Refund Requests</h2>
                  <p className="text-muted-foreground">
                    You haven't requested any refunds yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <Card key={refund.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <span className="text-xl font-semibold">
                              R{refund.amount.toLocaleString()}
                            </span>
                          </div>
                          {refund.reason && (
                            <p className="text-muted-foreground text-sm mb-2">{refund.reason}</p>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Requested: {format(new Date(refund.created_at), "MMM dd, yyyy")}
                          </div>
                          {refund.processed_date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-4 h-4" />
                              Processed: {format(new Date(refund.processed_date), "MMM dd, yyyy")}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusBadge(refund.status)}>
                          {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                        </Badge>
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

export default Refunds;