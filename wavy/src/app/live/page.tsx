"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { WebcamEmbed } from "@/components/WebcamEmbed";
import { YouTubeEmbed } from "@/components/YoutubeEmbed";
import { Video } from "lucide-react";

export default function LivePage() {
  const { selected, setSelected } = useLocation();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ocean">Live Cams</h1>
          <p className="text-sm text-ocean/60 font-medium">
            Real-time webcam feeds from Miami beaches
          </p>
        </div>

        {/* Live Cams */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-coral" />
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-ocean" />
              <h2 className="text-xl font-bold text-ocean">Live Webcams</h2>
            </div>
          </div>
          <div className="grid gap-6">
            <WebcamEmbed
              title="Key Biscayne Kite Shop Cam"
              src="https://g1.ipcamlive.com/player/player.php?alias=6030787be95a2&autoplay=true"
            />
            <YouTubeEmbed
              title="Coral City Camera"
              videoId="7i8ARjIeM2k"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
