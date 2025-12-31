"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { WindyEmbed } from "@/components/WindyEmbed";

export default function MapPage() {
  const { selected, setSelected } = useLocation();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">💨 Wind Map</h2>
        <div className="rounded-xl overflow-hidden">
          <WindyEmbed lat={selected.coords.lat} lon={selected.coords.lon} />
        </div>
      </section>
    </Layout>
  );
}

