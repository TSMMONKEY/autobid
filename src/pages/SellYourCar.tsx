import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  Camera,
  FileText,
  CheckCircle,
  DollarSign,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";

const SellYourCar = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carMake: "",
    carModel: "",
    carYear: "",
    mileage: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Submission Received!",
      description: "Our team will contact you within 24 hours to discuss your vehicle.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      carMake: "",
      carModel: "",
      carYear: "",
      mileage: "",
      description: "",
    });
  };

  const benefits = [
    {
      icon: Users,
      title: "Reach 50,000+ Buyers",
      description: "Access our network of verified collectors and enthusiasts.",
    },
    {
      icon: TrendingUp,
      title: "Best Market Prices",
      description: "Competitive bidding ensures you get top dollar for your car.",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Protected payments and verified buyers for peace of mind.",
    },
    {
      icon: DollarSign,
      title: "Low Seller Fees",
      description: "Keep more of your sale with our competitive commission rates.",
    },
  ];

  const process = [
    {
      icon: FileText,
      title: "Submit Details",
      description: "Fill out our form with your vehicle information.",
    },
    {
      icon: Camera,
      title: "Photo Review",
      description: "We'll guide you through capturing the perfect photos.",
    },
    {
      icon: CheckCircle,
      title: "Listing Approval",
      description: "Our team reviews and approves your listing.",
    },
    {
      icon: Car,
      title: "Go Live",
      description: "Your car goes up for auction to our network of buyers.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Sell Your Car | AutoElite - Premium Car Auctions</title>
        <meta
          name="description"
          content="Sell your luxury or exotic car at AutoElite auctions. Reach 50,000+ verified buyers and get the best price for your vehicle."
        />
      </Helmet>
      <Layout>
        <div className="pt-28 pb-16">
          {/* Hero */}
          <section className="container mx-auto px-4 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Sell Your <span className="text-gradient-gold">Luxury Car</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Join thousands of sellers who have successfully sold their
                  vehicles through AutoElite. Our platform connects you with serious
                  buyers who appreciate exceptional automobiles.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "2,500+", label: "Cars Sold" },
                    { value: "$850M+", label: "Total Sales" },
                  ].map((stat, index) => (
                    <div key={index}>
                      <p className="font-display text-3xl font-bold text-gradient-gold">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent blur-2xl rounded-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"
                  alt="Luxury car for sale"
                  className="relative rounded-2xl shadow-elevated"
                />
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-card py-16 mb-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
                Why Sell With <span className="text-gradient-gold">AutoElite</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="text-center p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(28,90%,45%)] flex items-center justify-center mx-auto mb-4 shadow-gold">
                      <benefit.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="container mx-auto px-4 mb-20">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Simple <span className="text-gradient-gold">4-Step Process</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={index} className="relative text-center">
                  {index < process.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 border-2 border-primary">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form */}
          <section className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
                Get Started
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Fill out the form below and we'll be in touch within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Your Name
                    </label>
                    <Input
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Make
                    </label>
                    <Input
                      name="carMake"
                      placeholder="Porsche"
                      value={formData.carMake}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Model
                    </label>
                    <Input
                      name="carModel"
                      placeholder="911 Turbo S"
                      value={formData.carModel}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Year
                    </label>
                    <Input
                      name="carYear"
                      placeholder="2023"
                      value={formData.carYear}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Mileage
                  </label>
                  <Input
                    name="mileage"
                    placeholder="5,000 miles"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Additional Details
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Tell us about your vehicle's condition, modifications, history, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <Button variant="gold" size="lg" className="w-full">
                  Submit for Review
                </Button>
              </form>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default SellYourCar;
