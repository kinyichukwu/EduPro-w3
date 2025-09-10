import { cn } from "@/shared/lib/utils";
import { FC, ReactNode } from "react";

interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

export const BaseComponent: FC<BaseComponentProps> = ({
  children,
  className,
}) => {
  return <div className={cn("", className)}>{children}</div>;
};
