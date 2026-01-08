import { useState } from "react";
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
import { Car, Plus, Trash2 } from "lucide-react";

interface CarFormData {
  VID: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  odometer: string;
  color: string;
  cylinders: string;
  engine_type: string;
  transmission: string;
  drivetrain: string;
  fuel: string;
  has_key: boolean;
  engine_starts: boolean;
  primary_damage: string;
  title_code: string;
  notes: string;
  images: string[];
}

const initialFormData: CarFormData = {
  VID: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  vin: "",
  odometer: "",
  color: "",
  cylinders: "",
  engine_type: "",
  transmission: "",
  drivetrain: "",
  fuel: "",
  has_key: true,
  engine_starts: true,
  primary_damage: "",
  title_code: "",
  notes: "",
  images: [""],
};

const transmissionOptions = ["Manual", "Automatic", "CVT", "Semi-Auto", "DCT"];
const drivetrainOptions = ["FWD", "RWD", "AWD", "4WD"];
const fuelOptions = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
const titleCodeOptions = ["Clean", "Salvage", "Rebuilt", "Flood", "Lemon", "Junk"];
const damageOptions = ["None", "Front End", "Rear End", "Side", "Rollover", "Vandalism", "Hail", "Flood", "Fire", "Mechanical"];

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.year || !formData.make || !formData.model || !formData.vin) {
      toast.error("Please fill in all required fields (Year, Make, Model, VIN)");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Car data submitted:", formData);
    toast.success("Car added successfully!");
    
    setFormData(initialFormData);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    toast.info("Form reset");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
                    <Label htmlFor="VID">Vehicle ID (VID)</Label>
                    <Input
                      id="VID"
                      type="number"
                      placeholder="e.g., 12345"
                      value={formData.VID}
                      onChange={(e) => handleInputChange("VID", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
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
                    <Label htmlFor="trim">Trim</Label>
                    <Input
                      id="trim"
                      placeholder="e.g., SE, XLE, Sport"
                      value={formData.trim}
                      onChange={(e) => handleInputChange("trim", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN *</Label>
                    <Input
                      id="vin"
                      placeholder="17-character VIN"
                      maxLength={17}
                      value={formData.vin}
                      onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="odometer">Odometer (km)</Label>
                    <Input
                      id="odometer"
                      placeholder="e.g., 150000"
                      value={formData.odometer}
                      onChange={(e) => handleInputChange("odometer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Exterior Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g., White, Silver"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cylinders">Cylinders</Label>
                    <Input
                      id="cylinders"
                      placeholder="e.g., 4, 6, 8"
                      value={formData.cylinders}
                      onChange={(e) => handleInputChange("cylinders", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine_type">Engine Type</Label>
                    <Input
                      id="engine_type"
                      placeholder="e.g., 2.0L Petrol"
                      value={formData.engine_type}
                      onChange={(e) => handleInputChange("engine_type", e.target.value)}
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
                    <Label htmlFor="drivetrain">Drivetrain</Label>
                    <Select
                      value={formData.drivetrain}
                      onValueChange={(value) => handleInputChange("drivetrain", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select drivetrain" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivetrainOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuel">Fuel Type</Label>
                    <Select
                      value={formData.fuel}
                      onValueChange={(value) => handleInputChange("fuel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Condition & Title */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Condition & Title</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_damage">Primary Damage</Label>
                    <Select
                      value={formData.primary_damage}
                      onValueChange={(value) => handleInputChange("primary_damage", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select damage type" />
                      </SelectTrigger>
                      <SelectContent>
                        {damageOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_code">Title Code</Label>
                    <Select
                      value={formData.title_code}
                      onValueChange={(value) => handleInputChange("title_code", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select title code" />
                      </SelectTrigger>
                      <SelectContent>
                        {titleCodeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="has_key" className="text-base">Has Key</Label>
                      <p className="text-sm text-muted-foreground">Vehicle comes with key(s)</p>
                    </div>
                    <Switch
                      id="has_key"
                      checked={formData.has_key}
                      onCheckedChange={(checked) => handleInputChange("has_key", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="engine_starts" className="text-base">Engine Starts</Label>
                      <p className="text-sm text-muted-foreground">Engine runs/starts</p>
                    </div>
                    <Switch
                      id="engine_starts"
                      checked={formData.engine_starts}
                      onCheckedChange={(checked) => handleInputChange("engine_starts", checked)}
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional information about the vehicle..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
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
