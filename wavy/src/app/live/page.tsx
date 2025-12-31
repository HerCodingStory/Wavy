"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";
import { WebcamEmbed } from "@/components/WebcamEmbed";
import { YouTubeEmbed } from "@/components/YoutubeEmbed";

export default function LivePage() {
  const { selected, setSelected } = useLocation();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🎥 Live Beach Cams</h2>
        <div className="grid gap-6">
          <WebcamEmbed
            title="Key Biscayne Kite Shop Cam"
            src="https://g1.ipcamlive.com/player/player.php?alias=6030787be95a2&autoplay=true"
          />
          <YouTubeEmbed title="Coral City Camera" videoId="7i8ARjIeM2k" />
        </div>
      </section>
    </Layout>
  );
}

