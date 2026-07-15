"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "button";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50",

        {
          "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:-translate-y-1 hover:shadow-orange-300/40":
            variant === "primary",

          "bg-white/80 backdrop-blur-xl border border-orange-100 text-slate-700 hover:border-orange-300 hover:bg-orange-50":
            variant === "secondary",

          "border border-orange-200 bg-transparent text-orange-600 hover:bg-orange-50":
            variant === "outline",

          "bg-transparent text-slate-700 hover:bg-orange-50":
            variant === "ghost",

          "px-4 py-2 text-sm": size === "sm",
          "px-6 py-3 text-base": size === "md",
          "px-8 py-4 text-lg": size === "lg",
        },

        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}