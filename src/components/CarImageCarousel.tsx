import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarImageCarouselProps {
  images: string[];
  alt: string;
  autoScrollInterval?: number;
}

const CarImageCarousel = ({ images, alt, autoScrollInterval = 3000 }: CarImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-scroll only on hover
  useEffect(() => {
    if (images.length <= 1 || !isHovered) return;

    const interval = setInterval(nextSlide, autoScrollInterval);
    return () => clearInterval(interval);
  }, [images.length, isHovered, nextSlide, autoScrollInterval]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-xs">No image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    );
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Images */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${alt} - ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next image"
      >
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarImageCarousel;
