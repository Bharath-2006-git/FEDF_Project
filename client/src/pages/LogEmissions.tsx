import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useEmissionStats } from "@/hooks/useEmissionStats";
import { INDIVIDUAL_CATEGORIES, COMPANY_CATEGORIES } from "@/constants/categories";
import { 
  Plus, 
  CalendarDays,
  Loader2,
  TrendingUp,
  Calendar,
  CheckCircle,
  Factory
} from "lucide-react";
import { emissionsAPI } from "@/services/api";

interface EmissionFormData {
  category: string;
  subcategory: string;
  quantity: string;
  unit: string;
  date: string;
  description: string;
  department?: string;
}

export default function LogEmissions() {
  const { user } = useAuth();
  const { isIndividual, isCompany } = useRoleAccess();
  
  const [formData, setFormData] = useState<EmissionFormData>({
    category: "",
    subcategory: "",
    quantity: "",
    unit: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    department: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { stats, loading: statsLoading, reload: reloadStats } = useEmissionStats();

  const categories = isIndividual() ? INDIVIDUAL_CATEGORIES : COMPANY_CATEGORIES;
  const selectedCategory = categories.find(cat => cat.value === formData.category);



  const handleInputChange = (field: keyof EmissionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields when category changes
      ...(field === 'category' && { subcategory: '', unit: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.category || !formData.quantity || !formData.unit || !formData.date) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError("Please enter a valid positive number for quantity");
        setLoading(false);
        return;
      }

      const emissionData = {
        category: formData.category,
        subcategory: formData.subcategory,
        quantity,
        unit: formData.unit,
        date: formData.date,
        description: formData.description,
        ...(isCompany() && formData.department && { department: formData.department })
      };

      const result = await emissionsAPI.add(emissionData);
      
      // Create detailed calculation description
      const calculationDetails = [
        `Formula: ${quantity} ${formData.unit} × ${result.emissionFactor?.toFixed(4) || 'N/A'} kg CO₂/${formData.unit} = ${result.co2Emissions.toFixed(2)} kg CO₂`,
        result.confidence ? `Confidence: ${result.confidence}` : '',
        result.calculationMethod ? `Method: ${result.calculationMethod}` : ''
      ].filter(Boolean).join(' | ');
      
      toast({
        title: "✅ Emission Logged Successfully",
        description: (
          <div className="space-y-1">
            <p className="font-medium">{formData.category}{formData.subcategory ? ` → ${formData.subcategory}` : ''}</p>
            <p className="text-xs text-muted-foreground">{calculationDetails}</p>
          </div>
        ),
      });

      // Reset form
      setFormData({
        category: "",
        subcategory: "",
        quantity: "",
        unit: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        department: ""
      });

      // Reload stats to reflect new entry - use async delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      await reloadStats();

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to log emission. Please try again.");
      toast({
        title: "❌ Error",
        description: err.response?.data?.message || "Failed to log emission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-2xl shadow-lg mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
          Log Emissions
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {isIndividual() 
            ? "Track your personal carbon footprint by logging daily activities and monitor your environmental impact"
            : "Record your company's emissions from various business operations and track sustainability goals"
          }
        </p>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Today's Entries</p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <p className="text-2xl font-bold text-slate-400">--</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.todayEntries}</p>
                    <p className={`text-xs font-medium ${stats.todayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stats.todayChange >= 0 ? '+' : ''}{stats.todayChange} from yesterday
                    </p>
                  </>
                )}
              </div>
              <div className="p-3 bg-blue-500/10 dark:bg-blue-400/20 rounded-xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/30 transition-colors">
                <CalendarDays className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">This Week</p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <p className="text-2xl font-bold text-slate-400">--</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.weekEntries}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{stats.weekDays} days tracked</p>
                  </>
                )}
              </div>
              <div className="p-3 bg-cyan-500/10 dark:bg-cyan-400/20 rounded-xl group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-400/30 transition-colors">
                <Plus className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total CO₂</p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <p className="text-2xl font-bold text-slate-400">--</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.monthEmissions} kg</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">This month</p>
                  </>
                )}
              </div>
              <div className="p-3 bg-teal-500/10 dark:bg-teal-400/20 rounded-xl group-hover:bg-teal-500/20 dark:group-hover:bg-teal-400/30 transition-colors">
                <Factory className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Form */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-slate-100">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            New Emission Entry
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-auto px-3 py-1 bg-slate-200/70 dark:bg-slate-700/70 rounded-full">
              {isIndividual() ? "Individual" : "Company"} Form
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Category Selection */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Category *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-500/10 dark:bg-blue-400/20 rounded-md">
                              <category.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-slate-900 dark:text-slate-100">{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="space-y-3">
                    <Label htmlFor="subcategory" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      Subcategory
                    </Label>
                    <Select onValueChange={(value) => handleInputChange('subcategory', value)}>
                      <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        {selectedCategory.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub} className="hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100">
                            {sub.charAt(0).toUpperCase() + sub.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Quantity and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  required
                />
              </div>

              {selectedCategory && (
                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Unit *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 dark:focus:ring-orange-400/20">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {selectedCategory.units.map((unit) => (
                        <SelectItem key={unit} value={unit} className="hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Enhanced Date and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              {isCompany() && (
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Manufacturing, IT, Sales"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Enhanced Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about this emission..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>

            {/* Enhanced Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Logging Emission...
                  </>
                ) : (
                  <>
                    <Plus className="mr-3 h-5 w-5" />
                    Log Emission Entry
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="h-14 px-6 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300"
                onClick={() => setFormData({
                  category: "",
                  subcategory: "",
                  quantity: "",
                  unit: "",
                  date: new Date().toISOString().split('T')[0],
                  description: "",
                  department: ""
                })}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Enhanced Tips Section */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 dark:bg-yellow-400/20 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isIndividual() ? "Personal" : "Business"} Emission Tracking Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {isIndividual() ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Track daily commute separately from leisure travel</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Include both direct and indirect energy usage</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Log household waste by type for better insights</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Consider seasonal variations in your tracking</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Separate emissions by department for better analysis</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Include supply chain emissions when possible</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Track production efficiency alongside emissions</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-slate-700 dark:text-slate-300">Consider scope 1, 2, and 3 emissions categories</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}