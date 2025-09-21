import React, { useState } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Car, 
  Home, 
  Zap, 
  Trash2, 
  Factory, 
  Truck, 
  CalendarDays,
  Loader2
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

  // Individual categories
  const individualCategories = [
    {
      value: "electricity",
      label: "Electricity",
      icon: Zap,
      subcategories: ["home", "apartment", "office"],
      units: ["kWh"]
    },
    {
      value: "travel",
      label: "Transportation",
      icon: Car,
      subcategories: ["car", "bus", "train", "plane", "bike", "walk"],
      units: ["miles", "km", "hours"]
    },
    {
      value: "fuel",
      label: "Fuel",
      icon: Home,
      subcategories: ["gasoline", "diesel", "natural_gas", "heating_oil"],
      units: ["liters", "gallons", "cubic_meters"]
    },
    {
      value: "waste",
      label: "Waste",
      icon: Trash2,
      subcategories: ["household", "recyclable", "organic", "electronic"],
      units: ["kg", "lbs", "bags"]
    }
  ];

  // Company categories
  const companyCategories = [
    {
      value: "production",
      label: "Production",
      icon: Factory,
      subcategories: ["manufacturing", "assembly", "processing", "packaging"],
      units: ["units", "kg", "tons", "hours"]
    },
    {
      value: "logistics",
      label: "Logistics",
      icon: Truck,
      subcategories: ["shipping", "delivery", "warehouse", "distribution"],
      units: ["km", "miles", "packages", "tons"]
    },
    {
      value: "electricity",
      label: "Electricity",
      icon: Zap,
      subcategories: ["office", "factory", "warehouse", "retail"],
      units: ["kWh", "MWh"]
    },
    {
      value: "waste",
      label: "Waste",
      icon: Trash2,
      subcategories: ["industrial", "office", "recyclable", "hazardous"],
      units: ["kg", "tons", "cubic_meters"]
    }
  ];

  const categories = isIndividual() ? individualCategories : companyCategories;
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
        return;
      }

      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError("Please enter a valid positive number for quantity");
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
      
      toast({
        title: "Emission Logged Successfully",
        description: `Added ${quantity} ${formData.unit} of ${formData.category} (${result.emission.toFixed(2)} kg CO₂)`,
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

    } catch (err: any) {
      console.error('Error logging emission:', err);
      setError(err.response?.data?.message || "Failed to log emission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Log Emissions</h1>
        <p className="text-muted-foreground">
          {isIndividual() 
            ? "Track your personal carbon footprint by logging daily activities"
            : "Record your company's emissions from various business operations"
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Today's Entries</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">This Week</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total CO₂</p>
                <p className="text-2xl font-bold text-foreground">45.2kg</p>
              </div>
              <Factory className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Plus className="w-6 h-6 text-primary" />
            New Emission Entry
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {isIndividual() ? "Individual" : "Company"} Form
            </span>
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
                <Label htmlFor="category" className="text-sm font-semibold">
                  Category *
                </Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory" className="text-sm font-semibold">
                    Subcategory
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('subcategory', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-semibold">
                    Unit *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger className="h-12">
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
              )}
            </div>

            {/* Date and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {isCompany() && (
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="e.g., Manufacturing, IT, Sales"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="h-12"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about this emission..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Emission
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  category: "",
                  subcategory: "",
                  quantity: "",
                  unit: "",
                  date: new Date().toISOString().split('T')[0],
                  description: "",
                  department: ""
                })}
                className="px-8 h-12"
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
            💡 {isIndividual() ? "Personal" : "Business"} Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700 dark:text-amber-300">
            {isIndividual() ? (
              <>
                <div>• Track daily commute separately from leisure travel</div>
                <div>• Include both direct and indirect energy usage</div>
                <div>• Log household waste by type for better insights</div>
                <div>• Consider seasonal variations in your tracking</div>
              </>
            ) : (
              <>
                <div>• Separate emissions by department for better analysis</div>
                <div>• Include supply chain emissions when possible</div>
                <div>• Track production efficiency alongside emissions</div>
                <div>• Consider scope 1, 2, and 3 emissions categories</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}