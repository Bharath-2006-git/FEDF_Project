import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  iconGradient: string;
  footer?: ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  iconGradient,
  footer 
}: StatCardProps) {
  return (
    <Card className={`group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl ${gradient} shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 transition-colors duration-300 ease-in-out">
        <div>
          <p className="text-sm font-bold tracking-wide transition-colors duration-300 ease-in-out">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 ease-in-out">{subtitle}</p>
        </div>
        <div className={`w-14 h-14 ${iconGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
          <Icon className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" />
        </div>
      </CardHeader>
      {footer && (
        <CardContent className="transition-colors duration-300 ease-in-out">
          {footer}
        </CardContent>
      )}
    </Card>
  );
}
