import React from "react";
import clsx from "clsx";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  active = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl p-3.5 transition-all duration-200",
        active
          ? "bg-sky-950/40 border border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
