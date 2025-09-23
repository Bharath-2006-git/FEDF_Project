import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Lightbulb,
  RefreshCw,
  Target,
  ArrowRight,
  Zap,
  Car,
  Home,
  Trash2,
  Factory
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area
} from "recharts";

interface ScenarioInput {
  category: string;
  currentValue: number;
  scenarioValue: number;
  unit: string;
  changePercentage: number;
}

interface ScenarioResult {
  category: string;
  current: number;
  projected: number;
  difference: number;
  percentageChange: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface Recommendation {
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  category: string;
}

export default function WhatIfAnalysis() {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  // Scenario inputs
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    {
      category: 'Electricity',
      currentValue: 450.3,
      scenarioValue: 450.3,
      unit: 'kWh',
      changePercentage: 0
    },
    {
      category: 'Travel',
      currentValue: 380.7,
      scenarioValue: 380.7,
      unit: 'miles',
      changePercentage: 0
    },
    {
      category: 'Fuel',
      currentValue: 250.1,
      scenarioValue: 250.1,
      unit: 'gallons',
      changePercentage: 0
    },
    {
      category: 'Waste',
      currentValue: 169.4,
      scenarioValue: 169.4,
      unit: 'kg',
      changePercentage: 0
    }
  ]);

  // Results
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [totalImpact, setTotalImpact] = useState({
    currentTotal: 1250.5,
    projectedTotal: 1250.5,
    difference: 0,
    percentageChange: 0
  });

  // Recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      title: "Switch to LED Lighting",
      description: "Replace all traditional bulbs with LED alternatives",
      impact: -45.2,
      difficulty: 'easy',
      timeframe: '1-2 weeks',
      category: 'Electricity'
    },
    {
      title: "Implement Remote Work Policy",
      description: "Allow 2-3 remote work days per week to reduce commuting",
      impact: -120.5,
      difficulty: 'medium',
      timeframe: '1-3 months',
      category: 'Travel'
    },
    {
      title: "Upgrade to Hybrid Vehicles",
      description: "Replace company fleet with hybrid or electric vehicles",
      impact: -89.3,
      difficulty: 'hard',
      timeframe: '6-12 months',
      category: 'Fuel'
    },
    {
      title: "Implement Comprehensive Recycling",
      description: "Set up recycling programs for all waste streams",
      impact: -28.7,
      difficulty: 'easy',
      timeframe: '2-4 weeks',
      category: 'Waste'
    },
    {
      title: "Install Smart Thermostats",
      description: "Optimize heating and cooling with smart temperature control",
      impact: -67.1,
      difficulty: 'medium',
      timeframe: '1-2 months',
      category: 'Electricity'
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState('custom');
  const [predefinedScenarios] = useState([
    {
      id: 'aggressive',
      name: 'Aggressive Reduction',
      description: '30% reduction across all categories',
      changes: { electricity: -30, travel: -30, fuel: -30, waste: -30 }
    },
    {
      id: 'moderate',
      name: 'Moderate Improvement',
      description: '15% reduction in key areas',
      changes: { electricity: -15, travel: -20, fuel: -10, waste: -15 }
    },
    {
      id: 'minimal',
      name: 'Quick Wins',
      description: '5-10% improvement with easy changes',
      changes: { electricity: -8, travel: -5, fuel: -7, waste: -10 }
    }
  ]);

  useEffect(() => {
    calculateScenario();
  }, [scenarios]);

  const updateScenario = (index: number, field: string, value: number) => {
    const updated = [...scenarios];
    
    if (field === 'changePercentage') {
      updated[index].changePercentage = value;
      updated[index].scenarioValue = updated[index].currentValue * (1 + value / 100);
    } else if (field === 'scenarioValue') {
      updated[index].scenarioValue = value;
      updated[index].changePercentage = ((value - updated[index].currentValue) / updated[index].currentValue) * 100;
    }
    
    setScenarios(updated);
  };

  const applyPredefinedScenario = (scenarioId: string) => {
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const updated = scenarios.map(s => {
      const categoryKey = s.category.toLowerCase() as keyof typeof scenario.changes;
      const changePercent = scenario.changes[categoryKey] || 0;
      return {
        ...s,
        changePercentage: changePercent,
        scenarioValue: s.currentValue * (1 + changePercent / 100)
      };
    });

    setScenarios(updated);
    setSelectedScenario(scenarioId);
  };

  const calculateScenario = async () => {
    setCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert units to CO2 emissions (simplified conversion factors)
    const conversionFactors = {
      'Electricity': 0.5, // kg CO2 per kWh
      'Travel': 0.4, // kg CO2 per mile
      'Fuel': 8.9, // kg CO2 per gallon
      'Waste': 0.5 // kg CO2 per kg waste
    };

    const calculatedResults = scenarios.map(scenario => {
      const factor = conversionFactors[scenario.category as keyof typeof conversionFactors];
      const currentEmissions = scenario.currentValue * factor;
      const projectedEmissions = scenario.scenarioValue * factor;
      const difference = projectedEmissions - currentEmissions;
      const percentageChange = ((projectedEmissions - currentEmissions) / currentEmissions) * 100;

      return {
        category: scenario.category,
        current: currentEmissions,
        projected: projectedEmissions,
        difference,
        percentageChange,
        impact: difference < 0 ? 'positive' as const : difference > 0 ? 'negative' as const : 'neutral' as const
      };
    });

    setResults(calculatedResults);

    // Calculate totals
    const currentTotal = calculatedResults.reduce((sum, r) => sum + r.current, 0);
    const projectedTotal = calculatedResults.reduce((sum, r) => sum + r.projected, 0);
    const totalDifference = projectedTotal - currentTotal;
    const totalPercentageChange = ((projectedTotal - currentTotal) / currentTotal) * 100;

    setTotalImpact({
      currentTotal,
      projectedTotal,
      difference: totalDifference,
      percentageChange: totalPercentageChange
    });

    setCalculating(false);
  };

  const resetScenarios = () => {
    const reset = scenarios.map(s => ({
      ...s,
      scenarioValue: s.currentValue,
      changePercentage: 0
    }));
    setScenarios(reset);
    setSelectedScenario('custom');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electricity':
        return <Zap className="w-5 h-5" />;
      case 'travel':
        return <Car className="w-5 h-5" />;
      case 'fuel':
        return <Factory className="w-5 h-5" />;
      case 'waste':
        return <Trash2 className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="default" className="bg-emerald-500">Easy</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'hard':
        return <Badge variant="destructive">Hard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">What-If Analysis</h1>
          <p className="text-slate-600 dark:text-slate-400">Explore the impact of different sustainability scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetScenarios} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={calculateScenario} disabled={calculating} size="sm">
            <Calculator className={`w-4 h-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
            Calculate
          </Button>
        </div>
      </div>

      {/* Predefined Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predefinedScenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={selectedScenario === scenario.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => applyPredefinedScenario(scenario.id)}
              >
                <h3 className="font-semibold mb-1">{scenario.name}</h3>
                <p className="text-sm text-left opacity-80">{scenario.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Scenario Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scenarios.map((scenario, index) => (
              <div key={scenario.category} className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(scenario.category)}
                    <h3 className="font-semibold text-slate-900 dark:text-white">{scenario.category}</h3>
                  </div>
                  <Badge variant="outline">
                    {scenario.changePercentage >= 0 ? '+' : ''}{scenario.changePercentage.toFixed(1)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current Value</Label>
                    <div className="text-lg font-medium text-slate-900 dark:text-white">
                      {scenario.currentValue.toFixed(1)} {scenario.unit}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Scenario Value</Label>
                    <Input
                      type="number"
                      value={scenario.scenarioValue.toFixed(1)}
                      onChange={(e) => updateScenario(index, 'scenarioValue', parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Change Percentage</Label>
                    <div className="px-2">
                      <Slider
                        value={[scenario.changePercentage]}
                        onValueChange={(value) => updateScenario(index, 'changePercentage', value[0])}
                        min={-50}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalImpact.currentTotal.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">kg CO₂</p>
              </div>
              <Target className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projected Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalImpact.projectedTotal.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">kg CO₂</p>
              </div>
              <Calculator className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Difference</p>
                <div className="flex items-center gap-1">
                  <p className={`text-2xl font-bold ${totalImpact.difference < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {totalImpact.difference >= 0 ? '+' : ''}{totalImpact.difference.toFixed(1)}
                  </p>
                  {totalImpact.difference < 0 ? (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  ) : totalImpact.difference > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">kg CO₂</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Change</p>
                <p className={`text-2xl font-bold ${totalImpact.percentageChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalImpact.percentageChange >= 0 ? '+' : ''}{totalImpact.percentageChange.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">vs current</p>
              </div>
              {totalImpact.percentageChange < 0 ? (
                <TrendingDown className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingUp className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Impact Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toFixed(1)} kg CO₂`, name]}
                />
                <Legend />
                <Bar dataKey="current" fill="#64748b" name="Current Emissions" />
                <Bar dataKey="projected" fill="#059669" name="Projected Emissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(rec.category)}
                    <h3 className="font-semibold text-slate-900 dark:text-white">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{rec.description}</p>
                  <div className="flex items-center gap-4">
                    {getDifficultyBadge(rec.difficulty)}
                    <span className="text-sm text-slate-500">⏱️ {rec.timeframe}</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {rec.impact.toFixed(1)} kg CO₂ reduction
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}