import React from "react";
import clsx from "clsx";

interface GlassPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
  variant?: "sky" | "emerald" | "amber" | "rose" | "purple" | "neutral";
  className?: string;
}

export function GlassPill({
  children,
  active = false,
  variant = "sky",
  className,
  ...props
}: GlassPillProps) {
  const variantStyles = {
    sky: active ? "bg-sky-500/25 border-sky-400 text-sky-200" : "hover:bg-white/10",
    emerald: active ? "bg-emerald-500/25 border-emerald-400 text-emerald-200" : "hover:bg-white/10",
    amber: active ? "bg-amber-500/25 border-amber-400 text-amber-200" : "hover:bg-white/10",
    rose: active ? "bg-rose-500/25 border-rose-400 text-rose-200" : "hover:bg-white/10",
    purple: active ? "bg-purple-500/25 border-purple-400 text-purple-200" : "hover:bg-white/10",
    neutral: active ? "bg-white/20 border-white/40 text-white" : "hover:bg-white/10",
  };

  return (
    <button
      className={clsx(
        "glass px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
