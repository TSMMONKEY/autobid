// In components/FeaturedAuctions.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import CarCard from './CarCard';
import { useCars } from '@/hooks/useCars';

const FeaturedAuctions = () => {
  const { 
    featuredCars, 
    isLoading, 
    isError, 
    error, 
    refetch,
    cars 
  } = useCars();
  
  // If no featured cars, show the first 3 regular cars
  const displayedCars = featuredCars.length > 0 
    ? featuredCars.slice(0, 10) 
    : (cars?.slice(0, 10) || []);

  console.log('Featured cars:', featuredCars);
  console.log('All cars:', cars);
  console.log('Displayed cars:', displayedCars);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold mb-4 md:mb-0">Featured Auctions</h2>
          <Link to="/auctions">
            <Button variant="outline" className="flex items-center gap-2">
              View All Auctions <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Failed to load featured cars</div>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        ) : displayedCars.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No cars available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAuctions;