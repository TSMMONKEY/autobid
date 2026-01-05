import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setIsLoading(false);
      navigate("/");
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Sign In | AutoBid SA - Car Auctions</title>
        <meta
          name="description"
          content="Sign in to your AutoBid SA account to bid on car auctions in Johannesburg."
        />
      </Helmet>
      <div className="min-h-screen bg-background flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-gradient-green rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-foreground">
                  Auto<span className="text-primary">Bid</span>
                </span>
                <span className="text-xs text-muted-foreground -mt-1">South Africa</span>
              </div>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue bidding on vehicles
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="green"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Register Link */}
            <p className="text-center text-muted-foreground mt-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block flex-1 relative">
          <img
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200"
            alt="Car auction"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          <div className="absolute bottom-16 left-16 max-w-md">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Find Your Next Vehicle
            </h2>
            <p className="text-muted-foreground">
              Browse hundreds of cars and taxis at auction prices in Johannesburg.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;