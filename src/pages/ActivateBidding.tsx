import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Wallet, 
  Shield, 
  Clock, 
  CheckCircle, 
  Copy, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bankDetails = {
  bankName: "First National Bank (FNB)",
  accountName: "AutoBid SA (Pty) Ltd",
  accountNumber: "62845678901",
  branchCode: "250655",
  reference: "BID-[YOUR ID NUMBER]",
  amount: "R250.00",
};

const ActivateBidding = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Activate Bidding | AutoBid SA</title>
        <meta name="description" content="Pay your R250 deposit to activate your bidding account on AutoBid SA." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Activate Your <span className="text-primary">Bidding Account</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                To start bidding on vehicles, a one-time refundable deposit of R250 is required. 
                This ensures only serious bidders participate in our auctions.
              </p>
            </div>

            {/* Alert */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-700 mb-1">Bidding Not Yet Active</h3>
                <p className="text-sm text-muted-foreground">
                  You need to deposit R250 to activate your bidding privileges. 
                  Once payment is confirmed, you'll be able to bid on any vehicle.
                </p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-card rounded-xl p-8 border border-border shadow-card mb-8">
              <h2 className="font-display text-xl font-semibold mb-6">
                Bank Details for EFT Payment
              </h2>
              
              <div className="space-y-4">
                {Object.entries({
                  "Bank Name": bankDetails.bankName,
                  "Account Name": bankDetails.accountName,
                  "Account Number": bankDetails.accountNumber,
                  "Branch Code": bankDetails.branchCode,
                  "Amount": bankDetails.amount,
                }).map(([label, value]) => (
                  <div 
                    key={label}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="font-semibold text-foreground">{value}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(value, label)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {/* Reference with special styling */}
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary font-medium">Payment Reference (IMPORTANT)</p>
                      <p className="font-semibold text-foreground">{bankDetails.reference}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(bankDetails.reference, "Reference")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replace [YOUR ID NUMBER] with your SA ID number for faster verification
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-card rounded-xl p-8 border border-border shadow-card mb-8">
              <h2 className="font-display text-xl font-semibold mb-6">
                What You Get
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Shield, title: "Verified Bidder", desc: "Full access to all auctions" },
                  { icon: Clock, title: "Instant Activation", desc: "Start bidding within 24 hours" },
                  { icon: Wallet, title: "Fully Refundable", desc: "Get your R250 back if you don't win" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-secondary/30 rounded-xl p-8">
              <h2 className="font-display text-xl font-semibold mb-6">
                Next Steps
              </h2>
              <div className="space-y-4">
                {[
                  "Make the R250 EFT payment using the details above",
                  "Use your ID number as the payment reference",
                  "Send proof of payment to payments@autobidsa.co.za",
                  "Your account will be activated within 24 hours",
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auctions">
                <Button variant="outline" size="lg">
                  Browse Auctions While Waiting
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="green" size="lg">
                  <CheckCircle className="w-5 h-5" />
                  I've Made Payment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ActivateBidding;
