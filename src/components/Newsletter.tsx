import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive updates on new auctions and exclusive offers.",
      });
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-green flex items-center justify-center mx-auto mb-8 shadow-green">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Stay <span className="text-primary">Updated</span>
          </h2>
          <p className="text-muted-foreground mt-4 mb-8">
            Subscribe to receive auction alerts, new vehicle listings, 
            and special deals before anyone else.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12"
              required
            />
            <Button variant="green" size="lg" type="submit" className="group">
              Subscribe
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;