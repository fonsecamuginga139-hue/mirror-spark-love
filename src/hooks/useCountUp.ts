import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
}

export const useCountUp = (
  targetValue: number,
  options: UseCountUpOptions = {}
) => {
  const { duration = 1000, decimals = 2 } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return Number(displayValue.toFixed(decimals));
};
