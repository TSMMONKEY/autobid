import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Package, MapPin, Clock, Search, CheckCircle } from "lucide-react";

const shippingZones = [
  { region: "Gauteng", days: "1-2 days", price: "R1,500 - R2,500" },
  { region: "North West", days: "2-3 days", price: "R2,500 - R3,500" },
  { region: "Mpumalanga", days: "2-3 days", price: "R2,500 - R3,500" },
  { region: "Limpopo", days: "3-4 days", price: "R3,500 - R4,500" },
  { region: "Free State", days: "2-3 days", price: "R3,000 - R4,000" },
  { region: "KwaZulu-Natal", days: "3-5 days", price: "R4,500 - R6,000" },
  { region: "Eastern Cape", days: "4-6 days", price: "R5,500 - R7,500" },
  { region: "Western Cape", days: "5-7 days", price: "R6,500 - R8,500" },
  { region: "Northern Cape", days: "4-6 days", price: "R5,000 - R7,000" },
];

const Shipping = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder tracking functionality
  };

  return (
    <>
      <Helmet>
        <title>Shipping & Delivery | AutoBid SA</title>
        <meta name="description" content="Vehicle delivery information and tracking for AutoBid SA purchases. Nationwide delivery available." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Shipping & <span className="text-primary">Delivery</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Nationwide vehicle delivery. Track your purchase or get a delivery quote.
              </p>
            </div>

            {/* Track Your Vehicle */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-card rounded-xl p-8 border border-border shadow-card">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  Track Your Vehicle
                </h2>
                <form onSubmit={handleTrack} className="flex gap-4">
                  <Input
                    placeholder="Enter tracking number (e.g., AB123456)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="green">
                    Track
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground mt-4">
                  Your tracking number is sent via email and SMS after dispatch.
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Truck,
                  title: "Nationwide Delivery",
                  description: "We deliver to all 9 provinces across South Africa using trusted vehicle transport partners."
                },
                {
                  icon: Package,
                  title: "Secure Transport",
                  description: "All vehicles are transported on enclosed or flatbed carriers with full insurance coverage."
                },
                {
                  icon: Clock,
                  title: "Delivery Timeline",
                  description: "Vehicles are dispatched within 2-3 business days after payment confirmation."
                },
              ].map((item, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-card text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Shipping Rates */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="font-display text-2xl font-semibold text-center mb-8">
                Delivery <span className="text-primary">Rates</span>
              </h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
                <div className="grid grid-cols-3 bg-secondary/50 p-4 font-semibold text-sm">
                  <span>Region</span>
                  <span>Est. Delivery</span>
                  <span>Price Range</span>
                </div>
                {shippingZones.map((zone, index) => (
                  <div key={index} className="grid grid-cols-3 p-4 border-t border-border hover:bg-secondary/30 transition-colors">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {zone.region}
                    </span>
                    <span className="text-muted-foreground">{zone.days}</span>
                    <span className="font-medium">{zone.price}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                *Prices vary based on exact location and vehicle size. Contact us for an exact quote.
              </p>
            </div>

            {/* Collection Option */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-green rounded-xl p-8 text-center text-primary-foreground">
                <h2 className="font-display text-2xl font-semibold mb-4">
                  Prefer to Collect?
                </h2>
                <p className="mb-6 opacity-90">
                  Save on delivery costs by collecting your vehicle from our Johannesburg yard. 
                  Bring valid ID and proof of payment.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>No delivery fee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Immediate handover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Full inspection before leaving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Shipping;
