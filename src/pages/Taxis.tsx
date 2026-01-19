import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Grid3X3, List, ChevronLeft, ChevronRight, AlertTriangle, Users, FileCheck, Loader2 } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { supabase } from "@/integrations/supabase/client";

const Taxis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const taxisPerPage = 20;

  // Fetch taxis from database
  const { data: taxis = [], isLoading } = useQuery({
    queryKey: ['taxis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('vehicle_type', 'taxi')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const makes = useMemo(() => {
    const uniqueMakes = [...new Set(taxis.map(taxi => taxi.make))];
    return uniqueMakes.sort();
  }, [taxis]);

  const filteredTaxis = useMemo(() => {
    return taxis.filter(taxi => {
      const matchesSearch = 
        taxi.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        taxi.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMake = selectedMake === "all" || taxi.make === selectedMake;
      const matchesCondition = selectedCondition === "all" || taxi.condition === selectedCondition;
      return matchesSearch && matchesMake && matchesCondition;
    });
  }, [taxis, searchQuery, selectedMake, selectedCondition]);

  const totalPages = Math.ceil(filteredTaxis.length / taxisPerPage);
  const paginatedTaxis = filteredTaxis.slice(
    (currentPage - 1) * taxisPerPage,
    currentPage * taxisPerPage
  );

  const getConditionBadge = (condition: string | null) => {
    const styles: Record<string, string> = {
      excellent: "bg-green-500/20 text-green-700 border-green-500/30",
      good: "bg-blue-500/20 text-blue-700 border-blue-500/30",
      fair: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      crashed: "bg-orange-500/20 text-orange-700 border-orange-500/30",
      salvage: "bg-red-500/20 text-red-700 border-red-500/30",
    };
    return styles[condition || 'fair'] || styles.fair;
  };

  return (
    <Layout>
      <Helmet>
        <title>Taxis for Sale | AutoBid SA - Minibus Taxi Auctions</title>
        <meta name="description" content="Buy minibus taxis at auction in South Africa. Toyota Quantum, Nissan Impendulo, and more. Find crashed and running taxis in Johannesburg and Pretoria." />
      </Helmet>

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Taxis <span className="text-primary">For Sale</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Find minibus taxis from Toyota Quantum to Nissan Impendulo. Crashed and running vehicles available.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl p-4 mb-6 border border-border shadow-card">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search taxis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">All Makes</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>

                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">All Conditions</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="crashed">Crashed</option>
                  <option value="salvage">Salvage</option>
                </select>

                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading taxis...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && taxis.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No taxis available yet.</p>
              <p className="text-muted-foreground text-sm mt-2">Check back soon for new listings!</p>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && taxis.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground text-sm">
                  Showing {paginatedTaxis.length} of {filteredTaxis.length} taxis
                </p>
                <p className="text-muted-foreground text-sm">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </p>
              </div>

              {/* Taxis Grid */}
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1"}`}>
                {paginatedTaxis.map((taxi) => (
                  <Link
                    key={taxi.id}
                    to={`/taxi/${taxi.id}`}
                    className={`group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover-lift shadow-card ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[4/3]"}`}>
                      <img
                        src={taxi.image}
                        alt={`${taxi.year} ${taxi.make} ${taxi.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Condition Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`${getConditionBadge(taxi.condition)} text-xs`}>
                          {(taxi.condition === "crashed" || taxi.condition === "salvage") && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {taxi.condition || 'fair'}
                        </Badge>
                      </div>

                      {/* Live Badge */}
                      {taxi.is_live && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white text-xs animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`p-3 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {taxi.year} {taxi.make} {taxi.model}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{taxi.mileage.toLocaleString()} km</span>
                          <span>•</span>
                          <span>{taxi.location}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Bid</p>
                            <p className="font-bold text-primary text-sm">
                              R {taxi.current_bid.toLocaleString("en-ZA")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Ends in</p>
                            <CountdownTimer endTime={new Date(taxi.end_time)} compact />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "green" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

export default Taxis;
