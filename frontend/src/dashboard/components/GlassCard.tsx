import { cn } from "@/shared/lib/utils";
import { FC } from "react";
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border-1 border-purple/20 flex flex-col bg-purple/10 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
};
