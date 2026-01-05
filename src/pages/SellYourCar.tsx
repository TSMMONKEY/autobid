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
      title: "Reach 10,000+ Buyers",
      description: "Access our network of verified buyers across Johannesburg.",
    },
    {
      icon: TrendingUp,
      title: "Competitive Prices",
      description: "Competitive bidding ensures you get fair market value.",
    },
    {
      icon: Shield,
      title: "Secure Process",
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
      description: "We'll guide you through capturing the right photos.",
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
        <title>Sell Your Car | AutoBid SA - Car Auctions Johannesburg</title>
        <meta
          name="description"
          content="Sell your car at AutoBid SA auctions. Reach buyers in Johannesburg and get the best price for your vehicle."
        />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16">
          {/* Hero */}
          <section className="container mx-auto px-4 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Sell Your <span className="text-primary">Car</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Join sellers who have successfully sold their
                  vehicles through AutoBid SA. Our platform connects you with serious
                  buyers across Johannesburg and South Africa.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "1,500+", label: "Cars Sold" },
                    { value: "R50M+", label: "Total Sales" },
                  ].map((stat, index) => (
                    <div key={index}>
                      <p className="font-display text-3xl font-bold text-primary">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent blur-2xl rounded-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"
                  alt="Car for sale"
                  className="relative rounded-xl shadow-elevated"
                />
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="bg-secondary/30 py-16 mb-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
                Why Sell With <span className="text-primary">AutoBid SA</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="text-center p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-green flex items-center justify-center mx-auto mb-4 shadow-green">
                      <benefit.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
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
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              Simple <span className="text-primary">4-Step Process</span>
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
            <div className="max-w-2xl mx-auto bg-card rounded-xl p-8 border border-border shadow-card">
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
                    placeholder="+27 82 000 0000"
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
                      placeholder="Toyota"
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
                      placeholder="Corolla"
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
                      placeholder="2020"
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
                    placeholder="50,000 km"
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
                    placeholder="Tell us about your vehicle's condition, any damage, service history, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <Button variant="green" size="lg" className="w-full">
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