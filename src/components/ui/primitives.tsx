import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

/** Small uppercase label above section headings. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase", className)}>
      {children}
    </p>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] active:translate-y-px",
  secondary: "bg-card text-ink border border-line hover:border-line-2 hover:bg-white",
  ghost: "text-ink-2 hover:text-ink hover:bg-paper-2",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "lg" = "md") {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background,color,border,transform] duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
    size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-4 text-sm",
    buttonStyles[variant],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: "md" | "lg" }) {
  return <button type="button" className={cx(buttonClass(variant, size), className)} {...props} />;
}

