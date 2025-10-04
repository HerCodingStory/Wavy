import { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-foam/80 border border-ocean/10 rounded-2xl shadow-md p-4",
        className
      )}
    >
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

