import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CarCard from "@/components/CarCard";
import { cars } from "@/data/cars";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Grid3X3, List } from "lucide-react";

const Auctions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(cars.map((car) => car.make))];
    return uniqueMakes.sort();
  }, []);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        `${car.year} ${car.make} ${car.model}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        car.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMake = !selectedMake || car.make === selectedMake;

      const matchesPrice =
        car.currentBid >= priceRange[0] && car.currentBid <= priceRange[1];

      return matchesSearch && matchesMake && matchesPrice;
    });
  }, [searchQuery, selectedMake, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMake(null);
    setPriceRange([0, 5000000]);
  };

  return (
    <>
      <Helmet>
        <title>All Auctions | AutoElite - Premium Car Auctions</title>
        <meta
          name="description"
          content="Browse all luxury and exotic car auctions. Find your dream Porsche, Ferrari, Lamborghini and more at AutoElite."
        />
      </Helmet>
      <Layout>
        <div className="pt-28 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                All <span className="text-gradient-gold">Auctions</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Explore our complete collection of luxury, exotic, and collector
                vehicles currently up for auction.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by make, model, year, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showFilters ? "gold" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </Button>
                  <div className="hidden md:flex border border-border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none h-12 w-12"
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-none h-12 w-12"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold">
                      Filter Results
                    </h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Make Filter */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Make
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {makes.map((make) => (
                          <Button
                            key={make}
                            variant={selectedMake === make ? "gold" : "outline"}
                            size="sm"
                            onClick={() =>
                              setSelectedMake(selectedMake === make ? null : make)
                            }
                          >
                            {make}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing <span className="text-foreground font-semibold">{filteredCars.length}</span> vehicles
                </p>
              </div>
            </div>

            {/* Car Grid */}
            <div
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filteredCars.map((car, index) => (
                <div
                  key={car.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No vehicles found matching your criteria.
                </p>
                <Button variant="gold" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Auctions;
