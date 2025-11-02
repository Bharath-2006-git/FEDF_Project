import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useEmissionStats } from "@/hooks/useEmissionStats";
import { INDIVIDUAL_CATEGORIES, COMPANY_CATEGORIES } from "@/constants/categories";
import { 
  Plus, 
  CalendarDays,
  Loader2,
  TrendingUp,
  Leaf,
  Check,
  X,
  Filter,
  Search,
  Lightbulb
} from "lucide-react";
import { emissionsAPI } from "@/services/api";

interface EmissionFormData {
  category: string;
  subcategory: string;
  quantity: string;
  unit: string;
  date: string;
  description: string;
  department: string;
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  electricity: "Electricity",
  natural_gas: "Natural Gas",
  heating_oil: "Heating Oil",
  solar: "Solar",
  wind: "Wind",
  car: "Car",
  public_transport: "Public Transport",
  flight: "Flight",
  motorcycle: "Motorcycle",
  bicycle: "Bicycle",
  meat: "Meat",
  dairy: "Dairy",
  vegetables: "Vegetables",
  packaged_food: "Packaged Food",
  local_produce: "Local Produce",
  general_waste: "General Waste",
  recycling: "Recycling",
  composting: "Composting",
  electronics: "Electronics",
  household: "Household",
  tap_water: "Tap Water",
  bottled_water: "Bottled Water",
  shower: "Shower",
  irrigation: "Irrigation",
  industrial: "Industrial Process",
  hvac: "HVAC Systems",
  machinery: "Machinery",
  lighting: "Lighting",
  fleet: "Fleet Vehicles",
  shipping: "Shipping",
  employee_commute: "Employee Commute",
  business_travel: "Business Travel",
  production: "Production",
  packaging: "Packaging",
  office: "Office Supplies",
  equipment: "Equipment",
  landfill: "Landfill",
  incineration: "Incineration",
  hazardous: "Hazardous Waste",
  construction: "Construction",
  treatment: "Water Treatment",
  cooling: "Cooling Systems",
  process_water: "Process Water"
};

export default function LogEmissions() {
  const { user } = useAuth();
  const { isIndividual, isCompany } = useRoleAccess();
  const { stats, loading: statsLoading, reload: reloadStats } = useEmissionStats();

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
  const [expandedCategory, setExpandedCategory] = useState<string>("");

  const categories = isIndividual() ? INDIVIDUAL_CATEGORIES : COMPANY_CATEGORIES;
  
  const selectedCategory = categories.find(cat => cat.value === formData.category);

  const handleInputChange = (field: keyof EmissionFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'category') {
        updated.subcategory = "";
        updated.unit = "";
      }
      
      return updated;
    });
  };

  const handleCategorySelect = (categoryValue: string) => {
    handleInputChange('category', categoryValue);
    setExpandedCategory(categoryValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
      
      const calculationDetails = [
        `Formula: ${quantity} ${formData.unit} × ${result.emissionFactor?.toFixed(4) || 'N/A'} kg CO₂/${formData.unit} = ${result.co2Emissions.toFixed(2)} kg CO₂`,
        result.confidence ? `Confidence: ${result.confidence}` : '',
        result.calculationMethod ? `Method: ${result.calculationMethod}` : ''
      ].filter(Boolean).join(' | ');
      
      toast({
        title: "Entry Added Successfully",
        description: (
          <div className="space-y-1">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">{formData.category}{formData.subcategory ? ` → ${formData.subcategory}` : ''}</p>
            <p className="text-xs text-muted-foreground">{calculationDetails}</p>
          </div>
        ),
      });

      setFormData({
        category: "",
        subcategory: "",
        quantity: "",
        unit: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        department: ""
      });

      setExpandedCategory("");
      await reloadStats();

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to log emission. Please try again.");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to log emission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl shadow-lg mb-2">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Log Your Emissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {isIndividual() 
              ? "Track your carbon footprint by logging daily activities" 
              : "Record company emissions and monitor sustainability progress"
            }
          </p>
        </div>

        {/* Live Summary Bar */}
        <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-xl">
                  <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total Entries</p>
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <p className="text-xl font-bold text-slate-400">--</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.weekEntries}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-teal-500/20 dark:bg-teal-500/30 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Total CO₂</p>
                  {statsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <p className="text-xl font-bold text-slate-400">--</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.monthEmissions} kg</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-500/20 dark:bg-slate-500/30 rounded-xl">
                  <CalendarDays className="w-5 h-5 text-slate-700 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Last Entry</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-emerald-50/30 dark:from-slate-800/50 dark:to-emerald-900/10">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
              <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              New Emission Entry
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Accordion */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Select Category *
                </Label>
                <Accordion 
                  type="single" 
                  collapsible 
                  value={expandedCategory}
                  onValueChange={setExpandedCategory}
                  className="w-full space-y-2"
                >
                  {categories.map((category) => (
                    <AccordionItem 
                      key={category.value} 
                      value={category.value}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800"
                    >
                      <AccordionTrigger 
                        onClick={() => handleCategorySelect(category.value)}
                        className="px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors [&[data-state=open]]:bg-emerald-100 dark:[&[data-state=open]]:bg-emerald-900/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                            <category.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{category.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-900/50">
                        <div className="space-y-4">
                          {/* Subcategory */}
                          <div>
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                              Subcategory
                            </Label>
                            <Select 
                              value={formData.subcategory}
                              onValueChange={(value) => handleInputChange('subcategory', value)}
                            >
                              <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                {category.subcategories.map((sub) => (
                                  <SelectItem key={sub} value={sub} className="hover:bg-slate-100 dark:hover:bg-slate-700">
                                    {SUBCATEGORY_LABELS[sub] || sub.charAt(0).toUpperCase() + sub.slice(1).replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Quantity & Unit */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                                Quantity *
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                className="h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                                Unit *
                              </Label>
                              <Select 
                                value={formData.unit}
                                onValueChange={(value) => handleInputChange('unit', value)}
                              >
                                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                  {category.units.map((unit) => (
                                    <SelectItem key={unit} value={unit} className="hover:bg-slate-100 dark:hover:bg-slate-700">
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Date & Department */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                                Date *
                              </Label>
                              <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                required
                              />
                            </div>
                            {isCompany() && (
                              <div>
                                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                                  Department
                                </Label>
                                <Input
                                  placeholder="e.g., IT, Sales"
                                  value={formData.department}
                                  onChange={(e) => handleInputChange('department', e.target.value)}
                                  className="h-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                              Description (Optional)
                            </Label>
                            <Textarea
                              placeholder="Add details..."
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              rows={2}
                              className="resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-sm"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Submit & Clear Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Log Entry
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    setFormData({
                      category: "",
                      subcategory: "",
                      quantity: "",
                      unit: "",
                      date: new Date().toISOString().split('T')[0],
                      description: "",
                      department: ""
                    });
                    setExpandedCategory("");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-500/20 dark:bg-amber-500/30 rounded-lg">
                <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Tracking Tips
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {isIndividual() ? (
                <>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Track daily commute separately from leisure travel</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Include both direct and indirect energy usage</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Log household waste by type for better insights</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Consider seasonal variations in tracking</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Separate emissions by department for analysis</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Include supply chain emissions when possible</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                    <span className="text-slate-700 dark:text-slate-300">Track production efficiency alongside emissions</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
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
