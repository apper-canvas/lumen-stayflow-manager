import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "default", 
  children,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary/20",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200",
    accent: "bg-accent text-white hover:bg-amber-600 focus:ring-accent/20",
    success: "bg-success text-white hover:bg-green-700 focus:ring-success/20",
    warning: "bg-warning text-white hover:bg-yellow-600 focus:ring-warning/20",
    error: "bg-error text-white hover:bg-red-700 focus:ring-error/20",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;