import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { 
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Leaf,
  Calendar,
  TrendingUp,
  Medal,
  Crown,
  Flame,
  CheckCircle
} from "lucide-react";
import { dashboardAPI } from "@/services/api";

interface Achievement {
  id: number;
  achievementType: string;
  title: string;
  description: string;
  badgeIcon: string;
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
  isUnlocked: boolean;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  rank: string;
  nextRankPoints: number;
}

const ACHIEVEMENT_ICONS: Record<string, React.ComponentType<any>> = {
  goal_completed: Trophy,
  streak: Flame,
  reduction: TrendingUp,
  milestone: Star,
  consistency: Calendar,
  eco_warrior: Leaf,
  champion: Crown,
  progress: Target
};

const RANK_COLORS: Record<string, string> = {
  Beginner: 'bg-muted-foreground',
  Bronze: 'bg-chart-1/60',
  Silver: 'bg-chart-2/70', 
  Gold: 'bg-chart-1/80',
  Platinum: 'bg-chart-2',
  Diamond: 'bg-primary',
  Champion: 'bg-gradient-to-r from-primary to-chart-2'
};

export default function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsRes, statsRes] = await Promise.all([
        dashboardAPI.getUserAchievements(),
        dashboardAPI.getAchievementStats()
      ]);
      
      setAchievements(achievementsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    return true;
  });

  const getRankProgress = () => {
    if (!stats) return 0;
    return ((stats.totalPoints || 0) / (stats.nextRankPoints || 1)) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 rounded-3xl blur-3xl opacity-75"></div>
          <div className="relative bg-card/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  Achievements & Progress
                </h1>
                <p className="text-lg font-medium text-muted-foreground">
                  Track your environmental impact journey and unlock rewards
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-sm text-muted-foreground">Keep going!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/70 backdrop-blur-xl border border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground">
                {((stats?.nextRankPoints || 0) - (stats?.totalPoints || 0))} to next rank
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.currentStreak || 0} days</div>
              <p className="text-xs text-muted-foreground">
                Best: {stats?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.unlockedAchievements || 0}/{stats?.totalAchievements || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {((stats?.unlockedAchievements || 0) / (stats?.totalAchievements || 1) * 100).toFixed(0)}% complete
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Medal className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${RANK_COLORS[stats?.rank || 'Beginner']}`} />
                <span className="text-xl font-bold">{stats?.rank || 'Beginner'}</span>
              </div>
              <Progress value={getRankProgress()} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="bg-card/70 backdrop-blur-md border-card-border"
          >
            All ({achievements.length})
          </Button>
          <Button 
            variant={filter === 'unlocked' ? 'default' : 'outline'}
            onClick={() => setFilter('unlocked')}
            className="bg-card/70 backdrop-blur-md border-card-border"
          >
            Unlocked ({achievements.filter(a => a.isUnlocked).length})
          </Button>
          <Button 
            variant={filter === 'locked' ? 'default' : 'outline'}
            onClick={() => setFilter('locked')}
            className="bg-card/70 backdrop-blur-md border-card-border"
          >
            Locked ({achievements.filter(a => !a.isUnlocked).length})
          </Button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const IconComponent = ACHIEVEMENT_ICONS[achievement.achievementType] || Award;
            const isUnlocked = achievement.isUnlocked;
            
            return (
              <Card 
                key={achievement.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isUnlocked 
                    ? 'bg-primary/5 border-primary/20 backdrop-blur-xl' 
                    : 'bg-card/70 border-card-border backdrop-blur-xl'
                }`}
              >
                {/* Unlock Effect */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 rounded-full ${
                    isUnlocked 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className={`text-lg ${isUnlocked ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className={`text-sm mb-4 ${isUnlocked ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {isUnlocked && achievement.unlockedAt && (
                    <div className="mt-4 p-2 bg-primary/10 rounded-lg">
                      <p className="text-xs text-primary">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {!isUnlocked && (
                    <Badge 
                      variant="secondary" 
                      className="bg-muted text-muted-foreground"
                    >
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <Card className="bg-card/70 backdrop-blur-xl border border-card-border">
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No achievements found
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unlocked' 
                  ? "Start tracking your emissions to unlock your first achievement!" 
                  : "Keep working towards your environmental goals to unlock more achievements."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}