import { 
  BarChart3, 
  Plus, 
  Target, 
  TrendingUp, 
  FileText, 
  User, 
  Lightbulb,
  Home,
  FlaskConical,
  Trophy,
  Bell,
  Clock
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

// Core features menu items
const coreMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Log Emissions", url: "/emissions", icon: Plus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Tips", url: "/tips", icon: Lightbulb },
  { title: "Profile", url: "/profile", icon: User },
];

// Future features - coming soon
const futureMenuItems = [
  { title: "Achievements", url: "/achievements", icon: Trophy, badge: "Soon" },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: "Soon" },
  { title: "Compare", url: "/compare", icon: TrendingUp, badge: "Soon" },
  { title: "What-If Analysis", url: "/what-if", icon: FlaskConical, badge: "Soon" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <SidebarHeader className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <Logo size="md" />
      </SidebarHeader>
      
      <SidebarContent className="bg-white dark:bg-slate-900">
        {/* Core Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 px-3">
            CORE FEATURES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {coreMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 
                      hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200
                      ${location === item.url ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm" : ""}
                    `}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Future Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 px-3 flex items-center gap-2">
            COMING SOON
            <Clock className="w-3 h-3" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {futureMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 opacity-60"
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium flex items-center gap-2">
                        {item.title}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold">
                          {item.badge}
                        </span>
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
              {user?.role === 'individual' ? 'Individual Account' : 
               user?.role === 'company' ? 'Company Account' : 
               user?.role === 'admin' ? 'Admin Account' : 'Account'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 mt-2 rounded-lg"
          onClick={handleLogout}
          data-testid="button-sign-out"
        >
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}