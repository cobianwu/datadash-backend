import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SlideData {
  title: string;
  content: any;
  chartType?: string;
}

export function PowerPointExport({ slides }: { slides: SlideData[] }) {
  const { toast } = useToast();

  const generatePowerPoint = () => {
    // In a real implementation, this would use a library like PptxGenJS
    // to generate actual PowerPoint files
    
    // For demonstration, we'll show what the export would contain
    const slideOutline = `
DataFlow Analytics - Investment Analysis Report

Slide 1: Executive Summary
- Company: CloudTech SaaS
- ARR: $1.97B (2024)
- Growth: 33% CAGR (10-year)
- Recommendation: Proceed with investment

Slide 2: Financial Overview
- Revenue Growth Chart
- Key Metrics Dashboard
- Rule of 40: 155

Slide 3: Unit Economics
- LTV/CAC: 422.7x
- Payback Period: 2.8 months
- CAC: $255
- LTV: $107,700

Slide 4: Segment Analysis
- Enterprise: $82M (50%)
- SMB: $49M (30%)
- Consumer: $33M (20%)

Slide 5: Geographic Distribution
- US: 60%
- Europe: 20%
- APAC: 10%
- LATAM: 10%

Slide 6: Cohort Retention
- M1 Retention: 99%
- M12 Retention: 88%
- NRR: 165%

Slide 7: Growth Forecast
- Base Case: $945M by 2027
- Bull Case: $1.46B by 2027
- Bear Case: $615M by 2027

Slide 8: Investment Risks
- Market Saturation
- Competition
- Regulatory

Slide 9: Investment Thesis
- Strong unit economics
- Proven land & expand
- Clear path to $1B ARR
- 15-20x ARR valuation justified

Slide 10: Next Steps
- Final due diligence
- Management meetings
- Legal review
- Investment committee
    `;

    toast({
      title: "PowerPoint Export Generated",
      description: "Your investment analysis deck is ready for download",
    });

    // Simulate download
    const blob = new Blob([slideOutline], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CloudTech_SaaS_Investment_Analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={generatePowerPoint} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Generate PowerPoint
    </Button>
  );
}