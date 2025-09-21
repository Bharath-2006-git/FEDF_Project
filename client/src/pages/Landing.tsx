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
  Users, 
  TrendingDown, 
  Shield, 
  Globe, 
  Zap,
  Factory,
  Car,
  Home,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Sun,
  Moon,
  Calculator,
  Lightbulb,
  FileText,
  Award,
  Search
} from "lucide-react";

export default function Landing() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <header className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Logo size="lg" showText={false} />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">CarbonSense</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800"
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

              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              🌍 Personal Carbon Tracking Made Simple
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">
              CarbonSense
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
              Track Your Carbon Footprint
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Monitor your daily activities like electricity usage, travel, fuel consumption, and waste. 
              Calculate your environmental impact, set reduction goals, and get personalized tips for a more sustainable lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/30 transition-all duration-300">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Why Track Your Carbon Footprint?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Every action matters. Start your journey toward a more sustainable future today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="relative">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Understand Your Impact
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Knowledge is Power
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    Understanding your environmental impact is the <span className="font-semibold text-emerald-600 dark:text-emerald-400">first step toward meaningful change</span>. 
                    Transform complex carbon calculations into simple, actionable insights.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Discover your biggest emission sources</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Track progress with visual analytics</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Get personalized reduction strategies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Simple & Effective
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      Effortless Tracking
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">No complex setup</span> or technical knowledge required. 
                    Just enter your daily activities and let our intelligent calculator do the work.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Set realistic, achievable goals</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Visualize impact with clear charts</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">Receive smart recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start Your Sustainability Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Take control of your environmental impact with simple tracking, insightful analytics, 
              and personalized recommendations for a more sustainable lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Set Meaningful Goals
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Define monthly or yearly emission reduction targets and track your progress 
                    with visual indicators that keep you motivated and on track.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Visualize Your Impact
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    See exactly where your emissions come from with interactive charts that 
                    break down your footprint by activity and show trends over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Get Smart Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Receive personalized tips and actionable advice based on your usage patterns 
                    to make impactful changes toward sustainability.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card p-8 space-y-6 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-foreground">Your Progress</span>
                </div>
                <p className="text-muted-foreground">
                  Track your sustainability journey with clear metrics that show 
                  your environmental impact reduction over time
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Daily Tracking</span>
                    <span className="text-sm font-medium text-primary">Simple & Fast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Goal Achievement</span>
                    <span className="text-sm font-medium text-primary">Motivating</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Impact Visibility</span>
                    <span className="text-sm font-medium text-primary">Crystal Clear</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Implementation Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamlined deployment process designed for enterprise environments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Data Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  Connect existing systems and data sources. Our platform integrates with 
                  ERP, IoT devices, and third-party APIs for comprehensive data collection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Analytics & Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  Advanced analytics engine processes data to generate insights, forecasts, 
                  and automated compliance reports tailored to your industry requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Optimization & Action</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  Implement data-driven strategies with intelligent recommendations, 
                  track progress, and achieve measurable environmental improvements.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to track, analyze, and reduce your personal carbon footprint
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <Calculator className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Carbon Calculator</h3>
              <p className="text-sm text-muted-foreground">Track electricity, fuel, travel, and waste with automatic CO₂ calculations</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Visual Analytics</h3>
              <p className="text-sm text-muted-foreground">Interactive charts showing emissions by category and trends over time</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <Target className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Goal Setting</h3>
              <p className="text-sm text-muted-foreground">Set monthly/yearly reduction goals and track your progress with visual indicators</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <Lightbulb className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Smart Tips</h3>
              <p className="text-sm text-muted-foreground">Personalized recommendations based on your usage patterns and habits</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <FileText className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Reports & Export</h3>
              <p className="text-sm text-muted-foreground">Generate monthly/annual summaries and export data to CSV format</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <TrendingDown className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Comparison Dashboard</h3>
              <p className="text-sm text-muted-foreground">Compare emissions across different periods and see improvement trends</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <Award className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Gamification</h3>
              <p className="text-sm text-muted-foreground">Earn badges and achievements for reducing emissions and reaching milestones</p>
            </div>

            <div className="bg-card p-6 hover:shadow-lg transition-all duration-300 group border border-border rounded-lg">
              <Search className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">What-If Analysis</h3>
              <p className="text-sm text-muted-foreground">Test scenarios like "What if I reduce electricity by 20%?" and see the impact</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Sustainability Journey Today
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Take the first step toward reducing your environmental impact. Track your carbon footprint, 
            set meaningful goals, and discover how small changes can make a big difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-green-600 hover:bg-gray-100 shadow-lg">
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold">CarbonSense</span>
            </div>
            <p className="text-gray-400 mb-4">
              Track your carbon footprint and make a positive impact on the environment
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}