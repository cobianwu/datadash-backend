import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf' | 'powerpoint';
  includeCharts?: boolean;
  includeInsights?: boolean;
  template?: string;
}

export class ExportService {
  static async exportToExcel(data: any[], columns: string[], metadata?: any): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Create main data sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Add summary sheet if metadata exists
    if (metadata) {
      const summaryData = [
        { Metric: 'Total Rows', Value: data.length },
        { Metric: 'Total Columns', Value: columns.length },
        { Metric: 'Date Generated', Value: new Date().toISOString() }
      ];
      
      if (metadata.insights) {
        metadata.insights.forEach((insight: string, i: number) => {
          summaryData.push({ Metric: `Insight ${i + 1}`, Value: insight });
        });
      }
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
    
    // Add pivot tables sheet
    if (data.length > 0) {
      const pivotData = this.generatePivotTableData(data, columns);
      if (pivotData.length > 0) {
        const pivotSheet = XLSX.utils.json_to_sheet(pivotData);
        XLSX.utils.book_append_sheet(workbook, pivotSheet, 'Pivot Analysis');
      }
    }
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
  
  static async exportToCSV(data: any[], columns: string[]): Promise<string> {
    if (data.length === 0) return '';
    
    // Create header row
    const header = columns.join(',');
    
    // Create data rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  }
  
  static async exportToPDF(data: any[], columns: string[], metadata?: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Title
      doc.fontSize(20).text('Data Analysis Report', { align: 'center' });
      doc.moveDown();
      
      // Metadata
      if (metadata) {
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Total Records: ${data.length}`);
        doc.moveDown();
        
        if (metadata.insights && metadata.insights.length > 0) {
          doc.fontSize(14).text('Key Insights', { underline: true });
          doc.fontSize(10);
          metadata.insights.forEach((insight: string) => {
            doc.text(`• ${insight}`);
          });
          doc.moveDown();
        }
      }
      
      // Data table (show first 20 rows)
      doc.fontSize(14).text('Data Sample', { underline: true });
      doc.fontSize(8);
      
      const tableTop = doc.y;
      const itemHeight = 20;
      const maxRows = Math.min(20, data.length);
      
      // Table headers
      columns.forEach((col, i) => {
        doc.text(col, 50 + (i * 100), tableTop, { width: 90, ellipsis: true });
      });
      
      // Table rows
      for (let i = 0; i < maxRows; i++) {
        const row = data[i];
        const y = tableTop + (i + 1) * itemHeight;
        
        columns.forEach((col, j) => {
          const value = String(row[col] ?? '');
          doc.text(value, 50 + (j * 100), y, { width: 90, ellipsis: true });
        });
      }
      
      if (data.length > maxRows) {
        doc.moveDown();
        doc.text(`... and ${data.length - maxRows} more rows`);
      }
      
      doc.end();
    });
  }
  
  static async exportToPowerPoint(data: any[], columns: string[], charts?: any[], insights?: string[]): Promise<any> {
    // This would integrate with a PowerPoint library like pptxgenjs
    // For now, return a structured object that represents the presentation
    
    const presentation = {
      title: 'Data Analysis Presentation',
      generatedAt: new Date().toISOString(),
      slides: []
    };
    
    // Title slide
    presentation.slides.push({
      type: 'title',
      content: {
        title: 'Data Analysis Report',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        footer: `${data.length} records analyzed`
      }
    });
    
    // Executive summary slide
    if (insights && insights.length > 0) {
      presentation.slides.push({
        type: 'bullets',
        title: 'Executive Summary',
        content: insights.slice(0, 5)
      });
    }
    
    // Data overview slide
    presentation.slides.push({
      type: 'table',
      title: 'Data Overview',
      content: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Records', data.length.toString()],
          ['Data Columns', columns.length.toString()],
          ['Date Range', this.getDateRange(data, columns)],
          ['Primary Categories', this.getUniqueCount(data, columns[0])]
        ]
      }
    });
    
    // Chart slides
    if (charts) {
      charts.forEach((chart, index) => {
        presentation.slides.push({
          type: 'chart',
          title: chart.title || `Analysis ${index + 1}`,
          chartType: chart.type,
          data: chart.data
        });
      });
    }
    
    // Key findings slide
    const keyFindings = this.generateKeyFindings(data, columns);
    if (keyFindings.length > 0) {
      presentation.slides.push({
        type: 'bullets',
        title: 'Key Findings',
        content: keyFindings
      });
    }
    
    // Data sample slide
    presentation.slides.push({
      type: 'table',
      title: 'Data Sample',
      content: {
        headers: columns,
        rows: data.slice(0, 5).map(row => 
          columns.map(col => String(row[col] ?? ''))
        )
      }
    });
    
    return presentation;
  }
  
  private static generatePivotTableData(data: any[], columns: string[]): any[] {
    // Simple pivot: group by first categorical column, sum numeric columns
    const categoricalCol = columns.find(col => 
      typeof data[0][col] === 'string'
    ) || columns[0];
    
    const numericCols = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    
    if (numericCols.length === 0) return [];
    
    const groups: { [key: string]: any } = {};
    
    data.forEach(row => {
      const key = row[categoricalCol] || 'Other';
      if (!groups[key]) {
        groups[key] = { [categoricalCol]: key };
        numericCols.forEach(col => {
          groups[key][`${col}_sum`] = 0;
          groups[key][`${col}_count`] = 0;
        });
      }
      
      numericCols.forEach(col => {
        if (row[col] !== null && row[col] !== undefined) {
          groups[key][`${col}_sum`] += row[col];
          groups[key][`${col}_count`]++;
        }
      });
    });
    
    // Calculate averages
    Object.values(groups).forEach(group => {
      numericCols.forEach(col => {
        group[`${col}_avg`] = group[`${col}_count`] > 0 
          ? group[`${col}_sum`] / group[`${col}_count`] 
          : 0;
      });
    });
    
    return Object.values(groups);
  }
  
  private static getDateRange(data: any[], columns: string[]): string {
    const dateCol = columns.find(col => 
      col.toLowerCase().includes('date') || 
      data.some(row => row[col] instanceof Date || !isNaN(Date.parse(row[col])))
    );
    
    if (!dateCol) return 'N/A';
    
    const dates = data
      .map(row => new Date(row[dateCol]))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length === 0) return 'N/A';
    
    return `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`;
  }
  
  private static getUniqueCount(data: any[], column: string): string {
    const unique = new Set(data.map(row => row[column]));
    return unique.size.toString();
  }
  
  private static generateKeyFindings(data: any[], columns: string[]): string[] {
    const findings: string[] = [];
    
    // Find numeric columns with high values
    const numericCols = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    
    numericCols.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null);
      if (values.length > 0) {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        
        findings.push(`${col}: ranges from ${min.toLocaleString()} to ${max.toLocaleString()} (avg: ${avg.toLocaleString()})`);
      }
    });
    
    // Find most common categories
    const categoricalCols = columns.filter(col => 
      typeof data[0][col] === 'string'
    );
    
    categoricalCols.slice(0, 2).forEach(col => {
      const counts: { [key: string]: number } = {};
      data.forEach(row => {
        const value = row[col];
        if (value) counts[value] = (counts[value] || 0) + 1;
      });
      
      const topCategory = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (topCategory) {
        findings.push(`Most common ${col}: ${topCategory[0]} (${topCategory[1]} occurrences)`);
      }
    });
    
    return findings.slice(0, 5);
  }
}