import React from "react";
import { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function ComingSoonPage({ 
  title, 
  description,
  icon: Icon 
}: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="text-center">
        {Icon && (
          <div className="flex justify-center mb-4">
            <Icon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Coming Soon
        </p>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}