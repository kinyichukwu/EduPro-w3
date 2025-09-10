import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/shared/lib/utils";
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Base styles all buttons share
    let baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    // Variant-specific styles
    const variantStyles = {
      default:
        "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white hover:shadow-md",
      outline: "border border-white/10 hover:bg-dark-accent/30 text-white",
      ghost: "bg-transparent hover:bg-white/5 text-white",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
    };

    // Size-specific styles
    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-10 w-10",
    };

    const buttonStyles = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    return <Comp className={buttonStyles} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
