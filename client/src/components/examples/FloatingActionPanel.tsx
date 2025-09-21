import FloatingActionPanel from '../FloatingActionPanel'

export default function FloatingActionPanelExample() {
  return (
    <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Click the floating action button in the bottom right</p>
      </div>
      <FloatingActionPanel 
        onActionSelect={(actionId) => console.log("Action selected:", actionId)}
      />
    </div>
  )
}