import { ThemeProvider, useTheme } from '../ThemeProvider'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

function ThemeToggleDemo() {
  const { theme, setTheme } = useTheme()

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Theme Provider Demo</h3>
      <p className="text-sm text-muted-foreground">
        Current theme: {theme}
      </p>
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center gap-2"
      >
        {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        Toggle to {theme === "light" ? "dark" : "light"} mode
      </Button>
      <div className="space-y-2">
        <div className="p-3 bg-primary text-primary-foreground rounded">
          Primary color example
        </div>
        <div className="p-3 bg-secondary text-secondary-foreground rounded">
          Secondary color example
        </div>
        <div className="p-3 bg-muted text-muted-foreground rounded">
          Muted color example
        </div>
      </div>
    </Card>
  )
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="light">
      <ThemeToggleDemo />
    </ThemeProvider>
  )
}