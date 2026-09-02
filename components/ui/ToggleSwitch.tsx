import React from "react";
import clsx from "clsx";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleSwitchProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors duration-200 select-none flex items-center px-[2px]",
        checked ? "bg-[#A8C7FA]" : "bg-[#444746]",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {/* If not checked, we often have a dark border and inner thumb. For simplicity, we just change bg. */}
      <div
        className={clsx(
          "w-[20px] h-[20px] rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center",
          checked
            ? "translate-x-[20px] bg-[#0842A0]"
            : "translate-x-0 bg-[#C4C7C5]"
        )}
      >
        {/* Optional MD3 checked icon inside thumb */}
        {checked && (
          <span className="material-symbols-rounded text-[#A8C7FA]" style={{ fontSize: '14px', fontVariationSettings: "'wght' 600" }}>
            check
          </span>
        )}
      </div>
    </div>
  );
}
