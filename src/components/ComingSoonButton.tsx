"use client";

import { Sparkles } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { jakarta } from "@/lib/fonts";

interface ComingSoonButtonProps {
  className?: string;
  message?: string;
  children: React.ReactNode;
}

// Fixed id so repeated clicks don't stack duplicate toasts
const TOAST_ID = "coming-soon";

// Site palette: cream card, dark text, amber accent (matches the home page cards)
const toastTheme = {
  "--toastify-color-light": "#fdf0dc",
  "--toastify-text-color-light": "#111827",
  "--toastify-color-info": "#C9822B",
  "--toastify-color-progress-info": "#C9822B",
  "--toastify-toast-bd-radius": "16px",
  "--toastify-font-family": jakarta.style.fontFamily,
} as React.CSSProperties;

export default function ComingSoonButton({
  className,
  message = "This feature is coming soon! Stay tuned.",
  children,
}: ComingSoonButtonProps) {
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() =>
          toast.info(message, {
            toastId: TOAST_ID,
            icon: <Sparkles className="h-5 w-5 text-[#C9822B]" />,
            className: "border border-[#f5c26b] font-semibold text-sm shadow-[0_8px_30px_rgba(17,24,39,0.10)]",
          })
        }
      >
        {children}
      </button>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="light" style={toastTheme} />
    </>
  );
}
