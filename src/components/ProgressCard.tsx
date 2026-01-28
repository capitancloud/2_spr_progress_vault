import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  column: string;
  variant?: 'default' | 'success' | 'accent' | 'info';
  progress?: number;
  maxProgress?: number;
}

const variantStyles = {
  default: 'border-border/50',
  success: 'border-success/30 gradient-success',
  accent: 'border-accent/30 gradient-accent',
  info: 'border-info/30 gradient-info',
};

const iconStyles = {
  default: 'bg-muted text-foreground',
  success: 'bg-success/20 text-success',
  accent: 'bg-accent/20 text-accent',
  info: 'bg-info/20 text-info',
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  column,
  variant = 'default',
  progress,
  maxProgress,
}) => {
  const showProgress = progress !== undefined && maxProgress !== undefined;
  const progressPercent = showProgress ? Math.min((progress / maxProgress) * 100, 100) : 0;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
      variantStyles[variant]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('rounded-lg p-2', iconStyles[variant])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
        
        {showProgress && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all duration-700 ease-out progress-animated',
                  variant === 'success' && 'bg-success',
                  variant === 'accent' && 'bg-accent',
                  variant === 'info' && 'bg-info',
                  variant === 'default' && 'bg-primary',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {progress} / {maxProgress}
            </p>
          </div>
        )}

        {/* Database column indicator */}
        <div className="mt-4 flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-info animate-pulse-soft" />
          <span className="font-mono text-[10px] text-muted-foreground">
            Colonna: <span className="text-info">{column}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
