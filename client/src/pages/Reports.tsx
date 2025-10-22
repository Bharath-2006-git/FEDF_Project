import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Plus
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
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Report {
  id: number;
  reportType: string;
  startDate: string;
  endDate: string;
  filePath: string;
  fileFormat: string;
  createdAt: string;
  totalEmissions: number;
  status: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast } = useToast();

  // Form state for new report generation
  const [reportForm, setReportForm] = useState({
    reportType: 'monthly',
    startDate: '',
    endDate: '',
    format: 'pdf'
  });

  // Report data for visualization
  const [reportData, setReportData] = useState({
    totalEmissions: 0,
    breakdown: [] as any[],
    trends: [] as any[]
  });

  useEffect(() => {
    loadReports();
    loadReportData();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Use actual API - for now empty array until backend generates reports
      setReports([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      // Get actual emission data from API
      const [emissionHistory, categoryBreakdown] = await Promise.all([
        apiService.getEmissionHistory(),
        apiService.getCategoryBreakdown('6months')
      ]);

      const totalEmissions = emissionHistory.reduce((sum: number, item: any) => sum + item.emissions, 0);
      
      // Create breakdown data with colors
      const colorMap: Record<string, string> = {
        'electricity': '#059669',
        'travel': '#0ea5e9', 
        'fuel': '#f59e0b',
        'waste': '#ef4444',
        'water': '#8b5cf6',
        'food': '#ec4899'
      };

      const breakdown = categoryBreakdown.data?.map((item: any) => ({
        category: item.category,
        value: item.value,
        percentage: item.percentage,
        color: colorMap[item.category.toLowerCase()] || '#6b7280'
      })) || [];

      // Create trends data from emission history
      const trends = emissionHistory.slice(-5).map((item: any) => ({
        month: new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'short' }),
        emissions: Math.round(item.emissions),
        target: Math.round(item.emissions * 0.9) // 10% reduction target
      }));

      setReportData({
        totalEmissions,
        breakdown,
        trends
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
      // Set empty data structure on error
      setReportData({
        totalEmissions: 0,
        breakdown: [],
        trends: []
      });
    }
  };

  const generateReport = async () => {
    if (!reportForm.startDate || !reportForm.endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    try {
      setGenerating(true);
      const response = await apiService.generateReport({
        reportType: reportForm.reportType,
        startDate: reportForm.startDate,
        endDate: reportForm.endDate
      });

      toast({
        title: "Success",
        description: "Report generated successfully",
      });

      // Add new report to list
      const newReport: Report = {
        id: Date.now(),
        reportType: reportForm.reportType,
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
        filePath: response.downloadUrl || `/reports/${reportForm.reportType}_${Date.now()}.${reportForm.format}`,
        fileFormat: reportForm.format,
        createdAt: new Date().toISOString(),
        totalEmissions: response.reportData?.totalEmissions || 0,
        status: 'completed'
      };

      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setReportForm({
        reportType: 'monthly',
        startDate: '',
        endDate: '',
        format: 'pdf'
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (report: Report) => {
    try {
      // Generate real report content based on actual data
      const emissionData = await apiService.getEmissionHistory();
      const filteredData = emissionData.filter((item: any) => {
        const date = new Date(item.date);
        const start = new Date(report.startDate);
        const end = new Date(report.endDate);
        return date >= start && date <= end;
      });

      const totalEmissions = filteredData.reduce((sum: number, item: any) => sum + item.emissions, 0);
      const categoryBreakdown = filteredData.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + item.emissions;
        return acc;
      }, {});

      // Generate report content
      const reportContent = {
        title: `Carbon Emissions Report - ${report.reportType}`,
        period: `${report.startDate} to ${report.endDate}`,
        summary: {
          totalEmissions: `${totalEmissions.toFixed(2)} kg CO2e`,
          averageDaily: `${(totalEmissions / filteredData.length || 0).toFixed(2)} kg CO2e/day`,
          entryCount: filteredData.length
        },
        categoryBreakdown,
        detailedData: filteredData
      };

      const reportText = JSON.stringify(reportContent, null, 2);
      const blob = new Blob([reportText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon_report_${report.reportType}_${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate and download report",
        variant: "destructive"
      });
    }
  };

  const deleteReport = async (reportId: number) => {
    try {
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      });
    }
  };

  const COLORS = ['#059669', '#0ea5e9', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-600 dark:text-slate-400">Generate and manage your emission reports</p>
        </div>
        <Button onClick={loadReports} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Generate New Report */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select 
                value={reportForm.reportType} 
                onValueChange={(value) => setReportForm(prev => ({...prev, reportType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={reportForm.startDate}
                onChange={(e) => setReportForm(prev => ({...prev, startDate: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={reportForm.endDate}
                onChange={(e) => setReportForm(prev => ({...prev, endDate: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={reportForm.format} 
                onValueChange={(value) => setReportForm(prev => ({...prev, format: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} disabled={generating} className="w-full md:w-auto">
            {generating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Report Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Breakdown */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
          <CardHeader>
            <CardTitle>Current Period Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg CO₂`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
          <CardHeader>
            <CardTitle>Emission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} kg CO₂`, '']} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#059669" name="Actual Emissions" />
                  <Bar dataKey="target" fill="#0ea5e9" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No reports generated yet
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                        {report.reportType} Report
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {report.fileFormat.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.totalEmissions.toFixed(1)} kg CO₂
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadReport(report)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteReport(report.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}