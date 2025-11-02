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
  RefreshCw,
  Eye,
  Trash2,
  Plus
} from "lucide-react";
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
      
      // Create breakdown data with colors - comprehensive color map
      const colorMap: Record<string, string> = {
        'electricity': '#059669',
        'travel': '#0ea5e9', 
        'fuel': '#f59e0b',
        'waste': '#ef4444',
        'water': '#8b5cf6',
        'food': '#ec4899',
        'transport': '#06b6d4',
        'heating': '#f97316',
        'cooling': '#3b82f6',
        'manufacturing': '#a855f7',
        'agriculture': '#84cc16',
        'construction': '#78716c',
        'shipping': '#0891b2',
        'aviation': '#6366f1',
        'other': '#6b7280'
      };

      // Default colors if category not in map
      const defaultColors = ['#059669', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

      const breakdown = categoryBreakdown.data?.map((item: any, index: number) => ({
        category: item.category,
        value: item.value,
        percentage: item.percentage,
        color: colorMap[item.category.toLowerCase()] || defaultColors[index % defaultColors.length]
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

      // Add the report to the reports list
      const newReport: Report = {
        id: Date.now(),
        reportType: reportForm.reportType,
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
        filePath: `CarbonSense-Report-${reportForm.reportType}-${new Date().toISOString().split('T')[0]}.pdf`,
        fileFormat: 'pdf',
        createdAt: new Date().toISOString(),
        totalEmissions: totalEmissions,
        status: 'completed'
      };
      
      setReports(prev => [newReport, ...prev]);

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

  // Helper to decode any HTML entities that might be present in category names or other strings
  const decodeHtml = (input: string) => {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = input || '';
      return txt.value;
    } catch (e) {
      return input || '';
    }
  };

  // Convert hex color ('#rrggbb') to jsPDF rgb array
  const hexToRgb = (hex: string) => {
    try {
      const clean = (hex || '#6b7280').replace('#', '');
      const bigint = parseInt(clean, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    } catch (e) {
      return [107, 114, 128];
    }
  };

  const generatePDFReport = (emissions: any[], totalEmissions: number, breakdown: any[], averageDaily: number) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Clean professional header
    doc.setFillColor(16, 185, 129); // Emerald color
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Add accent line
    doc.setFillColor(5, 150, 105); // Darker emerald
    doc.rect(0, 40, pageWidth, 5, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CarbonSense', 20, 20);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Carbon Emissions Report', 20, 30);
    
    // Report Info box in header
    doc.setFontSize(9);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  doc.text(`Generated: ${reportDate}`, pageWidth - 15, 18, { align: 'right' });
  doc.text(`Period: ${reportForm.startDate} to ${reportForm.endDate}`, pageWidth - 15, 25, { align: 'right' });
  doc.text(`User: ${user?.firstName || 'User'}`, pageWidth - 15, 32, { align: 'right' });
    
    // Key Metrics Highlight Boxes
    let yPos = 65;
    const boxWidth = (pageWidth - 50) / 3;
    const boxHeight = 25;
    const boxY = yPos;
    
    // Total Emissions Box
    doc.setFillColor(239, 246, 255); // Light blue bg
    doc.roundedRect(15, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246); // Blue border
    doc.setLineWidth(0.5);
    doc.roundedRect(15, boxY, boxWidth, boxHeight, 3, 3, 'S');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Emissions', 15 + boxWidth / 2, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${totalEmissions.toFixed(1)} kg`, 15 + boxWidth / 2, boxY + 17, { align: 'center' });
    
    // Daily Average Box
    doc.setFillColor(236, 253, 245); // Light green bg
    doc.roundedRect(20 + boxWidth, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129); // Green border
    doc.roundedRect(20 + boxWidth, boxY, boxWidth, boxHeight, 3, 3, 'S');
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(10);
    doc.text('Daily Average', 20 + boxWidth + boxWidth / 2, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${averageDaily.toFixed(1)} kg`, 20 + boxWidth + boxWidth / 2, boxY + 17, { align: 'center' });
    
    // Total Entries Box
    doc.setFillColor(254, 243, 199); // Light yellow bg
    doc.roundedRect(25 + boxWidth * 2, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(245, 158, 11); // Orange border
    doc.roundedRect(25 + boxWidth * 2, boxY, boxWidth, boxHeight, 3, 3, 'S');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(10);
    doc.text('Total Entries', 25 + boxWidth * 2 + boxWidth / 2, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${emissions.length}`, 25 + boxWidth * 2 + boxWidth / 2, boxY + 17, { align: 'center' });
    
    // Summary Section with better styling
    yPos = boxY + boxHeight + 20;
    
    // Section divider
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(15, yPos - 3, pageWidth - 15, yPos - 3);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('REPORT SUMMARY', 15, yPos + 3);
    
    yPos += 5;
    
    const daysCount = Math.ceil((new Date(reportForm.endDate).getTime() - new Date(reportForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 0;
    const emissionsPerEntry = emissions.length ? (totalEmissions / emissions.length) : 0;
    const summaryData = [
      ['Report Type', reportForm.reportType.charAt(0).toUpperCase() + reportForm.reportType.slice(1)],
      ['Analysis Period', `${daysCount} day(s)`],
      ['Emissions per Entry', emissions.length ? `${emissionsPerEntry.toFixed(2)} kg CO₂e` : '-'],
      ['Status', (totalEmissions < (averageDaily * 30)) ? 'Below target' : 'Above target']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right' }
      }
    });
    
    // Category Breakdown with visual bars
    yPos = (doc as any).lastAutoTable.finalY + 20;
    
    // Section divider
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(15, yPos - 3, pageWidth - 15, yPos - 3);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('EMISSIONS BY CATEGORY', 15, yPos + 3);
    
    yPos += 5;
    
    // Build category table rows; we'll draw a colored bar in the Distribution column using autoTable's hooks
    const categoryData = breakdown.map(item => [
      decodeHtml(String(item.category)),
      `${(item.value || 0).toFixed(2)} kg`,
      `${(item.percentage || 0).toFixed(1)}%`,
      (item.percentage || 0)
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Emissions (kg CO₂e)', '%', 'Distribution']],
      body: categoryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 30 },
        3: { cellWidth: 60, halign: 'left' }
      },
      // Draw a colored bar representing distribution in the 4th column
      didDrawCell: (data) => {
        try {
          if (data.column.index === 3 && data.cell && typeof data.cell.raw !== 'undefined') {
            const pct = Number(data.cell.raw) || 0;
            const rowIndex = data.row.index;
            const color = (breakdown[rowIndex] && breakdown[rowIndex].color) || '#6b7280';
            const [r, g, b] = hexToRgb(color);

            // bar coords
            const padding = 2;
            const barX = data.cell.x + padding;
            const barY = data.cell.y + (data.cell.height / 2) - 3;
            const maxBarWidth = data.cell.width - (padding * 2);
            const barWidth = Math.max(0, Math.min(maxBarWidth, (pct / 100) * maxBarWidth));

            // background track
            doc.setFillColor(229, 231, 235);
            doc.roundedRect(data.cell.x + padding, barY - 1, maxBarWidth, 6, 1, 1, 'F');

            // colored bar
            doc.setFillColor(r, g, b);
            doc.roundedRect(barX, barY - 1, barWidth, 6, 1, 1, 'F');

            // Draw percentage text on top, right aligned inside cell
            doc.setFontSize(9);
            doc.setTextColor(64, 64, 64);
            doc.text(`${pct.toFixed(1)}%`, data.cell.x + data.cell.width - padding, data.cell.y + data.cell.height / 2 + 3, { align: 'right' });
          }
        } catch (e) {
          // non-fatal for drawing
        }
      }
    });
    
    // Detailed Emissions Log
    if (emissions.length > 0) {
      doc.addPage();
      
      // Page header for second page
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CarbonSense - Detailed Report', 20, 13);
      
      yPos = 30;
      
      // Section divider
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.line(15, yPos, pageWidth - 15, yPos);
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('DETAILED EMISSIONS LOG', 15, yPos + 7);
      
      yPos += 10;
      
      const emissionData = emissions.slice(0, 50).map((item: any) => [
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        decodeHtml(String(item.category || '-')),
        decodeHtml(String(item.subcategory || '-')),
        `${item.quantity || 0} ${item.unit || ''}`,
        `${(item.co2Emissions || 0).toFixed(2)} kg`
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Category', 'Subcategory', 'Quantity', 'CO₂ Emissions']],
        body: emissionData,
        theme: 'grid',
        headStyles: { 
          fillColor: [16, 185, 129], 
          textColor: 255, 
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 28, halign: 'center' },
          1: { cellWidth: 35, fontStyle: 'bold' },
          2: { cellWidth: 35 },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold' }
        }
      });
      
      if (emissions.length > 50) {
        const remainingYPos = (doc as any).lastAutoTable.finalY + 8;
        
        // Info box for remaining entries
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(15, remainingYPos, pageWidth - 30, 10, 2, 2, 'F');
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, remainingYPos, pageWidth - 30, 10, 2, 2, 'S');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(146, 64, 14);
        doc.text(
          `NOTE: Showing first 50 of ${emissions.length} total entries. ${emissions.length - 50} entries not displayed.`,
          pageWidth / 2,
          remainingYPos + 6,
          { align: 'center' }
        );
      }
      
      // Recommendations section at bottom
      const recommendationsY = (doc as any).lastAutoTable.finalY + 22;
      if (recommendationsY < pageHeight - 45) {
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(1);
        doc.line(15, recommendationsY, pageWidth - 15, recommendationsY);
        
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('SUSTAINABILITY RECOMMENDATIONS', 15, recommendationsY + 7);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const tips = [
          '- Consider using public transport or carpooling to reduce travel emissions',
          '- Switch to LED bulbs and unplug devices when not in use',
          '- Reduce, reuse, and recycle to minimize waste emissions',
          '- Set goals to track your progress toward lower emissions'
        ];
        
        tips.forEach((tip, index) => {
          doc.text(tip, 20, recommendationsY + 16 + (index * 5));
        });
      }
    }
    
    // Professional footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Footer line
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      
      doc.setFontSize(7);
      doc.text(
        'Generated by CarbonSense | www.carbonsense.com',
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }
    
    // Save PDF with better filename
    const fileName = `CarbonSense-Report-${reportForm.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
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
      <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">Generate and download comprehensive emission reports</p>
        </div>
        <Button onClick={loadReports} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Generate New Report */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-6 h-6 text-emerald-600" />
            Generate New Report
          </CardTitle>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
            Select a date range and generate a comprehensive PDF report
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Date Presets */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-700 dark:text-slate-300">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setDatePreset('7days')}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 Days
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setDatePreset('30days')}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setDatePreset('thisMonth')}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setDatePreset('lastMonth')}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last Month
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setDatePreset('thisYear')}
                className="text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                This Year
              </Button>
            </div>
          </div>

          {/* Custom Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-3">
              <Label htmlFor="reportType" className="text-base">Report Type</Label>
              <Select 
                value={reportForm.reportType} 
                onValueChange={(value) => setReportForm(prev => ({...prev, reportType: value}))}
              >
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly" className="text-base">Monthly</SelectItem>
                  <SelectItem value="quarterly" className="text-base">Quarterly</SelectItem>
                  <SelectItem value="annual" className="text-base">Annual</SelectItem>
                  <SelectItem value="custom" className="text-base">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-base">Start Date</Label>
              <Input
                type="date"
                value={reportForm.startDate}
                onChange={(e) => setReportForm(prev => ({...prev, startDate: e.target.value}))}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="endDate" className="text-base">End Date</Label>
              <Input
                type="date"
                value={reportForm.endDate}
                onChange={(e) => setReportForm(prev => ({...prev, endDate: e.target.value}))}
                className="text-base h-11"
              />
            </div>
          </div>

          {/* Generate Button with Duration Badge */}
          <div className="flex items-center gap-3 pt-3">
            <Button 
              onClick={generateReport} 
              disabled={generating || !reportForm.startDate || !reportForm.endDate} 
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all text-base"
              size="lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate & Download PDF Report
                </>
              )}
            </Button>
            {reportForm.startDate && reportForm.endDate && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {Math.ceil((new Date(reportForm.endDate).getTime() - new Date(reportForm.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-emerald-600" />
            Generated Reports
          </CardTitle>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
            View and download your previously generated reports
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-base text-slate-600 dark:text-slate-400">Loading reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-5">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">No reports generated yet</p>
              <p className="text-base text-slate-500 dark:text-slate-500 mt-2">
                Generate your first report using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white capitalize text-lg">
                        {report.reportType} Report
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-sm px-2 py-1">
                          {report.fileFormat.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-2 py-1">
                          {report.totalEmissions.toFixed(1)} kg CO₂
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="default" onClick={() => setSelectedReport(report)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="default" onClick={() => downloadReport(report)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="default" onClick={() => deleteReport(report.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
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