import { cn } from "@/shared/lib/utils";
import { FC, ReactNode } from "react";

interface GlassHeaderProps {
  children?: ReactNode;
  className?: string;
  text: string;
  icon?: ReactNode;
}

export const GlassHeader: FC<GlassHeaderProps> = ({
  className,
  text,
  icon,
}) => {
  return (
    <div
      className={cn(
        "font-bold w-fit flex items-center gap-2 rounded-2xl border border-white/10 bg-blue-400/5 pr-6 pl-3 py-2 tracking-[-0.075em] text-xl text-white",
        className
      )}
    >
      {icon}
      {text}
    </div>
  );
};
