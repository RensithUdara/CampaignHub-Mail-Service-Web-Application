import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50 disabled:text-slate-400",
  danger: "bg-red-600 text-white shadow-[0_12px_28px_rgba(220,38,38,0.18)] hover:bg-red-700 disabled:bg-red-300",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", loading, className = "", children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex min-h-10 items-center justify-center gap-2 px-3.5 py-2 text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
        style={{ borderRadius: 8 }}
        {...rest}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
