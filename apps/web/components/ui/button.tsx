import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  }
>;

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink text-dawn hover:bg-[#202a46]",
        variant === "secondary" && "bg-sea text-white hover:bg-[#3b7185]",
        variant === "ghost" && "bg-white/0 text-ink hover:bg-white/20",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
