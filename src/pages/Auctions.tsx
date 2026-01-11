import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CarCard from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const CARS_PER_PAGE = 20; // 5 columns x 4 rows

const Auctions = () => {
  const { cars, loading, error } = useCars();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(cars.map((car) => car.make))];
    return uniqueMakes.sort();
  }, [cars]);

  const conditions = ["excellent", "good", "fair", "crashed", "salvage"] as const;

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
  }, [cars, searchQuery, selectedMake, selectedCondition]);

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE;
    return filteredCars.slice(startIndex, startIndex + CARS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const clearFilters = () => {
    setSelectedMake(null);
    setSelectedCondition(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12 text-destructive">
          <p>Failed to load cars. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Car Auctions | AutoBid</title>
        <meta
          name="description"
          content="Browse our selection of cars available for auction. Find your next vehicle at a great price."
        />
      </Helmet>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              All <span className="text-primary">Auctions</span>
            </h1>
            <p className="text-muted-foreground">
              Browse {cars.length} vehicles from our collection. Find your next car at a great price.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by make, model, year, or location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>

            {/* Active Filters */}
            {(selectedMake || selectedCondition) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMake && (
                  <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center">
                    {selectedMake}
                    <X 
                      className="w-4 h-4 ml-2 cursor-pointer" 
                      onClick={() => setSelectedMake(null)}
                    />
                  </div>
                )}
                {selectedCondition && (
                  <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center capitalize">
                    {selectedCondition}
                    <X 
                      className="w-4 h-4 ml-2 cursor-pointer" 
                      onClick={() => setSelectedCondition(null)}
                    />
                  </div>
                )}
                {(selectedMake || selectedCondition) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-card border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Make</h3>
                    <div className="flex flex-wrap gap-2">
                      {makes.map((make) => (
                        <Button
                          key={make}
                          variant={selectedMake === make ? "default" : "outline"}
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
                  <div>
                    <h3 className="font-medium mb-3">Condition</h3>
                    <div className="flex flex-wrap gap-2">
                      {conditions.map((condition) => (
                        <Button
                          key={condition}
                          variant={selectedCondition === condition ? "default" : "outline"}
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
          </div>

          {/* Results */}
          {filteredCars.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No cars found matching your criteria.</p>
              <Button onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              {/* Car Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, index) =>
                    typeof page === 'number' ? (
                      <Button
                        key={index}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2 py-1">
                        {page}
                      </span>
                    )
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auctions;