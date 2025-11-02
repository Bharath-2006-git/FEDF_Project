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
  Check,
  X
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
            <p className="font-medium">{formData.category}{formData.subcategory ? ` → ${formData.subcategory}` : ''}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        <PageHeader
          title="Log Emissions"
          description={isIndividual() 
            ? "Log your daily activities and monitor your environmental impact" 
            : "Record company emissions and monitor sustainability progress"
          }
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Entries"
            value={statsLoading ? "..." : stats.weekEntries.toString()}
            subtitle={`${Math.abs(stats.todayChange)} from yesterday`}
            icon={CalendarDays}
            gradient="border-blue-200 dark:border-blue-800"
            iconGradient="from-blue-500 to-cyan-600"
          />
          
          <StatCard
            title="Total CO₂"
            value={statsLoading ? "..." : `${stats.monthEmissions} kg`}
            subtitle="This month"
            icon={TrendingUp}
            gradient="border-emerald-200 dark:border-emerald-800"
            iconGradient="from-emerald-500 to-teal-600"
          />
          
          <StatCard
            title="Last Entry"
            value={new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            subtitle="Today"
            icon={CalendarDays}
            gradient="border-slate-200 dark:border-slate-700"
            iconGradient="from-slate-500 to-slate-600"
          />
        </div>

        {/* Main Form Card */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-5 h-5" />
              New Emission Entry
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {SUBCATEGORY_LABELS[sub] || sub.charAt(0).toUpperCase() + sub.slice(1).replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Quantity and Unit */}
              {selectedCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Date and Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {isCompany() && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="e.g., IT, Sales"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="h-11"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11"
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
                  className="h-11 px-6"
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
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
