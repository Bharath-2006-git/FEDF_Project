// Common gradient and styling patterns used across the application

export const gradients = {
  page: {
    light: "from-slate-50 via-white to-slate-100",
    dark: "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
    full: "bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
  },
  header: {
    overlay: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5",
    card: "bg-white/70 dark:bg-slate-900/70"
  },
  stats: {
    red: "bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-950/50 dark:to-red-900/40 border border-red-200/50 dark:border-red-800/50",
    blue: "bg-gradient-to-br from-blue-50/90 to-cyan-100/90 dark:from-blue-950/50 dark:to-cyan-900/40 border border-blue-200/50 dark:border-blue-800/50",
    teal: "bg-gradient-to-br from-teal-50/90 to-green-100/90 dark:from-teal-950/50 dark:to-green-900/40 border border-teal-200/50 dark:border-teal-800/50",
    cyan: "bg-gradient-to-br from-cyan-50/90 to-emerald-100/90 dark:from-cyan-950/50 dark:to-emerald-900/40 border border-cyan-200/50 dark:border-cyan-800/50",
    emerald: "bg-gradient-to-br from-emerald-50/90 to-teal-100/90 dark:from-emerald-950/50 dark:to-teal-900/40 border border-emerald-200/50 dark:border-emerald-800/50"
  },
  icons: {
    red: "bg-gradient-to-br from-red-500 to-red-600",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-600",
    teal: "bg-gradient-to-br from-teal-500 to-green-600",
    cyan: "bg-gradient-to-br from-cyan-500 to-emerald-600",
    emerald: "bg-gradient-to-br from-emerald-600 to-emerald-700"
  },
  buttons: {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
    secondary: "border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
  }
};

export const cardStyles = {
  base: "bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500",
  elevated: "bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden",
  border: "border border-white/30 dark:border-slate-700/30"
};

export const textStyles = {
  heading: "text-3xl font-bold text-slate-900 dark:text-slate-100",
  subheading: "text-lg font-medium text-slate-600 dark:text-slate-300",
  muted: "text-slate-500 dark:text-slate-400"
};

export const transitionStyles = {
  colors: "transition-colors duration-300 ease-in-out",
  all: "transition-all duration-300 ease-in-out",
  transform: "transition-transform duration-300 ease-in-out"
};
