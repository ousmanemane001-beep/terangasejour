import { useState, useEffect } from "react";

/**
 * Returns true only after `delay` ms of continuous loading.
 * Prevents skeleton flash for fast loads.
 */
export function useDelayedLoading(isLoading: boolean, delay = 300): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }
    const timer = setTimeout(() => setShowSkeleton(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showSkeleton;
}
