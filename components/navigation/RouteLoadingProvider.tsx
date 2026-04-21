// components/navigation/RouteLoadingProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type RouteLoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(
  undefined
);

export function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startLoading = useCallback(() => {
    clearExistingTimeout();
    setIsLoading(true);

    // Safety fallback in case navigation never completes
    timeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
    }, 8000);
  }, []);

  const stopLoading = useCallback(() => {
    clearExistingTimeout();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Whenever route or query changes, navigation has completed
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
    }),
    [isLoading, startLoading, stopLoading]
  );

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);

  if (!context) {
    throw new Error(
      "useRouteLoading must be used inside RouteLoadingProvider"
    );
  }

  return context;
}