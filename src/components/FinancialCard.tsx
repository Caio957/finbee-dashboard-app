
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  value: string;
  type?: "income" | "expense" | "neutral";
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function FinancialCard({ 
  title, 
  value, 
  type = "neutral", 
  icon, 
  subtitle,
  className 
}: FinancialCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          type === "income" && "text-green-600",
          type === "expense" && "text-red-600"
        )}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
