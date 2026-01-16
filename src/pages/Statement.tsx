import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ScrollText, Calendar, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRegistrationStatus } from "@/hooks/useRegistrationStatus";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  balance_after: number | null;
  created_at: string;
}

const Statement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { registration } = useRegistrationStatus();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const getTypeStyles = (type: string) => {
    const isCredit = ["deposit", "refund", "bid_release"].includes(type);
    return {
      color: isCredit ? "text-green-600" : "text-red-600",
      icon: isCredit ? ArrowDownRight : ArrowUpRight,
      prefix: isCredit ? "+" : "-",
    };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      bid_hold: "Bid Hold",
      bid_release: "Bid Released",
      purchase: "Purchase",
      refund: "Refund",
      fee: "Service Fee",
    };
    return labels[type] || type;
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
        <title>Account Statement | AutoBid SA</title>
        <meta name="description" content="View your complete account transaction history" />
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
                  Account <span className="text-primary">Statement</span>
                </h1>
                <p className="text-muted-foreground">
                  Complete transaction history for your account
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {/* Balance Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  R{(registration?.deposit_amount || 0).toLocaleString()}
                </div>
                <p className="text-muted-foreground mt-2">Available for bidding</p>
              </CardContent>
            </Card>

            {transactions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <ScrollText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Transactions Yet</h2>
                  <p className="text-muted-foreground">
                    Your transaction history will appear here once you make a deposit or place bids.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {transactions.map((transaction) => {
                      const styles = getTypeStyles(transaction.type);
                      const Icon = styles.icon;
                      
                      return (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              styles.color === "text-green-600" ? "bg-green-500/10" : "bg-red-500/10"
                            }`}>
                              <Icon className={`w-5 h-5 ${styles.color}`} />
                            </div>
                            <div>
                              <p className="font-medium">{getTypeLabel(transaction.type)}</p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' HH:mm")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${styles.color}`}>
                              {styles.prefix}R{Math.abs(transaction.amount).toLocaleString()}
                            </p>
                            {transaction.balance_after !== null && (
                              <p className="text-xs text-muted-foreground">
                                Balance: R{transaction.balance_after.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Statement;