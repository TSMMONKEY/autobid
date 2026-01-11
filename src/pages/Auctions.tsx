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
          {/* Rest of your JSX */}
        </div>
      </div>
    </Layout>
  );
};

export default Auctions;