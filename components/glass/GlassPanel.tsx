import React from "react";
import clsx from "clsx";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function GlassPanel({
  children,
  elevation = 4,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl border border-white/10 text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
