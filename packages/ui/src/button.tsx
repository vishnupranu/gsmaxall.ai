import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Minimal themable button driven by CSS variables from styles.css. */
export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return <button {...rest} className={`gs-btn gs-btn--${variant} ${className}`.trim()} />;
}
