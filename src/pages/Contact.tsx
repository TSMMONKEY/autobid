import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: Phone, label: "Phone", value: "+27 11 000 0000" },
    { icon: Mail, label: "Email", value: "info@autobidsa.co.za" },
    { icon: MapPin, label: "Address", value: "123 Main Road, Sandton, Johannesburg" },
    { icon: Clock, label: "Hours", value: "Mon-Fri: 8am-5pm, Sat: 9am-1pm" },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | AutoBid SA</title>
        <meta name="description" content="Get in touch with AutoBid SA. We're here to help with your car auction questions." />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Contact <span className="text-primary">Us</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Have questions? We're here to help. Reach out to our team.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-card">
                <h2 className="font-display text-xl font-semibold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                      <Input placeholder="John" required />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                      <Input placeholder="Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <Input type="email" placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                    <Input type="tel" placeholder="+27 82 000 0000" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                    <Textarea placeholder="How can we help you?" rows={5} required />
                  </div>
                  <Button type="submit" variant="green" className="w-full" disabled={isSubmitting}>
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-8 border border-border shadow-card">
                  <h2 className="font-display text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    {contactInfo.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="font-medium text-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 border border-border shadow-card">
                  <h2 className="font-display text-xl font-semibold mb-4">Visit Our Yard</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Inspections welcome during business hours. Please call ahead to confirm vehicle availability.
                  </p>
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Map placeholder</span>
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

export default Contact;
