import { ReactNode } from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-foam/90 border border-ocean/10 rounded-2xl shadow-md hover:shadow-lg transition-all p-4 text-ocean">
      {children}
    </div>
  );
}

export function CardHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-brand-ocean mb-2">{title}</h2>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="text-brand-ocean/90 text-sm">{children}</div>;
}

