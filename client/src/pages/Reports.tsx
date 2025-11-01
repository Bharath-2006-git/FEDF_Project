import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast } = useToast();

  // Form state for new report generation
  const [reportForm, setReportForm] = useState({
    reportType: 'monthly',
    startDate: '',
    endDate: ''
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
      setError(null);
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load report data");
      console.error("Report data error:", err);
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
      
      // Fetch emission data for the selected date range
      const emissionHistory = await apiService.getEmissionHistory();
      const emissionsList = await apiService.getEmissionsList();
      
      // Filter data by date range
      const filteredEmissions = emissionsList.filter((item: any) => {
        const date = new Date(item.date);
        const start = new Date(reportForm.startDate);
        const end = new Date(reportForm.endDate);
        return date >= start && date <= end;
      });
      
      // Calculate statistics
      const totalEmissions = filteredEmissions.reduce((sum: number, item: any) => 
        sum + (item.co2Emissions || 0), 0
      );
      
      const categoryBreakdown = filteredEmissions.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + item.co2Emissions;
        return acc;
      }, {});
      
      const breakdown = Object.entries(categoryBreakdown).map(([category, value]) => ({
        category,
        value: value as number,
        percentage: (value as number / totalEmissions) * 100
      }));
      
      const days = (new Date(reportForm.endDate).getTime() - new Date(reportForm.startDate).getTime()) / (1000 * 60 * 60 * 24);
      const averageDaily = totalEmissions / (days || 1);
      
      // Update report data for visualization
      setReportData({
        totalEmissions,
        breakdown,
        trends: filteredEmissions.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString(),
          value: item.co2Emissions
        }))
      });

      // Generate and download PDF
      generatePDFReport(filteredEmissions, totalEmissions, breakdown, averageDaily);

      toast({
        title: "Success",
        description: "Report generated and downloaded as PDF",
      });
      
      // Reset form
      setReportForm({
        reportType: 'monthly',
        startDate: '',
        endDate: ''
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

  const generatePDFReport = (emissions: any[], totalEmissions: number, breakdown: any[], averageDaily: number) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFillColor(16, 185, 129); // Emerald color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CarbonSense', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Carbon Emissions Report', 20, 30);
    
    // Report Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated: ${reportDate}`, pageWidth - 20, 20, { align: 'right' });
    doc.text(`Period: ${reportForm.startDate} to ${reportForm.endDate}`, pageWidth - 20, 27, { align: 'right' });
    doc.text(`User: ${user?.firstName || 'User'}`, pageWidth - 20, 34, { align: 'right' });
    
    // Summary Section
    let yPos = 55;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Summary', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Emissions', `${totalEmissions.toFixed(2)} kg CO2e`],
      ['Total Entries', `${emissions.length}`],
      ['Average Daily', `${averageDaily.toFixed(2)} kg CO2e/day`],
      ['Report Type', reportForm.reportType.charAt(0).toUpperCase() + reportForm.reportType.slice(1)]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 20, right: 20 }
    });
    
    // Category Breakdown
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Emissions by Category', 20, yPos);
    
    yPos += 5;
    const categoryData = breakdown.map(item => [
      item.category,
      `${item.value.toFixed(2)} kg`,
      `${item.percentage.toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Emissions (kg CO2e)', 'Percentage']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 20, right: 20 }
    });
    
    // Detailed Emissions Log
    if (emissions.length > 0) {
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('Detailed Emissions Log', 20, yPos);
      
      yPos += 5;
      const emissionData = emissions.slice(0, 50).map((item: any) => [
        new Date(item.date).toLocaleDateString(),
        item.category,
        item.subcategory || 'N/A',
        `${item.quantity} ${item.unit}`,
        `${item.co2Emissions.toFixed(2)} kg`
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Category', 'Subcategory', 'Quantity', 'CO2 Emissions']],
        body: emissionData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
        styles: { cellPadding: 2 }
      });
      
      if (emissions.length > 50) {
        const remainingYPos = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Note: Showing first 50 of ${emissions.length} entries`, 20, remainingYPos);
      }
    }
    
    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'Generated by CarbonSense - Carbon Footprint Tracking',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `carbon-report-${reportForm.reportType}-${new Date().getTime()}.pdf`;
    doc.save(fileName);
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

  // Quick date presets
  const setDatePreset = (preset: string) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = '';

    switch(preset) {
      case '7days':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30days':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start = lastMonth.toISOString().split('T')[0];
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setReportForm(prev => ({ ...prev, startDate: start, endDate: lastMonthEnd.toISOString().split('T')[0] }));
        return;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
    }
    
    setReportForm(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Generate and download comprehensive emission reports</p>
        </div>
        <Button onClick={loadReports} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Generate New Report */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-emerald-600" />
            Generate New Report
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Select a date range and generate a comprehensive PDF report
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quick Date Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDatePreset('7days')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Last 7 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDatePreset('30days')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Last 30 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDatePreset('thisMonth')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                This Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDatePreset('lastMonth')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Last Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDatePreset('thisYear')}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                This Year
              </Button>
            </div>
          </div>

          {/* Custom Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {/* Generate Button with Duration Badge */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={generateReport} 
              disabled={generating || !reportForm.startDate || !reportForm.endDate} 
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download PDF Report
                </>
              )}
            </Button>
            {reportForm.startDate && reportForm.endDate && (
              <Badge variant="secondary" className="text-xs">
                {Math.ceil((new Date(reportForm.endDate).getTime() - new Date(reportForm.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Breakdown */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Current Period Breakdown
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Distribution of emissions by category
            </p>
          </CardHeader>
          <CardContent>
            {error || reportData.breakdown.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No data available</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Log emissions to see breakdown
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)} kg CO₂e`, 'Emissions']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Emission Trends
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Monthly emissions vs target goals
            </p>
          </CardHeader>
          <CardContent>
            {error || reportData.trends.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No trend data available</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Track emissions over time to see trends
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} kg CO₂e`, '']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '13px' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="emissions" 
                      fill="#059669" 
                      name="Actual Emissions"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar 
                      dataKey="target" 
                      fill="#0ea5e9" 
                      name="Target"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Generated Reports
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            View and download your previously generated reports
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Loading reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">No reports generated yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Generate your first report using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadReport(report)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteReport(report.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
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