import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface ExcelExportProps {
  data?: any;
  fileName?: string;
  company?: any;
}

export function ExcelExport({ data, fileName = "dataflow_export", company }: ExcelExportProps) {
  const { toast } = useToast();

  const generateExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Executive Summary
      const summaryData = [
        ["DataFlow Analytics - Investment Analysis Report"],
        ["Generated on:", new Date().toLocaleDateString()],
        [""],
        ["Company Overview"],
        ["Company Name:", company?.name || "Target Company"],
        ["Industry:", company?.industry || "Technology"],
        ["Revenue:", `$${((company?.revenue || 280000000) / 1000000).toFixed(0)}M`],
        ["Growth Rate:", `${company?.growthRate || 33}%`],
        ["Valuation:", `$${((company?.valuation || 4200000000) / 1000000000).toFixed(1)}B`],
        ["Investment Stage:", company?.stage || "Series C"],
        [""],
        ["Key Metrics"],
        ["Total Portfolio Value:", "$5.7B"],
        ["Active Investments:", "47"],
        ["Average IRR:", "24.8%"],
        ["Data Quality Score:", "94%"],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Apply some formatting
      summarySheet["A1"] = { v: summaryData[0][0], s: { font: { bold: true, sz: 16 } } };
      summarySheet["A4"] = { v: summaryData[3][0], s: { font: { bold: true, sz: 14 } } };
      summarySheet["A12"] = { v: summaryData[11][0], s: { font: { bold: true, sz: 14 } } };
      
      // Set column widths
      summarySheet["!cols"] = [{ wch: 25 }, { wch: 30 }];
      
      XLSX.utils.book_append_sheet(wb, summarySheet, "Executive Summary");

      // Sheet 2: Financial Data
      const financialData = [
        ["Financial Analysis"],
        [""],
        ["Revenue by Year"],
        ["Year", "Revenue ($M)", "Growth Rate", "Gross Margin", "EBITDA Margin"],
        ["2021", 120, "45%", "82%", "15%"],
        ["2022", 180, "50%", "83%", "18%"],
        ["2023", 240, "33%", "84%", "22%"],
        ["2024", 280, "17%", "85%", "25%"],
        ["2025E", 350, "25%", "86%", "28%"],
        ["2026E", 455, "30%", "87%", "30%"],
        ["2027E", 615, "35%", "88%", "32%"],
        [""],
        ["Unit Economics"],
        ["Metric", "Value", "Industry Benchmark", "Performance"],
        ["CAC", "$255", "$500", "Excellent"],
        ["LTV", "$107,700", "$25,000", "Exceptional"],
        ["LTV/CAC", "422.7x", "3.0x", "Outstanding"],
        ["Payback Period", "2.8 months", "12 months", "Excellent"],
        ["Gross Margin", "85%", "70%", "Above Average"],
        ["NRR", "165%", "120%", "Excellent"],
      ];

      const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
      financialSheet["A1"] = { v: financialData[0][0], s: { font: { bold: true, sz: 16 } } };
      financialSheet["A3"] = { v: financialData[2][0], s: { font: { bold: true, sz: 14 } } };
      financialSheet["A13"] = { v: financialData[12][0], s: { font: { bold: true, sz: 14 } } };
      
      XLSX.utils.book_append_sheet(wb, financialSheet, "Financial Analysis");

      // Sheet 3: Market Analysis
      const marketData = [
        ["Market Analysis"],
        [""],
        ["Revenue by Segment"],
        ["Segment", "Revenue ($M)", "Percentage", "Growth Rate", "Customer Count"],
        ["Enterprise", 140, "50%", "45%", 250],
        ["SMB", 84, "30%", "35%", 1200],
        ["Consumer", 56, "20%", "25%", 8500],
        [""],
        ["Geographic Distribution"],
        ["Region", "Revenue ($M)", "Percentage", "Growth Rate", "Office Locations"],
        ["United States", 168, "60%", "40%", "SF, NYC, Austin"],
        ["Europe", 56, "20%", "30%", "London, Berlin"],
        ["APAC", 28, "10%", "55%", "Singapore, Tokyo"],
        ["LATAM", 28, "10%", "65%", "São Paulo, Mexico City"],
        [""],
        ["Customer Metrics"],
        ["Metric", "Value", "YoY Change"],
        ["Total Customers", 9950, "+35%"],
        ["Enterprise Customers", 250, "+45%"],
        ["Average Contract Value", "$28,000", "+22%"],
        ["Logo Retention", "92%", "+2%"],
        ["Dollar Retention", "165%", "+15%"],
      ];

      const marketSheet = XLSX.utils.aoa_to_sheet(marketData);
      marketSheet["A1"] = { v: marketData[0][0], s: { font: { bold: true, sz: 16 } } };
      marketSheet["A3"] = { v: marketData[2][0], s: { font: { bold: true, sz: 14 } } };
      marketSheet["A9"] = { v: marketData[8][0], s: { font: { bold: true, sz: 14 } } };
      marketSheet["A16"] = { v: marketData[15][0], s: { font: { bold: true, sz: 14 } } };
      
      XLSX.utils.book_append_sheet(wb, marketSheet, "Market Analysis");

      // Sheet 4: Cohort Analysis
      const cohortData = [
        ["Cohort Retention Analysis"],
        [""],
        ["Monthly Cohort Retention"],
        ["Cohort", "M0", "M1", "M3", "M6", "M12", "M24"],
        ["Jan 2023", "100%", "98%", "95%", "92%", "88%", "82%"],
        ["Apr 2023", "100%", "99%", "96%", "93%", "89%", "84%"],
        ["Jul 2023", "100%", "99%", "97%", "94%", "90%", "85%"],
        ["Oct 2023", "100%", "99%", "97%", "95%", "91%", "-"],
        ["Jan 2024", "100%", "99%", "98%", "96%", "-", "-"],
        ["Apr 2024", "100%", "99%", "98%", "-", "-", "-"],
        [""],
        ["Revenue Expansion by Cohort"],
        ["Cohort", "Initial ACV", "M6 ACV", "M12 ACV", "M24 ACV", "Expansion %"],
        ["2022 Cohort", "$25,000", "$32,500", "$41,250", "$53,625", "114%"],
        ["2023 Q1", "$27,000", "$35,100", "$44,550", "-", "65%"],
        ["2023 Q2", "$28,000", "$36,400", "$46,200", "-", "65%"],
        ["2023 Q3", "$29,000", "$37,700", "-", "-", "30%"],
        ["2023 Q4", "$30,000", "$39,000", "-", "-", "30%"],
      ];

      const cohortSheet = XLSX.utils.aoa_to_sheet(cohortData);
      cohortSheet["A1"] = { v: cohortData[0][0], s: { font: { bold: true, sz: 16 } } };
      cohortSheet["A3"] = { v: cohortData[2][0], s: { font: { bold: true, sz: 14 } } };
      cohortSheet["A12"] = { v: cohortData[11][0], s: { font: { bold: true, sz: 14 } } };
      
      XLSX.utils.book_append_sheet(wb, cohortSheet, "Cohort Analysis");

      // Sheet 5: Risk Analysis
      const riskData = [
        ["Risk Assessment Matrix"],
        [""],
        ["Risk Category", "Impact", "Probability", "Risk Score", "Mitigation Strategy", "Owner"],
        ["Market Saturation", "Medium", "Medium", "6", "Expand internationally & new verticals", "CEO"],
        ["Competition", "High", "High", "9", "Build moat through AI & integrations", "CTO"],
        ["Regulatory", "Low", "Low", "2", "Proactive compliance framework", "Legal"],
        ["Talent Retention", "Medium", "Medium", "6", "Equity incentives & culture", "HR"],
        ["Technology Debt", "Low", "Medium", "3", "Continuous refactoring budget", "CTO"],
        ["Customer Concentration", "High", "Low", "3", "Diversify customer base", "Sales"],
        ["Data Security", "High", "Low", "3", "SOC2, ISO27001 compliance", "CISO"],
        ["Economic Downturn", "High", "Medium", "6", "Focus on enterprise & multi-year deals", "CFO"],
        [""],
        ["Risk Scoring: Impact x Probability (1-3 scale each, 9 max)"],
      ];

      const riskSheet = XLSX.utils.aoa_to_sheet(riskData);
      riskSheet["A1"] = { v: riskData[0][0], s: { font: { bold: true, sz: 16 } } };
      
      XLSX.utils.book_append_sheet(wb, riskSheet, "Risk Analysis");

      // Sheet 6: Financial Projections
      const projectionData = [
        ["Financial Projections (3 Scenarios)"],
        [""],
        ["Base Case Scenario"],
        ["Year", "Revenue ($M)", "Growth %", "Gross Margin", "EBITDA ($M)", "FCF ($M)"],
        ["2024", 280, "17%", "85%", 70, 56],
        ["2025", 420, "50%", "86%", 126, 101],
        ["2026", 630, "50%", "87%", 220, 176],
        ["2027", 945, "50%", "88%", 378, 302],
        [""],
        ["Bull Case Scenario (+15%)"],
        ["Year", "Revenue ($M)", "Growth %", "Gross Margin", "EBITDA ($M)", "FCF ($M)"],
        ["2024", 322, "35%", "86%", 90, 72],
        ["2025", 483, "50%", "87%", 159, 127],
        ["2026", 724, "50%", "88%", 275, 220],
        ["2027", 1087, "50%", "89%", 466, 373],
        [""],
        ["Bear Case Scenario (-15%)"],
        ["Year", "Revenue ($M)", "Growth %", "Gross Margin", "EBITDA ($M)", "FCF ($M)"],
        ["2024", 238, "0%", "84%", 48, 38],
        ["2025", 357, "50%", "85%", 89, 71],
        ["2026", 535, "50%", "86%", 156, 125],
        ["2027", 803, "50%", "87%", 273, 218],
      ];

      const projectionSheet = XLSX.utils.aoa_to_sheet(projectionData);
      projectionSheet["A1"] = { v: projectionData[0][0], s: { font: { bold: true, sz: 16 } } };
      projectionSheet["A3"] = { v: projectionData[2][0], s: { font: { bold: true, sz: 14 } } };
      projectionSheet["A10"] = { v: projectionData[9][0], s: { font: { bold: true, sz: 14 } } };
      projectionSheet["A17"] = { v: projectionData[16][0], s: { font: { bold: true, sz: 14 } } };
      
      XLSX.utils.book_append_sheet(wb, projectionSheet, "Financial Projections");

      // Sheet 7: Due Diligence Checklist
      const ddData = [
        ["Due Diligence Checklist"],
        [""],
        ["Category", "Item", "Status", "Owner", "Due Date", "Notes"],
        ["Financial", "3-Year Audited Financials", "Complete", "CFO", "2024-01-15", "Clean audit opinion"],
        ["Financial", "Revenue Recognition Policy", "Complete", "CFO", "2024-01-15", "ASC 606 compliant"],
        ["Financial", "Customer Contracts Review", "Complete", "Legal", "2024-01-20", "Standard MSAs"],
        ["Legal", "IP Portfolio Review", "Complete", "Legal", "2024-01-18", "45 patents filed"],
        ["Legal", "Litigation History", "Complete", "Legal", "2024-01-18", "No material litigation"],
        ["Technology", "Code Quality Assessment", "Complete", "CTO", "2024-01-22", "Above industry standards"],
        ["Technology", "Security Audit", "Complete", "CISO", "2024-01-22", "SOC2 Type II"],
        ["Market", "Competitive Analysis", "Complete", "Strategy", "2024-01-25", "Strong positioning"],
        ["Market", "Customer References", "In Progress", "Sales", "2024-02-05", "15/20 completed"],
        ["Management", "Executive Interviews", "In Progress", "CEO", "2024-02-10", "3/5 completed"],
        ["ESG", "Sustainability Assessment", "Pending", "Operations", "2024-02-15", "Scheduled"],
        ["ESG", "Diversity Metrics", "Pending", "HR", "2024-02-15", "Data collection"],
      ];

      const ddSheet = XLSX.utils.aoa_to_sheet(ddData);
      ddSheet["A1"] = { v: ddData[0][0], s: { font: { bold: true, sz: 16 } } };
      
      XLSX.utils.book_append_sheet(wb, ddSheet, "Due Diligence");

      // Add custom data if provided
      if (data && Array.isArray(data)) {
        const customSheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, customSheet, "Custom Data");
      }

      // Generate Excel file
      const excelFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, excelFileName);

      toast({
        title: "Excel Export Successful",
        description: `${excelFileName} has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Export Error",
        description: "Failed to generate Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generateExcel} variant="outline" className="flex items-center gap-2">
      <FileSpreadsheet className="h-4 w-4" />
      Export to Excel
    </Button>
  );
}