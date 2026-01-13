import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Car, Plus, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface CarFormData {
  year: string;
  make: string;
  model: string;
  vin: string;
  mileage: string;
  exterior: string;
  interior: string;
  engine: string;
  transmission: string;
  condition: string;
  location: string;
  description: string;
  currentBid: string;
  endTime: string;
  isLive: boolean;
  isFeatured: boolean;
  images: string[];
}

const initialFormData: CarFormData = {
  year: "",
  make: "",
  model: "",
  vin: "",
  mileage: "",
  exterior: "",
  interior: "",
  engine: "",
  transmission: "Manual",
  condition: "good",
  location: "South Africa",
  description: "",
  currentBid: "0",
  endTime: "",
  isLive: true,
  isFeatured: false,
  images: [""],
};

const transmissionOptions = ["Manual", "Automatic", "CVT", "Semi-Auto", "DCT"];
const conditionOptions = ["excellent", "good", "fair", "crashed", "salvage"];

const AddCar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default end time to 7 days from now
  useEffect(() => {
    const defaultEndTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      endTime: defaultEndTime.toISOString().slice(0, 16)
    }));
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to add vehicles");
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleInputChange = (field: keyof CarFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.year || !formData.make || !formData.model) {
      toast.error("Please fill in all required fields (Year, Make, Model)");
      setIsSubmitting(false);
      return;
    }

    try {
      // const validImages = formData.images.filter(img => img.trim() !== "");
      // const mainImage = validImages[0] || "/placeholder.svg";
      const makePath = formData.make.toLowerCase().replace(/\s+/g, '-');
      const validImages = formData.images
        .filter(img => img.trim() !== "")
        .map(img => {
          // If it's already a full path or URL, keep it as-is
          if (img.startsWith('/') || img.startsWith('http')) {
            return img;
          }
          // Otherwise, construct the path: /assets/imgs/{make}/{filename}
          return `/assets/imgs/${makePath}/${img}.jpg`;
        });
      const mainImage = validImages[0] || "/placeholder.svg";


      const { error } = await supabase.from("vehicles").insert({
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        vin: formData.vin || null,
        mileage: parseInt(formData.mileage) || 0,
        exterior: formData.exterior || null,
        interior: formData.interior || null,
        engine: formData.engine || null,
        transmission: formData.transmission,
        condition: formData.condition,
        location: formData.location,
        description: formData.description || null,
        current_bid: parseInt(formData.currentBid) || 0,
        end_time: new Date(formData.endTime).toISOString(),
        is_live: formData.isLive,
        is_featured: formData.isFeatured,
        image: mainImage,
        images: validImages.length > 0 ? validImages : [mainImage],
        bid_count: 0,
      });

      if (error) throw error;

      toast.success("Vehicle added successfully!");
      setFormData(initialFormData);
      navigate("/auctions");
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      toast.error(error.message || "Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    toast.info("Form reset");
  };

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 pt-24">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit mb-4">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription>
                Only administrators can add new vehicles to the auction.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/auctions")} variant="outline">
                Browse Auctions
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add New Vehicle</CardTitle>
                <CardDescription>Enter the vehicle details below to add it to the auction</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Toyota"
                      value={formData.make}
                      onChange={(e) => handleInputChange("make", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Corolla"
                      value={formData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input
                      id="vin"
                      placeholder="17-character VIN"
                      maxLength={17}
                      value={formData.vin}
                      onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="e.g., 150000"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange("mileage", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Johannesburg"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exterior">Exterior Color</Label>
                    <Input
                      id="exterior"
                      placeholder="e.g., White"
                      value={formData.exterior}
                      onChange={(e) => handleInputChange("exterior", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interior">Interior Color</Label>
                    <Input
                      id="interior"
                      placeholder="e.g., Black"
                      value={formData.interior}
                      onChange={(e) => handleInputChange("interior", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine">Engine</Label>
                    <Input
                      id="engine"
                      placeholder="e.g., 2.0L Petrol"
                      value={formData.engine}
                      onChange={(e) => handleInputChange("engine", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => handleInputChange("transmission", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => handleInputChange("condition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Auction Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Auction Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentBid">Starting Bid (R)</Label>
                    <Input
                      id="currentBid"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.currentBid}
                      onChange={(e) => handleInputChange("currentBid", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Auction End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="isLive" className="text-base">Live Auction</Label>
                      <p className="text-sm text-muted-foreground">Make this auction live immediately</p>
                    </div>
                    <Switch
                      id="isLive"
                      checked={formData.isLive}
                      onCheckedChange={(checked) => handleInputChange("isLive", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="isFeatured" className="text-base">Featured</Label>
                      <p className="text-sm text-muted-foreground">Show on homepage</p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Vehicle Images</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                    <Plus className="w-4 h-4 mr-1" /> Add Image
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Image URL ${index + 1}`}
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImageField(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter vehicle description..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Vehicle...
                    </>
                  ) : (
                    "Add Vehicle"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset Form
                </Button>
                <Button type="button" variant="ghost" onClick={() => navigate("/auctions")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddCar;
