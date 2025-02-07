// TourContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type TourContextType = {
  isTourOpen: boolean;
  startTour: () => void;
  endTour: () => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = () => setIsTourOpen(true);
  const endTour = () => setIsTourOpen(false);

  return <TourContext.Provider value={{ isTourOpen, startTour, endTour }}>{children}</TourContext.Provider>;
}

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};
