import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Plus,
  X
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

// Color map for categories
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
      // Load reports from localStorage
      const savedReports = localStorage.getItem('carbonSense_reports');
      if (savedReports) {
        const parsedReports = JSON.parse(savedReports);
        // Filter reports for current user
        const userReports = parsedReports.filter((r: Report) => r.status === 'completed');
        setReports(userReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReports([]);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save reports to localStorage
  const saveReportsToStorage = (updatedReports: Report[]) => {
    try {
      localStorage.setItem('carbonSense_reports', JSON.stringify(updatedReports));
      setReports(updatedReports);
    } catch (error) {
      console.error('Failed to save reports:', error);
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
      
      const updatedReports = [newReport, ...reports];
      saveReportsToStorage(updatedReports);

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
    
    // Modern gradient-style header
    doc.setFillColor(5, 150, 105); // Dark emerald base
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Overlay lighter section
    doc.setFillColor(16, 185, 129); // Lighter emerald
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Accent stripe at bottom of header
    doc.setFillColor(236, 253, 245); // Very light green
    doc.rect(0, 48, pageWidth, 2, 'F');
    
    // CarbonSense Logo - Earth with orbit rings
    const logoX = 20;
    const logoY = 18;
    const logoSize = 8;
    
    // Earth globe
    doc.setFillColor(79, 195, 247); // Light blue earth
    doc.circle(logoX, logoY, logoSize, 'F');
    
    // Darker blue border
    doc.setDrawColor(2, 119, 189);
    doc.setLineWidth(0.5);
    doc.circle(logoX, logoY, logoSize, 'S');
    
    // Green continents (landmass shapes)
    doc.setFillColor(76, 175, 80); // Green
    // Top left continent
    doc.circle(logoX - 3, logoY - 2, 2, 'F');
    // Bottom right continent
    doc.circle(logoX + 2, logoY + 3, 2.5, 'F');
    // Small island
    doc.circle(logoX - 1, logoY + 1, 1, 'F');
    
    // Orbit ring (ellipse for 3D effect)
    doc.setDrawColor(76, 175, 80); // Green orbit
    doc.setLineWidth(1);
    doc.ellipse(logoX, logoY, logoSize + 3, 3, 'S');
    
    // Second orbit ring
    doc.setDrawColor(0, 188, 212); // Cyan orbit
    doc.setLineWidth(0.8);
    doc.ellipse(logoX, logoY, logoSize + 4, 2.5, 'S');
    
    // Small leaf icon on orbit (sustainability symbol)
    doc.setFillColor(76, 175, 80);
    const leafX = logoX + logoSize + 3;
    const leafY = logoY - 2;
    doc.circle(leafX, leafY, 1.5, 'F');
    
    // Company name beside logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CarbonSense', logoX + 18, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Carbon Footprint Analysis Report', 37, 28);
    
    // Report metadata in header (right side)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const userName = user?.firstName || 'User';
    doc.text(`Date: ${reportDate}`, pageWidth - 15, 13, { align: 'right' });
    doc.text(`Period: ${reportForm.startDate} to ${reportForm.endDate}`, pageWidth - 15, 19, { align: 'right' });
    doc.text(`User: ${userName}`, pageWidth - 15, 25, { align: 'right' });
    
    // Executive Summary Cards with modern card design
    let yPos = 68;
    const cardWidth = (pageWidth - 48) / 3;
    const cardHeight = 28;
    const cardSpacing = 6;
    
    // Card 1: Total Emissions (Blue theme)
    const card1X = 15;
    doc.setFillColor(239, 246, 255); // Light blue
    doc.roundedRect(card1X, yPos, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(191, 219, 254); // Border
    doc.setLineWidth(0.8);
    doc.roundedRect(card1X, yPos, cardWidth, cardHeight, 4, 4, 'S');
    
    // Icon circle for card 1
    doc.setFillColor(59, 130, 246);
    doc.circle(card1X + 10, yPos + 10, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CO2', card1X + 10, yPos + 12, { align: 'center' });
    
    // Card 1 content
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL EMISSIONS', card1X + 20, yPos + 10);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalEmissions.toFixed(1)}`, card1X + 20, yPos + 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('kg CO2e', card1X + 20, yPos + 25);
    
    // Card 2: Daily Average (Green theme)
    const card2X = card1X + cardWidth + cardSpacing;
    doc.setFillColor(236, 253, 245); // Light green
    doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.8);
    doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 4, 4, 'S');
    
    // Icon circle for card 2
    doc.setFillColor(16, 185, 129);
    doc.circle(card2X + 10, yPos + 10, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AVG', card2X + 10, yPos + 12, { align: 'center' });
    
    // Card 2 content
    doc.setTextColor(6, 78, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('DAILY AVERAGE', card2X + 20, yPos + 10);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${averageDaily.toFixed(1)}`, card2X + 20, yPos + 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('kg/day', card2X + 20, yPos + 25);
    
    // Card 3: Total Entries (Purple theme)
    const card3X = card2X + cardWidth + cardSpacing;
    doc.setFillColor(243, 232, 255); // Light purple
    doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(221, 214, 254);
    doc.setLineWidth(0.8);
    doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 4, 4, 'S');
    
    // Icon circle for card 3
    doc.setFillColor(139, 92, 246);
    doc.circle(card3X + 10, yPos + 10, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', card3X + 10, yPos + 12, { align: 'center' });
    
    // Card 3 content
    doc.setTextColor(76, 29, 149);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL ENTRIES', card3X + 20, yPos + 10);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${emissions.length}`, card3X + 20, yPos + 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('records', card3X + 20, yPos + 25);
    
    // Key Metrics Section with modern header
    yPos = yPos + cardHeight + 18;
    
    // Section header with background bar
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos - 2, pageWidth - 30, 10, 'F');
    
    doc.setFillColor(16, 185, 129); // Green accent bar
    doc.rect(15, yPos - 2, 4, 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('KEY METRICS OVERVIEW', 22, yPos + 5);
    
    yPos += 13;
    
    // Calculate metrics with safe defaults
    const daysCount = Math.max(1, Math.ceil((new Date(reportForm.endDate).getTime() - new Date(reportForm.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const emissionsPerEntry = emissions.length > 0 ? (totalEmissions / emissions.length) : 0;
    const reportTypeText = reportForm.reportType.charAt(0).toUpperCase() + reportForm.reportType.slice(1);
    const performanceStatus = totalEmissions < (averageDaily * 30) ? 'On Track' : 'Needs Attention';
    
    const summaryData = [
      ['Report Type', reportTypeText],
      ['Analysis Period', `${daysCount} days`],
      ['Avg per Entry', `${emissionsPerEntry.toFixed(2)} kg CO2e`],
      ['Performance', performanceStatus]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 5
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: 70,
          textColor: [71, 85, 105]
        },
        1: { 
          halign: 'right',
          fontStyle: 'normal'
        }
      }
    });
    
    // Category Breakdown Section with modern styling
    yPos = (doc as any).lastAutoTable.finalY + 18;
    
    // Section header with background bar
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos - 2, pageWidth - 30, 10, 'F');
    
    doc.setFillColor(16, 185, 129); // Green accent bar
    doc.rect(15, yPos - 2, 4, 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('EMISSIONS BY CATEGORY', 22, yPos + 5);
    
    yPos += 13;
    
    // Clean text sanitization function
    const cleanText = (text: string): string => {
      if (!text) return '-';
      // Remove HTML entities and special chars, keep only alphanumerics, spaces, and basic punctuation
      return String(text)
        .replace(/&[^;]+;/g, '')
        .replace(/[^\w\s.,()-]/g, '')
        .trim();
    };
    
    // Build category data with cleaned text
    const categoryData = breakdown.map(item => {
      const categoryName = cleanText(String(item.category || 'Unknown'));
      const emissionValue = (item.value || 0).toFixed(2);
      const percentage = (item.percentage || 0).toFixed(1);
      
      return [
        categoryName,
        `${emissionValue} kg`,
        `${percentage}%`,
        item.percentage || 0
      ];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Emissions', 'Percentage', 'Visual']],
      body: categoryData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: 48,
          halign: 'left'
        },
        1: { 
          halign: 'right', 
          cellWidth: 35,
          textColor: [16, 185, 129],
          fontStyle: 'bold'
        },
        2: { 
          halign: 'center', 
          cellWidth: 28 
        },
        3: { 
          cellWidth: 65, 
          halign: 'center' 
        }
      },
      // Draw visual progress bars in the last column
      didDrawCell: (data) => {
        try {
          if (data.section === 'body' && data.column.index === 3 && data.cell && typeof data.cell.raw !== 'undefined') {
            const pct = Number(data.cell.raw) || 0;
            const rowIndex = data.row.index;
            const color = (breakdown[rowIndex] && breakdown[rowIndex].color) || '#10b981';
            const [r, g, b] = hexToRgb(color);

            // Bar coordinates
            const padding = 3;
            const barX = data.cell.x + padding;
            const barY = data.cell.y + (data.cell.height / 2) - 4;
            const maxBarWidth = data.cell.width - (padding * 2);
            const barWidth = Math.max(1, Math.min(maxBarWidth, (pct / 100) * maxBarWidth));

            // Background track
            doc.setFillColor(226, 232, 240);
            doc.roundedRect(barX, barY, maxBarWidth, 7, 2, 2, 'F');

            // Colored progress bar
            if (barWidth > 0) {
              doc.setFillColor(r, g, b);
              doc.roundedRect(barX, barY, barWidth, 7, 2, 2, 'F');
            }

            // Percentage text overlay
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.setFont('helvetica', 'bold');
            doc.text(`${pct.toFixed(0)}%`, barX + maxBarWidth / 2, barY + 5, { align: 'center' });
          }
        } catch (e) {
          // Silently handle drawing errors
          console.error('Chart drawing error:', e);
        }
      }
    });
    
    // Detailed Emissions Log (New Page)
    if (emissions.length > 0) {
      doc.addPage();
      
      // Consistent header for page 2
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFillColor(236, 253, 245);
      doc.rect(0, 23, pageWidth, 2, 'F');
      
      // CarbonSense Logo on page 2 (smaller version)
      const logo2X = 17;
      const logo2Y = 10;
      const logo2Size = 5;
      
      // Earth globe
      doc.setFillColor(79, 195, 247);
      doc.circle(logo2X, logo2Y, logo2Size, 'F');
      doc.setDrawColor(2, 119, 189);
      doc.setLineWidth(0.3);
      doc.circle(logo2X, logo2Y, logo2Size, 'S');
      
      // Green continents
      doc.setFillColor(76, 175, 80);
      doc.circle(logo2X - 2, logo2Y - 1, 1.2, 'F');
      doc.circle(logo2X + 1, logo2Y + 2, 1.5, 'F');
      
      // Orbit ring
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(0.6);
      doc.ellipse(logo2X, logo2Y, logo2Size + 2, 1.5, 'S');
      
      // Text beside logo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('CarbonSense - Detailed Activity Log', logo2X + 10, 13);
      
      yPos = 38;
      
      // Section header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, yPos - 2, pageWidth - 30, 10, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(15, yPos - 2, 4, 10, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('EMISSION ENTRIES LOG', 22, yPos + 5);
      
      yPos += 13;
      
      // Clean and format emission data
      const emissionData = emissions.slice(0, 50).map((item: any) => {
        const dateStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        const category = cleanText(String(item.category || 'N/A'));
        const subcategory = cleanText(String(item.subcategory || '-'));
        const quantity = `${(item.quantity || 0)} ${cleanText(item.unit || '')}`.trim();
        const emission = `${(item.co2Emissions || 0).toFixed(2)} kg`;
        
        return [dateStr, category, subcategory, quantity, emission];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Category', 'Subcategory', 'Quantity', 'CO2 Impact']],
        body: emissionData,
        theme: 'striped',
        headStyles: { 
          fillColor: [16, 185, 129], 
          textColor: [255, 255, 255], 
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: { 
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { 
            cellWidth: 28, 
            halign: 'center',
            textColor: [71, 85, 105]
          },
          1: { 
            cellWidth: 36, 
            fontStyle: 'bold',
            textColor: [30, 41, 59]
          },
          2: { 
            cellWidth: 36,
            fontSize: 7
          },
          3: { 
            cellWidth: 32, 
            halign: 'right' 
          },
          4: { 
            cellWidth: 30, 
            halign: 'right', 
            textColor: [16, 185, 129], 
            fontStyle: 'bold' 
          }
        }
      });
      
      // Note for truncated entries
      if (emissions.length > 50) {
        const remainingYPos = (doc as any).lastAutoTable.finalY + 10;
        
        // Alert box style
        doc.setFillColor(254, 249, 195); // Light amber
        doc.roundedRect(15, remainingYPos, pageWidth - 30, 12, 3, 3, 'F');
        doc.setDrawColor(251, 191, 36);
        doc.setLineWidth(1);
        doc.roundedRect(15, remainingYPos, pageWidth - 30, 12, 3, 3, 'S');
        
        // Alert icon
        doc.setFillColor(251, 191, 36);
        doc.circle(22, remainingYPos + 6, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('i', 22, remainingYPos + 8, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 53, 15);
        doc.text(
          `Displaying first 50 of ${emissions.length} total entries (${emissions.length - 50} additional records omitted)`,
          30,
          remainingYPos + 7
        );
      }
      
      // Recommendations Section
      const recommendationsY = (doc as any).lastAutoTable.finalY + 25;
      if (recommendationsY < pageHeight - 60) {
        // Section header
        doc.setFillColor(241, 245, 249);
        doc.rect(15, recommendationsY - 2, pageWidth - 30, 10, 'F');
        doc.setFillColor(16, 185, 129);
        doc.rect(15, recommendationsY - 2, 4, 10, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('SUSTAINABILITY RECOMMENDATIONS', 22, recommendationsY + 5);
        
        // Recommendation cards
        const recY = recommendationsY + 15;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        
        const recommendations = [
          { icon: '1', text: 'Use public transport or carpool to reduce travel emissions' },
          { icon: '2', text: 'Switch to LED lighting and unplug devices when not in use' },
          { icon: '3', text: 'Practice reduce, reuse, recycle to minimize waste' },
          { icon: '4', text: 'Set measurable goals to track emission reduction progress' }
        ];
        
        recommendations.forEach((rec, index) => {
          const itemY = recY + (index * 9);
          
          // Number circle
          doc.setFillColor(209, 250, 229); // Light green
          doc.circle(18, itemY, 3, 'F');
          doc.setTextColor(5, 150, 105);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(rec.icon, 18, itemY + 2, { align: 'center' });
          
          // Recommendation text
          doc.setTextColor(71, 85, 105);
          doc.setFont('helvetica', 'normal');
          doc.text(rec.text, 24, itemY + 2);
        });
      }
    }
    
    // Modern footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer background with gradient effect
      doc.setFillColor(241, 245, 249);
      doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
      
      // Top border line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
      
      // Green accent line
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1.5);
      doc.line(15, pageHeight - 16.5, pageWidth - 15, pageHeight - 16.5);
      
      // Page number
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Footer branding
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      const footerText = 'Powered by CarbonSense Carbon Tracking Platform';
      doc.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Small CarbonSense logo in footer corner
      const footerLogoX = pageWidth - 10;
      const footerLogoY = pageHeight - 10;
      const footerLogoSize = 2.5;
      
      // Mini earth
      doc.setFillColor(79, 195, 247);
      doc.circle(footerLogoX, footerLogoY, footerLogoSize, 'F');
      
      // Mini orbit
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(0.4);
      doc.ellipse(footerLogoX, footerLogoY, footerLogoSize + 1, 1, 'S');
      
      // Green dot on earth
      doc.setFillColor(76, 175, 80);
      doc.circle(footerLogoX - 1, footerLogoY - 0.5, 0.8, 'F');
      doc.circle(footerLogoX + 0.5, footerLogoY + 1, 0.6, 'F');
    }
    
    // Save PDF with descriptive filename
    const reportTypeClean = cleanText(reportForm.reportType);
    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = `CarbonSense-${reportTypeClean}-Report-${dateStamp}.pdf`;
    doc.save(fileName);
  };

  const downloadReport = async (report: Report) => {
    try {
      // Fetch actual emission data for the report period
      const emissionData = await apiService.getEmissionHistory();
      const filteredData = emissionData.filter((item: any) => {
        const date = new Date(item.date);
        const start = new Date(report.startDate);
        const end = new Date(report.endDate);
        return date >= start && date <= end;
      });

      // Calculate metrics
      const totalEmissions = filteredData.reduce((sum: number, item: any) => sum + item.co2Emissions, 0);
      
      // Build category breakdown with colors
      const categoryMap: Record<string, number> = {};
      filteredData.forEach((item: any) => {
        const cat = item.category || 'Unknown';
        categoryMap[cat] = (categoryMap[cat] || 0) + item.co2Emissions;
      });
      
      const breakdown = Object.entries(categoryMap).map(([category, value]) => ({
        category,
        value,
        percentage: totalEmissions > 0 ? (value / totalEmissions) * 100 : 0,
        color: colorMap[category.toLowerCase()] || '#6b7280'
      }));
      
      // Calculate daily average
      const daysInPeriod = Math.max(1, Math.ceil((new Date(report.endDate).getTime() - new Date(report.startDate).getTime()) / (1000 * 60 * 60 * 24)));
      const averageDaily = totalEmissions / daysInPeriod;
      
      // Temporarily set report form to match this report
      const originalForm = { ...reportForm };
      setReportForm({
        reportType: report.reportType,
        startDate: report.startDate,
        endDate: report.endDate
      });
      
      // Generate the PDF using the existing function
      setTimeout(() => {
        generatePDFReport(filteredData, totalEmissions, breakdown, averageDaily);
        setReportForm(originalForm); // Restore original form
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const deleteReport = async (reportId: number) => {
    try {
      const updatedReports = reports.filter(r => r.id !== reportId);
      saveReportsToStorage(updatedReports);
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

      {/* View Report Dialog */}
      <Dialog open={selectedReport !== null} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedReport?.reportType} Report Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 py-4">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Report Type</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                    {selectedReport.reportType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Date Range</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedReport.startDate).toLocaleDateString()} - {new Date(selectedReport.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Emissions</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedReport.totalEmissions.toFixed(1)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Generated On</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Format</p>
                  <Badge variant="secondary" className="text-sm">
                    {selectedReport.fileFormat.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                  <Badge variant="outline" className="text-sm">
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  downloadReport(selectedReport);
                  setSelectedReport(null);
                }} className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}