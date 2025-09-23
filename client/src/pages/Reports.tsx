import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
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

  // Sample report data for visualization
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
      // Simulate API call with dummy data
      const mockReports: Report[] = [
        {
          id: 1,
          reportType: 'monthly',
          startDate: '2025-08-01',
          endDate: '2025-08-31',
          filePath: '/reports/monthly_august_2025.pdf',
          fileFormat: 'pdf',
          createdAt: '2025-09-01T10:00:00Z',
          totalEmissions: 1250.5,
          status: 'completed'
        },
        {
          id: 2,
          reportType: 'quarterly',
          startDate: '2025-04-01',
          endDate: '2025-06-30',
          filePath: '/reports/quarterly_q2_2025.csv',
          fileFormat: 'csv',
          createdAt: '2025-07-15T14:30:00Z',
          totalEmissions: 3680.2,
          status: 'completed'
        },
        {
          id: 3,
          reportType: 'annual',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filePath: '/reports/annual_2024.pdf',
          fileFormat: 'pdf',
          createdAt: '2025-01-10T09:15:00Z',
          totalEmissions: 14250.8,
          status: 'completed'
        }
      ];
      setReports(mockReports);
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
      // Sample data for current period
      setReportData({
        totalEmissions: 1250.5,
        breakdown: [
          { category: 'Electricity', value: 450.3, percentage: 36, color: '#059669' },
          { category: 'Travel', value: 380.7, percentage: 30, color: '#0ea5e9' },
          { category: 'Fuel', value: 250.1, percentage: 20, color: '#f59e0b' },
          { category: 'Waste', value: 169.4, percentage: 14, color: '#ef4444' }
        ],
        trends: [
          { month: 'May', emissions: 1180, target: 1200 },
          { month: 'Jun', emissions: 1220, target: 1150 },
          { month: 'Jul', emissions: 1100, target: 1100 },
          { month: 'Aug', emissions: 1250, target: 1050 },
          { month: 'Sep', emissions: 980, target: 1000 }
        ]
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
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
      const response = await api.generateReport({
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
      // Simulate download
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,Sample ${report.reportType} report data for ${report.startDate} to ${report.endDate}`;
      link.download = `carbon_report_${report.reportType}_${report.id}.${report.fileFormat}`;
      link.click();
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
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
      <Card>
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
        <Card>
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
        <Card>
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
      <Card>
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
  );
}