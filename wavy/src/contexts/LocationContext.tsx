"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { locations } from "@/lib/sources";

interface LocationContextType {
  selected: typeof locations[0];
  setSelected: (location: typeof locations[0]) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(locations[0]);

  return (
    <LocationContext.Provider value={{ selected, setSelected }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

