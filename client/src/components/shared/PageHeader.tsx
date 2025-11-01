import { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              {icon}
              {title}
            </h1>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
