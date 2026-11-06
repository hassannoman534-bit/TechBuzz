"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type GlassFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
  /** Shown under the field and tied to it with aria-describedby */
  error?: string;
  placeholder?: string;
  className?: string;
};

/**
 * Glass input with a floating label. The label sits inside the field and lifts and shrinks
 * (transform only) on focus or when filled. Focus draws an ion line from the left and lights
 * the rim. The textarea grows with its content.
 */
export function GlassField({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  textarea,
  error,
  placeholder,
  className,
}: GlassFieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const area = useRef<HTMLTextAreaElement>(null);

  // grow the textarea to fit (on value change only, not per frame)
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [value]);

  const shared = {
    id,
    name,
    value,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errId : undefined,
    placeholder: placeholder ?? " ",
    className: cn(
      "peer block w-full bg-transparent px-4 pb-2.5 pt-6 text-[1rem] text-white outline-none",
      "placeholder:text-transparent focus:placeholder:text-white/30",
    ),
  };

  return (
    <div className={cn("group/field relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white/[0.035] ring-1 transition-[box-shadow,background-color] duration-500",
          "focus-within:bg-white/[0.055] focus-within:ring-[#7b61ff]/60 hover:bg-white/[0.045]",
          error ? "ring-[#ff6b8b]/70" : "ring-white/10",
        )}
      >
        {textarea ? (
          <textarea ref={area} rows={4} {...shared} onChange={(e) => onChange(e.target.value)} className={cn(shared.className, "min-h-[8.5rem] resize-none")} />
        ) : (
          <input type={type} autoComplete={autoComplete} {...shared} onChange={(e) => onChange(e.target.value)} />
        )}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-[1.05rem] origin-left whitespace-nowrap text-[1rem] text-white/50",
            "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "peer-focus:-translate-y-[0.7rem] peer-focus:scale-[0.78] peer-focus:text-[#c9c2ff]",
            "peer-[:not(:placeholder-shown)]:-translate-y-[0.7rem] peer-[:not(:placeholder-shown)]:scale-[0.78]",
          )}
        >
          {label}
          {required && <span className="text-[#7ce9ff]"> *</span>}
        </label>
        {/* focus line */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#7b61ff,#22d8ff)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within/field:scale-x-100"
        />
      </div>
      {error && (
        <p id={errId} className="mt-1.5 pl-1 text-[0.85rem] text-[#ff8fa6]">
          {error}
        </p>
      )}
    </div>
  );
}
