import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      max = 100,
      className = "",
      indicatorClassName = "bg-gradient-to-r from-turbo-purple to-turbo-indigo",
      ...props
    },
    ref
  ) => {
    const percentage = (Math.min(Math.max(0, value), max) / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={`relative w-full overflow-hidden rounded-full bg-dark-accent/30 ${className}`}
        {...props}
      >
        <div
          className={`h-full w-full flex-1 transition-all ${indicatorClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
