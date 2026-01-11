import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin, Gauge, Calendar, Key, Zap, AlertTriangle } from "lucide-react";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  currentBid: number;
  endTime: Date;
  image: string;
  images: string[];
  mileage: number;
  location: string;
  transmission: string;
  engine: string;
  exterior: string;
  interior: string;
  vin: string;
  description: string;
  bidCount: number;
  isLive: boolean;
  isFeatured: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'crashed' | 'salvage';
  hasKey: boolean;
  engineStarts: boolean;
  primaryDamage: string;
}

const API_URL = import.meta.env.VITE_CARS_API_URL || 'http://localhost/autobid/api';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No car ID provided");
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to get from the list endpoint
        const listResponse = await fetch(`${API_URL}/cars.php`);
        if (!listResponse.ok) throw new Error('Failed to fetch cars list');
        
        const allCars = await listResponse.json();
        let carData = Array.isArray(allCars) 
          ? allCars.find(car => String(car.id) === id)
          : null;

        // If not found in list, try direct fetch
        if (!carData) {
          const response = await fetch(`${API_URL}/cars.php?id=${id}`);
          if (!response.ok) throw new Error('Car not found');
          carData = await response.json();
        }

        if (!carData) {
          throw new Error('Car not found');
        }

        // Transform the data to match our Car interface
        const transformedCar: Car = {
          id: String(carData.id || id),
          make: carData.make || carData.Make || 'Unknown',
          model: carData.model || carData.Model || 'Unknown',
          year: Number(carData.year || carData.Year || new Date().getFullYear()),
          currentBid: Number(carData.currentBid || carData.CurrentBid || 0),
          endTime: carData.endTime ? new Date(carData.endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          image: carData.image || carData.images?.[0] || carData.Image || '/placeholder-car.jpg',
          images: Array.isArray(carData.images) 
            ? carData.images 
            : (carData.image ? [carData.image] : ['/placeholder-car.jpg']),
          mileage: Number(carData.mileage || carData.Mileage || 0),
          location: carData.location || carData.Location || 'Location not specified',
          transmission: carData.transmission || carData.Transmission || 'Automatic',
          engine: carData.engine || carData.Engine || 'Engine not specified',
          exterior: carData.exterior || carData.Exterior || 'Color not specified',
          interior: carData.interior || carData.Interior || 'Color not specified',
          vin: carData.vin || carData.VIN || 'N/A',
          description: carData.description || carData.Description || 
            `${carData.year || ''} ${carData.make || ''} ${carData.model || ''} for auction.`,
          bidCount: Number(carData.bidCount || carData.BidCount || 0),
          isLive: carData.isLive !== false,
          isFeatured: carData.isFeatured === true,
          condition: (['excellent', 'good', 'fair', 'crashed', 'salvage'].includes(
            (carData.condition || 'good').toLowerCase()
          ) ? (carData.condition || 'good').toLowerCase() : 'good') as Car['condition'],
          hasKey: carData.hasKey !== false,
          engineStarts: carData.engineStarts !== false,
          primaryDamage: carData.primaryDamage || carData.PrimaryDamage || 'None'
        };

        setCar(transformedCar);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to load car details. Please try again later.');
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess(false);

    if (!bidAmount) {
      setBidError("Please enter a bid amount");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount");
      return;
    }

    if (car && amount <= car.currentBid) {
      setBidError(`Your bid must be higher than the current bid of r${car.currentBid.toLocaleString()}`);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (car) {
        setCar({
          ...car,
          currentBid: amount,
          bidCount: car.bidCount + 1
        });
      }
      
      setBidSuccess(true);
      setBidAmount("");
      
      toast({
        title: "Bid Placed!",
        description: `Your bid of R${amount.toLocaleString()} has been placed.`,
      });
    } catch (err) {
      console.error('Error placing bid:', err);
      setBidError("Failed to place bid. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The car you're looking for doesn't exist or has been removed."}
        </p>
        <Button onClick={() => navigate("/auctions")}>
          Back to Auctions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to results
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-muted rounded-xl overflow-hidden aspect-video">
            <img
              src={car.image}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
              }}
            />
          </div>
          
          {/* Additional images */}
          {car.images && car.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {car.images.slice(0, 4).map((img, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${car.year} ${car.make} ${car.model} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {car.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Car Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {car.year} {car.make} {car.model}
                </h1>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{car.location}</span>
                </div>
              </div>
              <Badge variant={car.isLive ? "destructive" : "secondary"}>
                {car.isLive ? "Live" : "Ended"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Badge variant="outline" className="capitalize">
                {car.condition}
              </Badge>
              {car.isFeatured && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Auction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-2xl font-bold">R{car.currentBid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bid Count</p>
                  <p className="text-xl font-semibold">{car.bidCount} bids</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Left</p>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span>
                      {format(car.endTime, "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-mono">{car.vin}</p>
                </div>
              </div>

              {/* Bid Form */}
              <div className="pt-2">
                <form onSubmit={handleBid} className="space-y-3">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium mb-1">
                      Your Bid (ZAR)
                    </label>
                    <Input
                      id="bidAmount"
                      type="number"
                      min={car.currentBid + 1}
                      step="100"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum bid R${(car.currentBid + 1).toLocaleString()}`}
                      disabled={!car.isLive}
                    />
                  </div>
                  {bidError && <p className="text-sm text-destructive">{bidError}</p>}
                  {bidSuccess && (
                    <p className="text-sm text-green-600">Bid placed successfully!</p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!car.isLive || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Bid...
                      </>
                    ) : (
                      `Place Bid R${car.currentBid + 100}`
                    )}
                  </Button>
                  {!car.isLive && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      This auction has ended.
                    </p>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Make</p>
                  <p>{car.make}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p>{car.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p>{car.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <div className="flex items-center">
                    <Gauge className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span>{car.mileage.toLocaleString()} miles</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p>{car.transmission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Engine</p>
                  <p>{car.engine}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Exterior</p>
                  <p>{car.exterior}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interior</p>
                  <p>{car.interior}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center">
                  <Key className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{car.hasKey ? "Key Available" : "No Key"}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{car.engineStarts ? "Engine Starts" : "Engine Doesn't Start"}</span>
                </div>
                {car.primaryDamage !== 'None' && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Primary Damage: {car.primaryDamage}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;