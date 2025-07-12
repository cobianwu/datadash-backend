import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PptxGenJS from "pptxgenjs";

interface SlideData {
  title: string;
  content: any;
  chartType?: string;
}

export function PowerPointExport({ company, data }: { company?: any, data?: any }) {
  const { toast } = useToast();

  const generatePowerPoint = async () => {
    console.log("PowerPoint export started...");
    try {
      const pptx = new PptxGenJS();
      
      // Configure presentation
      pptx.author = "DataFlow Analytics";
      pptx.company = "DataFlow Analytics Platform";
      pptx.subject = "Investment Analysis Report";
      pptx.title = `${company?.name || 'Company'} - Investment Analysis`;
      
      // Define color scheme
      const colors = {
        primary: "#3B82F6",
        secondary: "#1F2937",
        accent: "#10B981",
        text: "#374151",
      };

      // Slide 1: Title Slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: colors.primary };
      titleSlide.addText(`${company?.name || 'Company'} Investment Analysis`, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 1,
        fontSize: 44,
        bold: true,
        color: "FFFFFF",
        align: "center",
      });
      titleSlide.addText("Private Equity Due Diligence Report", {
        x: 0.5,
        y: 3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        color: "FFFFFF",
        align: "center",
      });
      titleSlide.addText(new Date().toLocaleDateString(), {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.5,
        fontSize: 18,
        color: "FFFFFF",
        align: "center",
      });

      // Slide 2: Executive Summary
      const execSlide = pptx.addSlide();
      execSlide.addText("Executive Summary", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });
      
      const summaryPoints = [
        { text: `Company: ${company?.name || 'Target Company'}`, options: { bullet: true } },
        { text: `Sector: ${company?.industry || 'Technology'}`, options: { bullet: true } },
        { text: `Revenue: $${((company?.revenue || 280000000) / 1000000).toFixed(0)}M`, options: { bullet: true } },
        { text: `Growth Rate: ${company?.growthRate || 33}% YoY`, options: { bullet: true } },
        { text: `Valuation: $${((company?.valuation || 4200000000) / 1000000000).toFixed(1)}B`, options: { bullet: true } },
        { text: `Investment Stage: ${company?.stage || 'Series C'}`, options: { bullet: true } },
        { text: `Recommendation: Proceed with investment`, options: { bullet: true } },
      ];
      
      execSlide.addText(summaryPoints, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: colors.text,
        lineSpacing: 36,
      });

      // Slide 3: Financial Overview
      const finSlide = pptx.addSlide();
      finSlide.addText("Financial Overview", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      // Add financial chart
      const chartData = [
        { name: "2021", values: [120] },
        { name: "2022", values: [180] },
        { name: "2023", values: [240] },
        { name: "2024", values: [280] },
        { name: "2025E", values: [350] },
      ];

      finSlide.addChart(pptx.ChartType.bar, chartData, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        showTitle: true,
        title: "Revenue Growth ($M)",
        showValue: true,
        barDir: "col",
        barGrouping: "clustered",
        valAxisTitle: "Revenue ($M)",
        catAxisTitle: "Year",
        chartColors: [colors.primary],
      });

      // Slide 4: Unit Economics
      const unitSlide = pptx.addSlide();
      unitSlide.addText("Unit Economics", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const unitMetrics = [
        { metric: "CAC", value: "$255" },
        { metric: "LTV", value: "$107,700" },
        { metric: "LTV/CAC", value: "422.7x" },
        { metric: "Payback Period", value: "2.8 months" },
        { metric: "Gross Margin", value: "85%" },
        { metric: "NRR", value: "165%" },
      ];

      // Create table for unit economics
      const rows = [["Metric", "Value"]];
      unitMetrics.forEach(item => rows.push([item.metric, item.value]));

      unitSlide.addTable(rows, {
        x: 2,
        y: 2,
        w: 6,
        h: 3,
        fontSize: 16,
        border: { type: "solid", color: "E5E7EB", pt: 1 },
        fill: { color: "F9FAFB" },
        align: "center",
        valign: "middle",
      });

      // Slide 5: Market Analysis
      const marketSlide = pptx.addSlide();
      marketSlide.addText("Market Analysis", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      // Pie chart for market segments
      const pieData = [
        { name: "Enterprise", values: [50] },
        { name: "SMB", values: [30] },
        { name: "Consumer", values: [20] },
      ];

      marketSlide.addChart(pptx.ChartType.pie, pieData, {
        x: 0.5,
        y: 1.5,
        w: 4,
        h: 4,
        showTitle: true,
        title: "Revenue by Segment",
        showPercent: true,
        showLegend: true,
        legendPos: "r",
        chartColors: [colors.primary, colors.accent, "#F59E0B"],
      });

      // Geographic distribution
      const geoData = [
        { name: "US", values: [60] },
        { name: "Europe", values: [20] },
        { name: "APAC", values: [10] },
        { name: "LATAM", values: [10] },
      ];

      marketSlide.addChart(pptx.ChartType.doughnut, geoData, {
        x: 5,
        y: 1.5,
        w: 4,
        h: 4,
        showTitle: true,
        title: "Geographic Distribution",
        showPercent: true,
        showLegend: true,
        legendPos: "r",
        chartColors: ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"],
      });

      // Slide 6: Investment Thesis
      const thesisSlide = pptx.addSlide();
      thesisSlide.addText("Investment Thesis", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const thesisPoints = [
        { text: "Exceptional unit economics with LTV/CAC > 400x", options: { bullet: true } },
        { text: "Strong product-market fit in enterprise segment", options: { bullet: true } },
        { text: "Clear path to $1B ARR within 3 years", options: { bullet: true } },
        { text: "Proven land-and-expand motion", options: { bullet: true } },
        { text: "Best-in-class NRR of 165%", options: { bullet: true } },
        { text: "TAM expansion through AI capabilities", options: { bullet: true } },
        { text: "15-20x ARR valuation justified by growth metrics", options: { bullet: true } },
      ];

      thesisSlide.addText(thesisPoints, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: colors.text,
        lineSpacing: 36,
      });

      // Slide 7: Risks & Mitigation
      const riskSlide = pptx.addSlide();
      riskSlide.addText("Risk Analysis", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const riskTable = [
        ["Risk Category", "Impact", "Mitigation Strategy"],
        ["Market Saturation", "Medium", "Expand internationally & vertically"],
        ["Competition", "High", "Build moat through AI & integrations"],
        ["Regulatory", "Low", "Proactive compliance framework"],
        ["Talent Retention", "Medium", "Equity incentives & culture"],
        ["Technology Debt", "Low", "Continuous refactoring budget"],
      ];

      riskSlide.addTable(riskTable, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 14,
        border: { type: "solid", color: "E5E7EB", pt: 1 },
        fill: { color: "F9FAFB" },
        align: "left",
        valign: "middle",
      });

      // Slide 8: Financial Projections
      const projSlide = pptx.addSlide();
      projSlide.addText("Financial Projections", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const projectionData = [
        { name: "2024", values: [280, 238, 322] },
        { name: "2025", values: [420, 357, 483] },
        { name: "2026", values: [630, 535, 724] },
        { name: "2027", values: [945, 803, 1087] },
      ];

      projSlide.addChart(pptx.ChartType.line, projectionData, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        showTitle: true,
        title: "Revenue Projections - Base/Bear/Bull Cases ($M)",
        showValue: true,
        showLegend: true,
        legendPos: "b",
        chartColors: [colors.primary, "#EF4444", colors.accent],
        lineDataSymbol: "circle",
        lineDataSymbolSize: 8,
      });

      // Slide 9: Due Diligence Checklist
      const ddSlide = pptx.addSlide();
      ddSlide.addText("Due Diligence Progress", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const ddItems = [
        { item: "Financial Analysis", status: "✓ Complete" },
        { item: "Market Research", status: "✓ Complete" },
        { item: "Technology Assessment", status: "✓ Complete" },
        { item: "Management Interviews", status: "⚡ In Progress" },
        { item: "Customer References", status: "⚡ In Progress" },
        { item: "Legal Review", status: "○ Pending" },
        { item: "ESG Assessment", status: "○ Pending" },
      ];

      const ddRows = [["Due Diligence Item", "Status"]];
      ddItems.forEach(item => ddRows.push([item.item, item.status]));

      ddSlide.addTable(ddRows, {
        x: 2,
        y: 1.5,
        w: 6,
        h: 4,
        fontSize: 16,
        border: { type: "solid", color: "E5E7EB", pt: 1 },
        fill: { color: "F9FAFB" },
        align: "left",
        valign: "middle",
      });

      // Slide 10: Next Steps
      const nextSlide = pptx.addSlide();
      nextSlide.addText("Next Steps & Timeline", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: colors.secondary,
      });

      const timeline = [
        { text: "Week 1-2: Complete management meetings & reference calls", options: { bullet: true } },
        { text: "Week 3: Finalize legal and compliance review", options: { bullet: true } },
        { text: "Week 4: Negotiate term sheet and valuation", options: { bullet: true } },
        { text: "Week 5: Investment committee presentation", options: { bullet: true } },
        { text: "Week 6: Execute definitive agreements", options: { bullet: true } },
        { text: "Week 7-8: Close transaction & begin integration", options: { bullet: true } },
      ];

      nextSlide.addText(timeline, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        fontSize: 18,
        color: colors.text,
        lineSpacing: 36,
      });

      // Save the presentation
      const fileName = `${company?.name || 'Company'}_Investment_Analysis_${new Date().toISOString().split('T')[0]}.pptx`;
      console.log("Saving PowerPoint file:", fileName);
      await pptx.writeFile({ fileName });

      toast({
        title: "PowerPoint Generated Successfully",
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating PowerPoint:", error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PowerPoint. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={generatePowerPoint} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Generate PowerPoint
    </Button>
  );
}