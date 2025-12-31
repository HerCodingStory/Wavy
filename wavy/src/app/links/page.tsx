"use client";

import { Layout } from "@/components/Layout";
import { useLocation } from "@/contexts/LocationContext";

export default function LinksPage() {
  const { selected, setSelected } = useLocation();

  return (
    <Layout selectedLocation={selected} onLocationChange={setSelected}>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">🔗 Useful Links</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://keybiscayne.fl.gov/uniquely_kb/kb_beach_cam.php"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Key Biscayne Beach Cam
            </a>
          </div>

          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=4"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://www.miamiandbeaches.com/plan-your-trip/miami-webcams?wc=4"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Miami Beach Live Cams
            </a>
          </div>

          <div className="bg-ocean/5 rounded-xl overflow-hidden">
            <iframe
              src="https://sunnyislesbeachmiami.com/beach-cam/"
              className="w-full h-[220px] sm:h-[250px] border-0 scale-[0.9] origin-top"
            />
            <a
              href="https://sunnyislesbeachmiami.com/beach-cam/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-ocean py-2 bg-sand hover:underline"
            >
              Sunny Isles – Newport Pier
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

