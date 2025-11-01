import { 
  BarChart3, 
  Plus, 
  Target, 
  FileText, 
  User, 
  Lightbulb,
  Home
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

// Navigation menu items
const coreMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Log Emissions", url: "/emissions", icon: Plus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Tips", url: "/tips", icon: Lightbulb },
  { title: "Profile", url: "/profile", icon: User },
];

// Future features removed - all core features are now available

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
      
      <SidebarContent className="bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
        {/* Navigation Menu */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 px-3">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {coreMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 
                      hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 py-2.5 h-auto
                      ${location === item.url ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm" : ""}
                    `}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Carbon Impact Card */}
        <div className="px-4 pb-3 mt-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800/30 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <span className="text-base">🌱</span>
              </div>
              <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Your Impact
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
              Every small action counts towards a greener future
            </p>
          </div>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <Avatar className="w-9 h-9">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
              {user?.role === 'individual' ? 'Individual' : 
               user?.role === 'company' ? 'Company' : 
               user?.role === 'admin' ? 'Admin' : 'Account'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 mt-1.5 rounded-lg h-9"
          onClick={handleLogout}
          data-testid="button-sign-out"
        >
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}