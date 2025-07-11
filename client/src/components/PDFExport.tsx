import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFExportProps {
  data?: any;
  fileName?: string;
  company?: any;
  charts?: HTMLElement[];
}

export function PDFExport({ data, fileName = "dataflow_report", company, charts }: PDFExportProps) {
  const { toast } = useToast();

  const generatePDF = async () => {
    console.log("PDF export started...");
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Define colors
      const primaryColor = [59, 130, 246]; // Blue
      const textColor = [55, 65, 81]; // Gray

      // Title Page
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 50, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${company?.name || 'Company'} Investment Analysis`, 105, 25, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text("Private Equity Due Diligence Report", 105, 35, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(new Date().toLocaleDateString(), 105, 43, { align: "center" });

      // Logo/Brand
      pdf.setTextColor(...textColor);
      pdf.setFontSize(10);
      pdf.text("DataFlow Analytics Platform", 105, 70, { align: "center" });

      // Executive Summary
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Executive Summary", 20, 90);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      const summaryData = [
        ["Company", company?.name || "Target Company"],
        ["Industry", company?.industry || "Technology"],
        ["Revenue", `$${((company?.revenue || 280000000) / 1000000).toFixed(0)}M`],
        ["Growth Rate", `${company?.growthRate || 33}% YoY`],
        ["Valuation", `$${((company?.valuation || 4200000000) / 1000000000).toFixed(1)}B`],
        ["Investment Stage", company?.stage || "Series C"],
        ["Recommendation", "Proceed with investment"],
      ];

      pdf.autoTable({
        startY: 95,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // New Page - Financial Analysis
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Financial Analysis", 20, 20);

      // Unit Economics Table
      pdf.setFontSize(14);
      pdf.text("Unit Economics", 20, 35);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const unitEconomicsData = [
        ["CAC", "$255", "Excellent"],
        ["LTV", "$107,700", "Exceptional"],
        ["LTV/CAC", "422.7x", "Outstanding"],
        ["Payback Period", "2.8 months", "Excellent"],
        ["Gross Margin", "85%", "Above Average"],
        ["NRR", "165%", "Best-in-class"],
        ["Rule of 40", "155", "Exceptional"],
      ];

      pdf.autoTable({
        startY: 40,
        head: [["Metric", "Value", "Performance"]],
        body: unitEconomicsData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // Revenue Projections
      let yPos = pdf.lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Revenue Projections", 20, yPos);
      
      const projectionData = [
        ["2024", "$280M", "17%", "Base Case"],
        ["2025", "$420M", "50%", "Base Case"],
        ["2026", "$630M", "50%", "Base Case"],
        ["2027", "$945M", "50%", "Base Case"],
      ];

      pdf.autoTable({
        startY: yPos + 5,
        head: [["Year", "Revenue", "Growth", "Scenario"]],
        body: projectionData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // New Page - Market Analysis
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Market Analysis", 20, 20);

      // Market Segments
      pdf.setFontSize(14);
      pdf.text("Revenue by Segment", 20, 35);

      const segmentData = [
        ["Enterprise", "$140M", "50%", "45% growth"],
        ["SMB", "$84M", "30%", "35% growth"],
        ["Consumer", "$56M", "20%", "25% growth"],
      ];

      pdf.autoTable({
        startY: 40,
        head: [["Segment", "Revenue", "% of Total", "Growth Rate"]],
        body: segmentData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // Geographic Distribution
      yPos = pdf.lastAutoTable.finalY + 15;
      pdf.setFontSize(14);
      pdf.text("Geographic Distribution", 20, yPos);

      const geoData = [
        ["United States", "$168M", "60%", "SF, NYC, Austin"],
        ["Europe", "$56M", "20%", "London, Berlin"],
        ["APAC", "$28M", "10%", "Singapore, Tokyo"],
        ["LATAM", "$28M", "10%", "São Paulo, Mexico City"],
      ];

      pdf.autoTable({
        startY: yPos + 5,
        head: [["Region", "Revenue", "% of Total", "Offices"]],
        body: geoData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // New Page - Investment Thesis
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Investment Thesis", 20, 20);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      const thesisPoints = [
        "• Exceptional unit economics with LTV/CAC ratio exceeding 400x",
        "• Strong product-market fit demonstrated in enterprise segment",
        "• Clear path to $1B ARR within 3 years based on current growth trajectory",
        "• Proven land-and-expand motion with 165% net revenue retention",
        "• Best-in-class gross margins of 85% indicating pricing power",
        "• TAM expansion opportunity through AI and automation capabilities",
        "• 15-20x ARR valuation justified by superior growth metrics",
        "• Strong competitive moat through network effects and switching costs",
      ];

      let textY = 35;
      thesisPoints.forEach(point => {
        pdf.text(point, 20, textY);
        textY += 8;
      });

      // Risk Analysis
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Risk Analysis", 20, textY + 10);

      const riskData = [
        ["Market Saturation", "Medium", "Expand internationally"],
        ["Competition", "High", "Build AI moat"],
        ["Regulatory", "Low", "Proactive compliance"],
        ["Talent Retention", "Medium", "Equity incentives"],
        ["Technology Debt", "Low", "Continuous refactoring"],
      ];

      pdf.autoTable({
        startY: textY + 15,
        head: [["Risk", "Impact", "Mitigation"]],
        body: riskData,
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        margin: { left: 20, right: 20 },
      });

      // New Page - Due Diligence Status
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Due Diligence Progress", 20, 20);

      const ddData = [
        ["Financial Analysis", "✓ Complete", "Clean audit opinion"],
        ["Market Research", "✓ Complete", "Strong positioning"],
        ["Technology Assessment", "✓ Complete", "Above standards"],
        ["Management Interviews", "⚡ In Progress", "3/5 completed"],
        ["Customer References", "⚡ In Progress", "15/20 completed"],
        ["Legal Review", "○ Pending", "Scheduled next week"],
        ["ESG Assessment", "○ Pending", "Data collection phase"],
      ];

      pdf.autoTable({
        startY: 30,
        head: [["Item", "Status", "Notes"]],
        body: ddData,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      // Next Steps
      yPos = pdf.lastAutoTable.finalY + 20;
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Next Steps", 20, yPos);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      const nextSteps = [
        "1. Complete remaining management interviews by end of week",
        "2. Finalize customer reference calls (5 remaining)",
        "3. Conduct legal and compliance review",
        "4. Negotiate term sheet with target valuation of $4.0-4.5B",
        "5. Present to investment committee",
        "6. Execute definitive agreements",
      ];

      textY = yPos + 10;
      nextSteps.forEach(step => {
        pdf.text(step, 20, textY);
        textY += 7;
      });

      // Add Charts if provided
      if (charts && charts.length > 0) {
        for (const chart of charts) {
          try {
            const canvas = await html2canvas(chart, {
              scale: 2,
              backgroundColor: "#ffffff",
            });
            
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text("Data Visualization", 20, 20);
            
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);
          } catch (err) {
            console.error("Error adding chart to PDF:", err);
          }
        }
      }

      // Footer on each page
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount} | DataFlow Analytics | Confidential`,
          105,
          285,
          { align: "center" }
        );
      }

      // Save the PDF
      const pdfFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Saving PDF file:", pdfFileName);
      pdf.save(pdfFileName);

      toast({
        title: "PDF Generated Successfully",
        description: `${pdfFileName} has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
      <FileDown className="h-4 w-4" />
      Export to PDF
    </Button>
  );
}