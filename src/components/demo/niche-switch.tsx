"use client";

import { useRef, type KeyboardEvent } from "react";
import { useNiche } from "@/components/niche-context";
import { cx } from "@/components/ui/primitives";
import { nicheOrder, personas, type NicheId } from "@/lib/demo/personas";

export function NicheSwitch({
  onChange,
  disabled,
  className,
}: {
  onChange?: (next: NicheId) => void;
  disabled?: boolean;
  className?: string;
}) {
  const { niche, setNiche } = useNiche();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (next: NicheId) => {
    if (next === niche) return;
    onChange?.(next);
    setNiche(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (index + 1) % nicheOrder.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (index - 1 + nicheOrder.length) % nicheOrder.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = nicheOrder.length - 1;
    select(nicheOrder[nextIndex]);
    refs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Choose a trade"
      className={cx(
        "inline-flex rounded-full border border-line bg-paper-2 p-1",
        disabled && "opacity-60",
        className,
      )}
    >
      {nicheOrder.map((id, i) => {
        const active = id === niche;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            onClick={() => select(id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              "h-8 rounded-full px-4 text-sm font-medium transition-colors duration-150",
              active ? "bg-card text-ink shadow-card" : "text-ink-3 hover:text-ink",
            )}
          >
            {personas[id].label}
          </button>
        );
      })}
    </div>
  );
}
