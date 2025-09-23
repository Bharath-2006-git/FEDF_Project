import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell,
  BellRing,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Mail,
  Smartphone,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2
} from "lucide-react";
import { dashboardAPI } from "@/services/api";

interface Notification {
  id: number;
  type: 'reminder' | 'milestone' | 'tip' | 'alert';
  message: string;
  isRead: boolean;
  scheduledFor: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminders: boolean;
  weeklyReports: boolean;
  goalDeadlines: boolean;
  achievements: boolean;
  tips: boolean;
  emissionAlerts: boolean;
  reminderTime: string;
  reportDay: string;
}

const NOTIFICATION_ICONS = {
  reminder: Clock,
  milestone: Target,
  tip: Award,
  alert: AlertCircle
};

const PRIORITY_COLORS = {
  low: 'bg-chart-2/20 text-chart-2 dark:bg-chart-2/30 dark:text-chart-2',
  medium: 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary',
  high: 'bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive'
};

export default function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    dailyReminders: true,
    weeklyReports: true,
    goalDeadlines: true,
    achievements: true,
    tips: true,
    emissionAlerts: true,
    reminderTime: '09:00',
    reportDay: 'monday'
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await dashboardAPI.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await dashboardAPI.getNotificationSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dashboardAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dashboardAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await dashboardAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean | string) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await dashboardAPI.updateNotificationSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    if (filter !== 'all') return notification.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                  <Bell className="w-8 h-8" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  Stay updated on your environmental progress and goals
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                All ({notifications.length})
              </Button>
              <Button 
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                Unread ({unreadCount})
              </Button>
              <Button 
                variant={filter === 'reminder' ? 'default' : 'outline'}
                onClick={() => setFilter('reminder')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                Reminders
              </Button>
              <Button 
                variant={filter === 'milestone' ? 'default' : 'outline'}
                onClick={() => setFilter('milestone')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                Milestones
              </Button>
              <Button 
                variant={filter === 'tip' ? 'default' : 'outline'}
                onClick={() => setFilter('tip')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                Tips
              </Button>
              <Button 
                variant={filter === 'alert' ? 'default' : 'outline'}
                onClick={() => setFilter('alert')}
                size="sm"
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md"
              >
                Alerts
              </Button>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type];
                
                return (
                  <Card 
                    key={notification.id}
                    className={`relative transition-all duration-200 hover:shadow-lg ${
                      notification.isRead 
                        ? 'bg-white/70 dark:bg-slate-900/70' 
                        : 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    } backdrop-blur-xl border border-white/30 dark:border-slate-700/30`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.isRead 
                            ? 'bg-slate-100 dark:bg-slate-800' 
                            : 'bg-emerald-100 dark:bg-emerald-900/50'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            notification.isRead 
                              ? 'text-slate-500' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${
                              notification.isRead 
                                ? 'text-slate-700 dark:text-slate-300' 
                                : 'text-slate-900 dark:text-slate-100 font-medium'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant="secondary"
                                className={PRIORITY_COLORS[notification.priority]}
                              >
                                {notification.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                              {new Date(notification.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredNotifications.length === 0 && (
                <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30">
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No notifications found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      {filter === 'unread' 
                        ? "You're all caught up! No unread notifications." 
                        : "No notifications match your current filter."
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Delivery Methods</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                </div>

                {/* Content Types */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Content Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Reminders</span>
                    <Switch
                      checked={settings.dailyReminders}
                      onCheckedChange={(checked) => handleSettingChange('dailyReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Reports</span>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Goal Deadlines</span>
                    <Switch
                      checked={settings.goalDeadlines}
                      onCheckedChange={(checked) => handleSettingChange('goalDeadlines', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Achievements</span>
                    <Switch
                      checked={settings.achievements}
                      onCheckedChange={(checked) => handleSettingChange('achievements', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eco Tips</span>
                    <Switch
                      checked={settings.tips}
                      onCheckedChange={(checked) => handleSettingChange('tips', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emission Alerts</span>
                    <Switch
                      checked={settings.emissionAlerts}
                      onCheckedChange={(checked) => handleSettingChange('emissionAlerts', checked)}
                    />
                  </div>
                </div>

                {/* Timing */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Timing</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Daily Reminder Time</label>
                    <Select 
                      value={settings.reminderTime} 
                      onValueChange={(value) => handleSettingChange('reminderTime', value)}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-slate-600 dark:text-slate-300">Weekly Report Day</label>
                    <Select 
                      value={settings.reportDay} 
                      onValueChange={(value) => handleSettingChange('reportDay', value)}
                    >
                      <SelectTrigger className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}