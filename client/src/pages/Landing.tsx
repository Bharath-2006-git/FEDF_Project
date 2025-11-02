import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { Logo } from "@/components/Logo";
import { 
  Leaf, 
  BarChart3, 
  Target, 
  TrendingDown, 
  Shield, 
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
  Calculator,
  Lightbulb,
  FileText,
  Award,
  Activity,
  Mail
} from "lucide-react";

export default function Landing() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Logo size="lg" showText={false} />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                CarbonSense
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative overflow-hidden hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <div className="relative w-4 h-4">
                  <Sun 
                    className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${
                      theme === "light" 
                        ? "rotate-0 scale-100 opacity-100" 
                        : "rotate-90 scale-0 opacity-0"
                    }`} 
                  />
                  <Moon 
                    className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${
                      theme === "dark" 
                        ? "rotate-0 scale-100 opacity-100" 
                        : "-rotate-90 scale-0 opacity-0"
                    }`} 
                  />
                </div>
              </Button>

              <Link href="/auth?mode=login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-800">
                  Login
                </Button>
              </Link>
              
              <Link href="/auth?mode=register">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-slate-50/80 to-blue-50/20 dark:from-slate-900/80 dark:to-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Smart Carbon Tracking Platform
            </Badge>
            
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              CarbonSense
            </h1>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
              Monitor Your Environmental Impact
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Monitor your daily activities like electricity usage, travel, fuel consumption, and waste. 
              Calculate your environmental impact, set reduction goals, and get personalized tips for a more sustainable lifestyle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth?mode=register">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/auth?mode=login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                  Sign In
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why CarbonSense?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every action matters. Start your journey toward a more sustainable future today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Understand Your Impact
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Knowledge is the first step toward meaningful change. Transform complex carbon calculations into simple, actionable insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Set Meaningful Goals
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Define monthly or yearly emission reduction targets and track your progress with visual indicators that keep you motivated.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Get Smart Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Receive personalized tips and actionable advice based on your usage patterns to make impactful changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 className="h-8 w-8 text-emerald-600" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Track your sustainability journey with clear metrics that show your environmental impact reduction over time
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Tracking</span>
                    <span className="text-sm font-medium text-emerald-600">Simple & Fast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Goal Achievement</span>
                    <span className="text-sm font-medium text-emerald-600">Motivating</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Impact Visibility</span>
                    <span className="text-sm font-medium text-emerald-600">Crystal Clear</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              🚀 Comprehensive Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to track, analyze, and reduce your personal carbon footprint with intelligent insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-slate-700/50">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Carbon Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Track electricity, fuel, travel, and waste with automatic CO₂ calculations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-slate-700/50">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Visual Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Interactive charts showing emissions by category and trends over time
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-slate-700/50">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Goal Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Set monthly/yearly reduction goals and track your progress with visual indicators
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-slate-700/50">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Smart Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  Personalized recommendations based on your usage patterns and habits
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-700 dark:via-teal-700 dark:to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-6">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Sustainability Journey with CarbonSense
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take the first step toward reducing your environmental impact. Monitor emissions, 
            set meaningful goals, and discover how small changes can make a big difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-emerald-600 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-xl">
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth?mode=login">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-800 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400 bg-clip-text text-transparent">CarbonSense</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg max-w-2xl mx-auto">
              Empowering individuals and organizations to track their carbon footprint and make a positive impact on our planet's future
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </a>
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300 flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Terms of Service</span>
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </a>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-700/50 pt-6">
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                © 2024 CarbonSense. Building a sustainable future, one step at a time.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}