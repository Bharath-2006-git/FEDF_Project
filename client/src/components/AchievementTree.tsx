import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Zap, Leaf, Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  tier: number;
  color: string;
  prereqs?: string[];
}

interface AchievementTreeProps {
  achievements: Achievement[];
  onAchievementClick?: (achievementId: string) => void;
}

export default function AchievementTree({ 
  achievements, 
  onAchievementClick 
}: AchievementTreeProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  // Group achievements by tier
  const achievementsByTier = achievements.reduce((acc, achievement) => {
    const tier = achievement.tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(achievement);
    return acc;
  }, {} as Record<number, Achievement[]>);

  const maxTier = Math.max(...achievements.map(a => a.tier));

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement.id);
    onAchievementClick?.(achievement.id);
    console.log(`Achievement selected: ${achievement.title}`);
  };

  const getConnectionLines = (fromTier: number, toTier: number) => {
    // Simple visual connection between tiers
    return (
      <div className="flex justify-center my-4">
        <div className="flex flex-col items-center">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-4 rounded-full transition-all duration-1000 ${
                fromTier <= toTier ? 'bg-green-400' : 'bg-gray-300'
              }`}
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 border-green-200 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-forest-texture bg-cover bg-center" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl font-bold text-green-900 mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Achievement Tree
          </h3>
          <p className="text-green-700">Unlock rewards by reducing your carbon footprint</p>
        </div>

        {/* Achievement tree */}
        <div className="space-y-2">
          {Array.from({ length: maxTier + 1 }, (_, tierIndex) => {
            const tierAchievements = achievementsByTier[tierIndex] || [];
            
            return (
              <div key={tierIndex}>
                {/* Connection lines to previous tier */}
                {tierIndex > 0 && getConnectionLines(tierIndex - 1, tierIndex)}
                
                {/* Tier header */}
                <div className="text-center mb-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-green-200 text-green-800 font-semibold"
                  >
                    Tier {tierIndex + 1}
                  </Badge>
                </div>
                
                {/* Achievements in this tier */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tierAchievements.map((achievement) => {
                    const IconComponent = achievement.icon;
                    const isSelected = selectedAchievement === achievement.id;
                    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                    
                    return (
                      <Card
                        key={achievement.id}
                        className={`p-4 cursor-pointer transition-all duration-300 hover-elevate ${
                          achievement.unlocked
                            ? `bg-gradient-to-br from-${achievement.color}-50 to-${achievement.color}-100 border-${achievement.color}-300`
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        } ${
                          isSelected ? 'ring-2 ring-green-500 scale-105' : ''
                        }`}
                        onClick={() => handleAchievementClick(achievement)}
                        data-testid={`achievement-${achievement.id}`}
                      >
                        <div className="text-center">
                          {/* Achievement icon */}
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            achievement.unlocked
                              ? `bg-${achievement.color}-200 animate-pulse-gentle`
                              : 'bg-gray-200'
                          }`}>
                            <IconComponent 
                              className={`w-6 h-6 ${
                                achievement.unlocked
                                  ? `text-${achievement.color}-700`
                                  : 'text-gray-500'
                              }`} 
                            />
                          </div>
                          
                          {/* Achievement title */}
                          <h4 className={`font-semibold text-sm mb-2 ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                          
                          {/* Achievement description */}
                          <p className={`text-xs mb-3 ${
                            achievement.unlocked ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                          
                          {/* Progress bar */}
                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-${achievement.color}-400 to-${achievement.color}-600`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-600">
                                {achievement.progress} / {achievement.maxProgress}
                              </p>
                            </div>
                          )}
                          
                          {/* Unlocked badge */}
                          {achievement.unlocked && (
                            <Badge className="bg-green-600 text-white animate-pulse">
                              <Star className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement stats */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-sm text-green-700">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {achievements.filter(a => !a.unlocked && a.progress > 0).length}
              </div>
              <div className="text-sm text-yellow-700">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {achievements.filter(a => a.progress === 0).length}
              </div>
              <div className="text-sm text-gray-700">Locked</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}