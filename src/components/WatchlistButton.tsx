import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  vehicleId: string;
  variant?: "icon" | "full";
  className?: string;
}

const WatchlistButton = ({
  vehicleId,
  variant = "icon",
  className,
}: WatchlistButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist(user?.id);
  const navigate = useNavigate();

  const isWatched = isInWatchlist(vehicleId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    await toggleWatchlist(vehicleId);
    setLoading(false);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "p-2 rounded-full transition-all",
          isWatched
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-background",
          className
        )}
        aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Heart
            className={cn("w-5 h-5", isWatched && "fill-current")}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isWatched ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn("mr-2 h-4 w-4", isWatched && "fill-current")}
        />
      )}
      {isWatched ? "Watching" : "Add to Watchlist"}
    </Button>
  );
};

export default WatchlistButton;
