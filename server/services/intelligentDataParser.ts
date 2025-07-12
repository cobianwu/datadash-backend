import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface ColumnMapping {
  originalName: string;
  standardName: string;
  type: 'metric' | 'dimension' | 'date' | 'calculated';
  unit?: string;
  format?: string;
}

interface SheetMetadata {
  name: string;
  market?: string;
  segment?: string;
  state?: string;
  dataType?: string; // P&L, operational, customer, etc.
  columns: ColumnMapping[];
  dateColumns: string[];
  metricColumns: string[];
  dimensionColumns: string[];
}

export class IntelligentDataParser {
  private static readonly METRIC_PATTERNS = {
    revenue: /^(revenue|sales|income|turnover|top.?line)/i,
    ebitda: /^(ebitda|earnings.?before|operating.?income)/i,
    grossProfit: /^(gross.?profit|gp|gross.?margin.?\$)/i,
    grossMargin: /^(gross.?margin.?%|gm.?%|gp.?%)/i,
    netProfit: /^(net.?profit|net.?income|bottom.?line)/i,
    expenses: /^(expenses?|costs?|opex|operating.?expenses?)/i,
    units: /^(units?|volume|quantity|qty)/i,
    price: /^(price|pricing|asp|average.?selling)/i,
    customers: /^(customers?|clients?|accounts?)/i,
    retention: /^(retention|churn|renewal)/i,
    productivity: /^(productivity|efficiency|utilization)/i,
    margin: /margin.?%|margin$/i,
  };

  private static readonly DIMENSION_PATTERNS = {
    market: /^(market|location|region|territory|geography)/i,
    segment: /^(segment|category|product.?line|business.?unit)/i,
    channel: /^(channel|source|distribution)/i,
    state: /^(state|province)/i,
    date: /^(date|month|quarter|year|period)/i,
    customer: /^(customer|client|account)/i,
  };

  private static readonly CALCULATED_METRICS = {
    'ebitda_margin': {
      formula: 'EBITDA / Revenue * 100',
      requires: ['ebitda', 'revenue'],
      unit: '%',
      format: '0.1%'
    },
    'gross_margin': {
      formula: 'Gross Profit / Revenue * 100',
      requires: ['grossProfit', 'revenue'],
      unit: '%',
      format: '0.1%'
    },
    'net_margin': {
      formula: 'Net Profit / Revenue * 100',
      requires: ['netProfit', 'revenue'],
      unit: '%',
      format: '0.1%'
    },
    'revenue_per_customer': {
      formula: 'Revenue / Customers',
      requires: ['revenue', 'customers'],
      unit: '$',
      format: '$0,0'
    },
    'price_per_unit': {
      formula: 'Revenue / Units',
      requires: ['revenue', 'units'],
      unit: '$',
      format: '$0.00'
    }
  };

  static async parseMultiSheetExcel(buffer: Buffer): Promise<{
    sheets: SheetMetadata[];
    data: Record<string, any[]>;
    summary: any;
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheets: SheetMetadata[] = [];
    const data: Record<string, any[]> = {};
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { 
        header: 1, 
        defval: null,
        blankrows: false 
      });
      
      if (jsonData.length < 2) continue;
      
      // Intelligently parse sheet
      const sheetMeta = this.analyzeSheet(sheetName, jsonData as any[][]);
      sheets.push(sheetMeta);
      
      // Convert to structured data
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];
      
      data[sheetName] = rows.map(row => {
        const obj: any = {};
        headers.forEach((header, idx) => {
          const mapping = sheetMeta.columns.find(col => col.originalName === header);
          const key = mapping ? mapping.standardName : header;
          obj[key] = this.parseValue(row[idx], mapping?.type);
        });
        
        // Add metadata
        obj._sheet = sheetName;
        obj._market = sheetMeta.market;
        obj._segment = sheetMeta.segment;
        obj._state = sheetMeta.state;
        
        return obj;
      });
    }
    
    // Generate summary
    const summary = this.generateWorkbookSummary(sheets, data);
    
    return { sheets, data, summary };
  }

  private static analyzeSheet(sheetName: string, data: any[][]): SheetMetadata {
    const headers = data[0] || [];
    const sampleRows = data.slice(1, 10);
    
    // Extract metadata from sheet name
    const metadata: SheetMetadata = {
      name: sheetName,
      columns: [],
      dateColumns: [],
      metricColumns: [],
      dimensionColumns: []
    };
    
    // Parse sheet name for market/segment info
    const nameParts = sheetName.split(/[-_\s]+/);
    nameParts.forEach(part => {
      if (this.isUSState(part)) metadata.state = part;
      if (this.isMarket(part)) metadata.market = part;
      if (this.isSegment(part)) metadata.segment = part;
    });
    
    // Analyze columns
    headers.forEach((header, idx) => {
      const columnType = this.detectColumnType(header, sampleRows.map(row => row[idx]));
      const mapping: ColumnMapping = {
        originalName: header,
        standardName: this.standardizeColumnName(header, columnType.type),
        type: columnType.type,
        unit: columnType.unit,
        format: columnType.format
      };
      
      metadata.columns.push(mapping);
      
      if (columnType.type === 'date') {
        metadata.dateColumns.push(mapping.standardName);
      } else if (columnType.type === 'metric') {
        metadata.metricColumns.push(mapping.standardName);
      } else if (columnType.type === 'dimension') {
        metadata.dimensionColumns.push(mapping.standardName);
      }
    });
    
    return metadata;
  }

  private static detectColumnType(header: string, sampleValues: any[]): {
    type: 'metric' | 'dimension' | 'date' | 'calculated';
    unit?: string;
    format?: string;
  } {
    const headerLower = header.toLowerCase();
    
    // Check for date columns
    if (this.DIMENSION_PATTERNS.date.test(header)) {
      return { type: 'date', format: 'MMM YYYY' };
    }
    
    // Check for metric columns
    for (const [metricType, pattern] of Object.entries(this.METRIC_PATTERNS)) {
      if (pattern.test(header)) {
        const unit = this.detectUnit(header, sampleValues);
        const format = this.detectFormat(header, sampleValues, unit);
        return { type: 'metric', unit, format };
      }
    }
    
    // Check for dimension columns
    for (const [dimType, pattern] of Object.entries(this.DIMENSION_PATTERNS)) {
      if (pattern.test(header)) {
        return { type: 'dimension' };
      }
    }
    
    // Analyze sample values
    const nonNullValues = sampleValues.filter(v => v != null);
    if (nonNullValues.length > 0) {
      const isNumeric = nonNullValues.every(v => !isNaN(Number(v)));
      if (isNumeric) {
        const unit = this.detectUnit(header, sampleValues);
        const format = this.detectFormat(header, sampleValues, unit);
        return { type: 'metric', unit, format };
      }
    }
    
    return { type: 'dimension' };
  }

  private static detectUnit(header: string, values: any[]): string {
    const headerLower = header.toLowerCase();
    
    if (headerLower.includes('$') || headerLower.includes('usd') || headerLower.includes('dollar')) {
      return '$';
    }
    if (headerLower.includes('%') || headerLower.includes('percent') || headerLower.includes('margin')) {
      return '%';
    }
    if (headerLower.includes('units') || headerLower.includes('qty') || headerLower.includes('quantity')) {
      return 'units';
    }
    if (headerLower.includes('hours') || headerLower.includes('hrs')) {
      return 'hours';
    }
    if (headerLower.includes('days')) {
      return 'days';
    }
    
    // Check values for currency symbols
    const stringValues = values.filter(v => typeof v === 'string');
    if (stringValues.some(v => v.includes('$'))) {
      return '$';
    }
    
    return '';
  }

  private static detectFormat(header: string, values: any[], unit: string): string {
    if (unit === '%') {
      return '0.1%';
    }
    if (unit === '$') {
      // Check magnitude of values
      const numericValues = values.filter(v => !isNaN(Number(v))).map(Number);
      const maxValue = Math.max(...numericValues);
      
      if (maxValue > 1000000) {
        return '$0.0a'; // $1.2M
      } else if (maxValue > 1000) {
        return '$0,0';
      } else {
        return '$0.00';
      }
    }
    
    return '0,0';
  }

  private static standardizeColumnName(original: string, type: string): string {
    const lower = original.toLowerCase();
    
    // Map to standard names
    for (const [standard, pattern] of Object.entries(this.METRIC_PATTERNS)) {
      if (pattern.test(original)) {
        return standard;
      }
    }
    
    for (const [standard, pattern] of Object.entries(this.DIMENSION_PATTERNS)) {
      if (pattern.test(original)) {
        return standard;
      }
    }
    
    // Clean up the name
    return original
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/_+$/, '')
      .replace(/^_+/, '')
      .toLowerCase();
  }

  private static parseValue(value: any, type?: string): any {
    if (value == null || value === '') return null;
    
    if (type === 'date') {
      // Handle various date formats
      if (value instanceof Date) return value;
      if (typeof value === 'number') {
        // Excel date number
        return new Date((value - 25569) * 86400 * 1000);
      }
      return new Date(value);
    }
    
    if (type === 'metric') {
      // Clean numeric values
      if (typeof value === 'string') {
        value = value.replace(/[$,%\s]/g, '');
      }
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    
    return value;
  }

  private static isUSState(text: string): boolean {
    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                   'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                   'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                   'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                   'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    return states.includes(text.toUpperCase());
  }

  private static isMarket(text: string): boolean {
    // Add market detection logic
    return /^(north|south|east|west|central|metro|rural)/i.test(text);
  }

  private static isSegment(text: string): boolean {
    // Add segment detection logic
    return /^(enterprise|smb|consumer|retail|wholesale|b2b|b2c)/i.test(text);
  }

  private static generateWorkbookSummary(sheets: SheetMetadata[], data: Record<string, any[]>): any {
    const summary = {
      totalSheets: sheets.length,
      markets: [...new Set(sheets.map(s => s.market).filter(Boolean))],
      segments: [...new Set(sheets.map(s => s.segment).filter(Boolean))],
      states: [...new Set(sheets.map(s => s.state).filter(Boolean))],
      availableMetrics: [...new Set(sheets.flatMap(s => s.metricColumns))],
      availableDimensions: [...new Set(sheets.flatMap(s => s.dimensionColumns))],
      dateRange: this.getDateRange(sheets, data),
      totalRows: Object.values(data).reduce((sum, rows) => sum + rows.length, 0)
    };
    
    return summary;
  }

  private static getDateRange(sheets: SheetMetadata[], data: Record<string, any[]>): { start: Date, end: Date } | null {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    
    sheets.forEach(sheet => {
      const sheetData = data[sheet.name];
      if (!sheetData) return;
      
      sheet.dateColumns.forEach(dateCol => {
        sheetData.forEach(row => {
          const date = row[dateCol];
          if (date instanceof Date) {
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
          }
        });
      });
    });
    
    return minDate && maxDate ? { start: minDate, end: maxDate } : null;
  }

  static calculateMetric(metricName: string, data: any[]): number[] {
    const calcDef = this.CALCULATED_METRICS[metricName];
    if (!calcDef) {
      // Direct metric
      return data.map(row => row[metricName] || 0);
    }
    
    // Calculate based on formula
    switch (metricName) {
      case 'ebitda_margin':
        return data.map(row => 
          row.revenue ? (row.ebitda / row.revenue) * 100 : 0
        );
      case 'gross_margin':
        return data.map(row => 
          row.revenue ? (row.grossProfit / row.revenue) * 100 : 0
        );
      case 'net_margin':
        return data.map(row => 
          row.revenue ? (row.netProfit / row.revenue) * 100 : 0
        );
      case 'revenue_per_customer':
        return data.map(row => 
          row.customers ? row.revenue / row.customers : 0
        );
      case 'price_per_unit':
        return data.map(row => 
          row.units ? row.revenue / row.units : 0
        );
      default:
        return data.map(() => 0);
    }
  }

  static searchForMetric(query: string, sheets: SheetMetadata[]): {
    found: boolean;
    locations: Array<{ sheet: string; column: string; type: string }>;
    isCalculated: boolean;
    formula?: string;
  } {
    const queryLower = query.toLowerCase();
    const locations: Array<{ sheet: string; column: string; type: string }> = [];
    
    // Check if it's a calculated metric
    for (const [calcName, calcDef] of Object.entries(this.CALCULATED_METRICS)) {
      if (queryLower.includes(calcName.replace('_', ' '))) {
        return {
          found: true,
          locations: [],
          isCalculated: true,
          formula: calcDef.formula
        };
      }
    }
    
    // Search in sheet columns
    sheets.forEach(sheet => {
      sheet.columns.forEach(col => {
        if (col.standardName.includes(queryLower) || 
            col.originalName.toLowerCase().includes(queryLower)) {
          locations.push({
            sheet: sheet.name,
            column: col.originalName,
            type: col.type
          });
        }
      });
    });
    
    return {
      found: locations.length > 0,
      locations,
      isCalculated: false
    };
  }
}