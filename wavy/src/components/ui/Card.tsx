import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#111] border border-white/10 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title }: { title: string }) {
  return (
    <div className="p-4 border-b border-white/10">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
}
