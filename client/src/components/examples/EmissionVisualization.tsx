import EmissionVisualization from '../EmissionVisualization'

export default function EmissionVisualizationExample() {
  // Mock emission data
  const mockData = [
    { category: "Transport", amount: 45.2, color: "#3b82f6", particles: 8 },
    { category: "Energy", amount: 78.9, color: "#10b981", particles: 12 },
    { category: "Food", amount: 32.1, color: "#f59e0b", particles: 6 },
    { category: "Waste", amount: 15.7, color: "#ef4444", particles: 4 }
  ];

  return (
    <div className="p-4">
      <EmissionVisualization data={mockData} isAnimated={true} />
    </div>
  )
}