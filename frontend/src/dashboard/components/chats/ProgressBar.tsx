import { Progress } from '@/shared/components/ui/progress';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  value, 
  className = "", 
  showLabel = true, 
  label 
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-white/60">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <Progress 
        value={clampedValue} 
        className="h-2 bg-white/10"
      />
    </div>
  );
}
