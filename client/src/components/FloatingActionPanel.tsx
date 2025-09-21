import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Leaf, Car, Home, ShoppingBag } from "lucide-react";

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  description: string;
}

interface FloatingActionPanelProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  onActionSelect?: (actionId: string) => void;
}

export default function FloatingActionPanel({ 
  position = "bottom-right",
  onActionSelect
}: FloatingActionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: ActionItem[] = [
    { 
      id: "transport", 
      icon: Car, 
      label: "Log Transport", 
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Add travel emissions"
    },
    { 
      id: "energy", 
      icon: Home, 
      label: "Log Energy", 
      color: "bg-green-600 hover:bg-green-700",
      description: "Track home usage"
    },
    { 
      id: "lifestyle", 
      icon: ShoppingBag, 
      label: "Log Purchase", 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Add lifestyle emissions"
    },
    { 
      id: "goal", 
      icon: Leaf, 
      label: "Set Goal", 
      color: "bg-emerald-600 hover:bg-emerald-700",
      description: "Create reduction target"
    }
  ];

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  };

  const handleActionClick = (action: ActionItem) => {
    onActionSelect?.(action.id);
    setIsOpen(false);
    console.log(`Action selected: ${action.label}`);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Action items */}
      <div className={`flex flex-col-reverse gap-3 mb-4 transition-all duration-300 transform origin-bottom ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="bg-card/95 backdrop-blur-sm border shadow-lg p-2 whitespace-nowrap">
                <div className="flex items-center gap-2 px-2 py-1">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {action.description}
                  </span>
                </div>
              </Card>
              
              <Button
                size="icon"
                className={`${action.color} text-white shadow-lg hover-elevate w-12 h-12 rounded-full`}
                onClick={() => handleActionClick(action)}
                data-testid={`button-action-${action.id}`}
              >
                <IconComponent className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main trigger button */}
      <Button
        size="icon"
        className={`w-14 h-14 rounded-full shadow-xl hover-elevate transition-all duration-300 ${
          isOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-floating-action-main"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
}