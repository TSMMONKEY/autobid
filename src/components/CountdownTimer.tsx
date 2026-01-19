import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: Date;
  variant?: "default" | "large";
  compact?: boolean;
}

const CountdownTimer = ({ endTime, variant = "default", compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (variant === "large") {
    return (
      <div className="flex gap-4">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-secondary rounded-lg px-4 py-3 min-w-[70px]">
              <span className="font-display text-3xl font-bold text-primary">
                {pad(item.value)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-2 block">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <span className="font-mono text-xs font-semibold text-foreground">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}
      </span>
    );
  }

  return (
    <span className="font-mono text-sm font-semibold text-foreground">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
};

export default CountdownTimer;
