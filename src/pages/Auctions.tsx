import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CarCard from "@/components/CarCard";
import { cars } from "@/data/cars";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";

const CARS_PER_PAGE = 20; // 5 columns x 4 rows

const Auctions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(cars.map((car) => car.make))];
    return uniqueMakes.sort();
  }, []);

  const conditions = ["excellent", "good", "fair", "crashed", "salvage"];

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        `${car.year} ${car.make} ${car.model}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        car.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMake = !selectedMake || car.make === selectedMake;
      const matchesCondition = !selectedCondition || car.condition === selectedCondition;

      return matchesSearch && matchesMake && matchesCondition;
    });
  }, [searchQuery, selectedMake, selectedCondition]);

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE;
    return filteredCars.slice(startIndex, startIndex + CARS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMake(null);
    setSelectedCondition(null);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("...");
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <>
      <Helmet>
        <title>All Auctions | AutoBid SA - Car Auctions Johannesburg</title>
        <meta
          name="description"
          content="Browse car auctions in Johannesburg. Find Toyota, VW, Ford, Nissan and more. Crashed and running vehicles available."
        />
      </Helmet>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                All <span className="text-primary">Auctions</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Browse {cars.length} vehicles from Johannesburg and surrounding areas. 
                Crashed, salvage, and running vehicles available.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by make, model, year, or location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 h-12"
                  />
                </div>
                <Button
                  variant={showFilters ? "green" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-card rounded-xl p-6 border border-border mb-6 animate-fade-in shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold">
                      Filter Results
                    </h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Make Filter */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Make
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {makes.slice(0, 12).map((make) => (
                          <Button
                            key={make}
                            variant={selectedMake === make ? "green" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedMake(selectedMake === make ? null : make);
                              setCurrentPage(1);
                            }}
                          >
                            {make}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Condition Filter */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Condition
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map((condition) => (
                          <Button
                            key={condition}
                            variant={selectedCondition === condition ? "green" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedCondition(selectedCondition === condition ? null : condition);
                              setCurrentPage(1);
                            }}
                            className="capitalize"
                          >
                            {condition}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results count & Page info */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Showing <span className="text-foreground font-semibold">
                    {(currentPage - 1) * CARS_PER_PAGE + 1}-{Math.min(currentPage * CARS_PER_PAGE, filteredCars.length)}
                  </span> of <span className="text-foreground font-semibold">{filteredCars.length}</span> vehicles
                </p>
                <p className="text-muted-foreground text-sm">
                  Page <span className="text-foreground font-semibold">{currentPage}</span> of <span className="text-foreground font-semibold">{totalPages}</span>
                </p>
              </div>
            </div>

            {/* Car Grid - 5 columns x 4 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {paginatedCars.map((car, index) => (
                <div
                  key={car.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredCars.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No vehicles found matching your criteria.
                </p>
                <Button variant="green" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {getPageNumbers().map((page, index) => (
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "green" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
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