import CardStack from '../CardStack'
import { Leaf, Zap, Car, Home } from "lucide-react";

export default function CardStackExample() {
  // Mock data for card stack
  const mockCards = [
    {
      id: "transport",
      title: "Transportation",
      color: "bg-card border-green-200",
      content: (
        <div className="space-y-4">
          <Car className="w-12 h-12 text-green-600" />
          <p className="text-muted-foreground">Track your daily commute and travel emissions with smart route optimization.</p>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm font-medium text-green-800">This month: 45.2 kg CO₂</p>
          </div>
        </div>
      )
    },
    {
      id: "energy",
      title: "Home Energy",
      color: "bg-card border-blue-200",
      content: (
        <div className="space-y-4">
          <Home className="w-12 h-12 text-blue-600" />
          <p className="text-muted-foreground">Monitor electricity and heating usage with personalized efficiency tips.</p>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-800">This month: 78.9 kg CO₂</p>
          </div>
        </div>
      )
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      color: "bg-card border-purple-200",
      content: (
        <div className="space-y-4">
          <Leaf className="w-12 h-12 text-purple-600" />
          <p className="text-muted-foreground">Food choices, shopping habits, and daily activities impact tracking.</p>
          <div className="bg-purple-50 p-3 rounded-md">
            <p className="text-sm font-medium text-purple-800">This month: 23.1 kg CO₂</p>
          </div>
        </div>
      )
    },
    {
      id: "goals",
      title: "Reduction Goals",
      color: "bg-card border-amber-200",
      content: (
        <div className="space-y-4">
          <Zap className="w-12 h-12 text-amber-600" />
          <p className="text-muted-foreground">Set and track your carbon reduction targets with gamified achievements.</p>
          <div className="bg-amber-50 p-3 rounded-md">
            <p className="text-sm font-medium text-amber-800">Goal: -15% this year</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-bold mb-6 text-center">Carbon Tracking Categories</h2>
      <CardStack 
        cards={mockCards}
        onCardChange={(cardId) => console.log("Selected card:", cardId)}
      />
    </div>
  )
}