import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, Zap, Wind, Users } from "lucide-react";
import heroImage from "@assets/generated_images/Renewable_energy_hero_landscape_5081305b.png";

export default function HeroSection() {
  const [isAnimated, setIsAnimated] = useState(false);

  return (
    <section className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
             style={{ backgroundImage: `url(${heroImage})` }}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      
      {/* Floating particles overlay */}
      <div className="absolute inset-0 bg-particles bg-cover bg-center opacity-20 animate-pulse-gentle" />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading with environmental theme */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 animate-slide-up">
            Track Your
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Carbon Footprint
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-slide-up [animation-delay:200ms]">
            Experience a fresh approach to environmental impact tracking with immersive visualizations and gamified sustainability goals.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up [animation-delay:400ms]">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold backdrop-blur-sm border border-green-500"
              onClick={() => {
                setIsAnimated(true);
                console.log("Get Started clicked");
              }}
              data-testid="button-get-started"
            >
              <Leaf className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg"
              onClick={() => console.log("Learn More clicked")}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up [animation-delay:600ms]">
            {[
              { icon: Leaf, label: "Carbon Tracking", desc: "Real-time monitoring" },
              { icon: Zap, label: "Smart Insights", desc: "AI-powered tips" },
              { icon: Wind, label: "Impact Visualization", desc: "3D particle effects" },
              { icon: Users, label: "Team Collaboration", desc: "Company dashboards" }
            ].map(({ icon: Icon, label, desc }, index) => (
              <Card 
                key={label}
                className={`p-4 backdrop-blur-sm bg-white/10 border-white/20 text-center hover-elevate transition-all duration-500 ${isAnimated ? 'animate-float' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`card-feature-${label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
                <p className="text-gray-300 text-xs">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/60">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}