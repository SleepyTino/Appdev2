import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-brand hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
      secondary:
        "bg-slate-800 border border-slate-700/50 text-white hover:bg-slate-700/80 hover:border-slate-600",
      ghost: "text-slate-400 hover:text-white hover:bg-white/5",
      danger:
        "bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500/10",
    };

    const sizes = {
      sm: "px-3 py-2 text-xs",
      md: "px-5 py-3 text-sm",
      lg: "px-6 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold rounded-xl
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
