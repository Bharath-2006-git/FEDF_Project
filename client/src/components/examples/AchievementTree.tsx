import AchievementTree from '../AchievementTree'
import { Trophy, Star, Target, Zap, Leaf, Award, Recycle, Car } from "lucide-react";

export default function AchievementTreeExample() {
  // Mock achievements data
  const mockAchievements = [
    // Tier 0 (Beginner)
    {
      id: "first-entry",
      title: "First Steps",
      description: "Log your first carbon emission entry",
      icon: Leaf,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      tier: 0,
      color: "green"
    },
    {
      id: "week-streak",
      title: "Week Warrior",
      description: "Log emissions for 7 consecutive days",
      icon: Target,
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      tier: 0,
      color: "blue"
    },
    
    // Tier 1 (Intermediate) 
    {
      id: "transport-saver",
      title: "Transport Hero",
      description: "Reduce transport emissions by 20%",
      icon: Car,
      unlocked: false,
      progress: 12,
      maxProgress: 20,
      tier: 1,
      color: "purple"
    },
    {
      id: "energy-efficient",
      title: "Energy Saver",
      description: "Achieve 15% energy reduction",
      icon: Zap,
      unlocked: false,
      progress: 8,
      maxProgress: 15,
      tier: 1,
      color: "yellow"
    },
    
    // Tier 2 (Advanced)
    {
      id: "carbon-neutral",
      title: "Carbon Neutral",
      description: "Achieve net-zero emissions for a month",
      icon: Award,
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      tier: 2,
      color: "emerald"
    },
    {
      id: "eco-champion",
      title: "Eco Champion",
      description: "Maintain 50% total reduction for 6 months",
      icon: Trophy,
      unlocked: false,
      progress: 0,
      maxProgress: 180,
      tier: 2,
      color: "gold"
    }
  ];

  return (
    <div className="p-4">
      <AchievementTree 
        achievements={mockAchievements}
        onAchievementClick={(id) => console.log("Achievement clicked:", id)}
      />
    </div>
  )
}