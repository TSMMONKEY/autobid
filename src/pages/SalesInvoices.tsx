import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Receipt, Calendar, DollarSign, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
}

const SalesInvoices = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      unpaid: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
      paid: "bg-green-500/20 text-green-700 border-green-500/50",
      overdue: "bg-red-500/20 text-red-700 border-red-500/50",
      cancelled: "bg-muted text-muted-foreground",
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
        <title>Sales Invoices | AutoBid SA</title>
        <meta name="description" content="View and download your sales invoices" />
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
                Sales <span className="text-primary">Invoices</span>
              </h1>
              <p className="text-muted-foreground">
                View and download your invoice history
              </p>
            </div>

            {invoices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Invoices Yet</h2>
                  <p className="text-muted-foreground">
                    You don't have any invoices yet. Invoices are generated when you win an auction.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{invoice.invoice_number}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(invoice.created_at), "MMM dd, yyyy")}
                              </div>
                              {invoice.due_date && (
                                <span>Due: {format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-lg font-semibold">
                              R{invoice.total_amount.toLocaleString()}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <span>Subtotal: R{invoice.amount.toLocaleString()}</span>
                              {invoice.tax_amount > 0 && (
                                <span> + VAT: R{invoice.tax_amount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusBadge(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
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

export default SalesInvoices;