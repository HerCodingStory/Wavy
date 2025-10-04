import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export function WebcamCard({ title, href }: { title: string; href: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <p className="text-sm text-white/70 mb-2">
          Watch the live stream directly on the official site.
        </p>
        <a
          href={href}
          target="_blank"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand.aqua/20 hover:bg-brand.aqua/30 transition-colors text-brand.aqua text-sm font-medium"
        >
          Open live cam →
        </a>
      </CardBody>
    </Card>
  );
}
