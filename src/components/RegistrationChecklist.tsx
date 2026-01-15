import { Link } from "react-router-dom";
import { Check, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRegistrationStatus } from "@/hooks/useRegistrationStatus";

interface RegistrationChecklistProps {
  showCard?: boolean;
  compact?: boolean;
}

const RegistrationChecklist = ({ showCard = true, compact = false }: RegistrationChecklistProps) => {
  const { completionItems, loading, isComplete } = useRegistrationStatus();

  if (loading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (isComplete) {
    return null;
  }

  const content = (
    <div className={`space-y-${compact ? "2" : "3"}`}>
      {completionItems.map((item) => (
        <div
          key={item.key}
          className={`flex items-center gap-3 ${compact ? "text-sm" : ""} ${
            item.complete ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {item.complete ? (
            <Check className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-green-500`} />
          ) : (
            <X className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-destructive`} />
          )}
          <span className={item.complete ? "line-through" : "font-medium"}>
            {item.label}
          </span>
        </div>
      ))}
      {!compact && (
        <Link to="/profile">
          <Button className="w-full mt-4" variant="default">
            Complete Registration
          </Button>
        </Link>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-lg">Complete Your Registration</CardTitle>
        </div>
        <CardDescription>
          Complete the following steps to start bidding on vehicles
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default RegistrationChecklist;
