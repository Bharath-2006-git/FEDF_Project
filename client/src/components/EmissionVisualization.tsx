import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import particlesImage from "@assets/generated_images/Carbon_emission_particles_visualization_7651d1ae.png";

interface EmissionData {
  category: string;
  amount: number;
  color: string;
  particles: number;
}

interface EmissionVisualizationProps {
  data: EmissionData[];
  isAnimated?: boolean;
}

export default function EmissionVisualization({ 
  data, 
  isAnimated = true 
}: EmissionVisualizationProps) {
  const [isPlaying, setIsPlaying] = useState(isAnimated);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 8);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const totalEmissions = data.reduce((sum, item) => sum + item.amount, 0);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log(`Emission visualization ${isPlaying ? 'paused' : 'playing'}`);
  };

  const handleReset = () => {
    setAnimationPhase(0);
    setIsPlaying(false);
    console.log("Emission visualization reset");
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 overflow-hidden relative">
      {/* Background particle effect */}
      <div 
        className={`absolute inset-0 opacity-30 transition-all duration-1000 ${
          isPlaying ? 'animate-pulse-gentle' : ''
        }`}
        style={{ 
          backgroundImage: `url(${particlesImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px)'
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-white">
            Carbon Emission Flow
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              data-testid="button-visualization-play-pause"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              data-testid="button-visualization-reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Total emission display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">
            {totalEmissions.toFixed(1)}
            <span className="text-lg text-gray-300 ml-2">kg CO₂</span>
          </div>
          <p className="text-gray-400">Total Monthly Emissions</p>
        </div>

        {/* Particle visualization */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {data.map((item, index) => {
            const intensity = (item.amount / totalEmissions) * 100;
            const particleCount = Math.ceil(intensity / 10);
            
            return (
              <div
                key={item.category}
                className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                data-testid={`emission-category-${item.category.toLowerCase()}`}
              >
                <div className="relative h-16 mb-3 flex items-end justify-center">
                  {/* Animated particles */}
                  {Array.from({ length: particleCount }, (_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full transition-all duration-1000 ${
                        isPlaying ? 'animate-float' : ''
                      }`}
                      style={{
                        backgroundColor: item.color,
                        left: `${20 + (i * 10)}%`,
                        bottom: `${(i % 3) * 20}px`,
                        opacity: isPlaying ? 0.7 + (animationPhase % 4) * 0.1 : 0.5,
                        animationDelay: `${i * 200}ms`,
                        boxShadow: `0 0 10px ${item.color}50`
                      }}
                    />
                  ))}
                </div>
                
                <h4 className="text-white font-medium text-sm mb-1">
                  {item.category}
                </h4>
                <p className="text-gray-300 text-xs">
                  {item.amount.toFixed(1)} kg
                </p>
                <div 
                  className={`w-full h-1 rounded-full mt-2 transition-all duration-500 ${
                    isPlaying ? 'opacity-100' : 'opacity-50'
                  }`}
                  style={{ backgroundColor: item.color }}
                >
                  <div
                    className="h-full rounded-full bg-white/30 transition-all duration-1000"
                    style={{ 
                      width: isPlaying ? `${intensity}%` : '0%',
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance indicator */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
            totalEmissions < 100 
              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
              : totalEmissions < 200
                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                : 'bg-red-600/20 text-red-400 border border-red-600/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPlaying ? 'animate-pulse' : ''
            } ${
              totalEmissions < 100 ? 'bg-green-400' : totalEmissions < 200 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              {totalEmissions < 100 ? 'Excellent Performance' 
               : totalEmissions < 200 ? 'Good Progress' 
               : 'Needs Improvement'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}