"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-velocity/dist/leaflet-velocity.css";
import "leaflet-velocity";

declare const L: any;

interface WindMapProps {
  lat: number;
  lon: number;
}

export function WindMap({ lat, lon }: WindMapProps) {
  const [velocityLayer, setVelocityLayer] = useState<any>(null);
  const position: LatLngExpression = [lat, lon];

  useEffect(() => {
    async function loadWind() {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=u_component_of_wind_10m,v_component_of_wind_10m`
      );
      const data = await res.json();

      // Convert Open-Meteo format to Leaflet-Velocity format
      const times = data.hourly.time;
      const u = data.hourly.u_component_of_wind_10m;
      const v = data.hourly.v_component_of_wind_10m;

      const grid: any = {
        header: {
          parameterCategory: 2,
          parameterNumber: 2,
          nx: 24,
          ny: 24,
          lo1: lon - 1.5,
          la1: lat + 1.5,
          lo2: lon + 1.5,
          la2: lat - 1.5,
          dx: 0.125,
          dy: 0.125,
          refTime: times[0],
        },
        data: [],
      };

      // generate sample grid for Leaflet-Velocity
      for (let i = 0; i < u.length; i++) {
        grid.data.push(u[i]);
        grid.data.push(v[i]);
      }

      if (velocityLayer) velocityLayer.remove();

      const layer = (L as any).velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Global Wind",
          displayPosition: "bottomleft",
          displayEmptyString: "No wind data",
        },
        data: [grid],
        maxVelocity: 30,
      });

      setVelocityLayer(layer);
    }

    loadWind();
  }, [lat, lon]);

  return (
    <div className="rounded-xl overflow-hidden border border-ocean h-[400px] shadow-md">
      <MapContainer
        center={position}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          if (velocityLayer) velocityLayer.addTo(map);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
      </MapContainer>
    </div>
  );
}
