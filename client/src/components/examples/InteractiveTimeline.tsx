import InteractiveTimeline from '../InteractiveTimeline'
import { Car, Home, Leaf, Zap } from "lucide-react";

export default function InteractiveTimelineExample() {
  // Mock timeline data
  const mockEntries = [
    {
      id: "1",
      date: "2024-01-15",
      category: "Car Commute",
      amount: 25.5,
      unit: "miles",
      icon: Car,
      color: "bg-blue-600"
    },
    {
      id: "2", 
      date: "2024-01-15",
      category: "Electricity",
      amount: 45,
      unit: "kWh",
      icon: Zap,
      color: "bg-yellow-600"
    },
    {
      id: "3",
      date: "2024-01-14",
      category: "Home Heating",
      amount: 12,
      unit: "therms",
      icon: Home,
      color: "bg-orange-600"
    },
    {
      id: "4",
      date: "2024-01-14",
      category: "Food Purchase",
      amount: 8.2,
      unit: "lbs",
      icon: Leaf,
      color: "bg-green-600"
    },
    {
      id: "5",
      date: "2024-01-13",
      category: "Flight",
      amount: 350,
      unit: "miles",
      icon: Car,
      color: "bg-red-600"
    }
  ];

  return (
    <div className="p-4">
      <InteractiveTimeline 
        entries={mockEntries}
        onEntryAdd={(entry) => console.log("Add entry:", entry)}
        onEntryDelete={(id) => console.log("Delete entry:", id)}
      />
    </div>
  )
}