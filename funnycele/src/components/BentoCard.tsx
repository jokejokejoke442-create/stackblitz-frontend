import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface BentoCardProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  gradient?: string;
  children?: ReactNode;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function BentoCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient = "bg-gradient-primary",
  children,
  className = "",
  trend
}: BentoCardProps) {
  return (
    <div className={`glass-card rounded-3xl p-6 hover-float shadow-soft ${className}`}>
      {(title || Icon) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>}
            {value && <p className="text-4xl font-bold">{value}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    trend.isPositive 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`h-14 w-14 rounded-2xl ${gradient} flex items-center justify-center shadow-primary`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
