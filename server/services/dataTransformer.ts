import { ProcessedFile } from './fileProcessor';

export interface TransformationRule {
  column: string;
  operation: 'clean' | 'parse' | 'convert' | 'aggregate' | 'normalize' | 'fill';
  params?: any;
}

export interface DataQualityReport {
  totalRows: number;
  cleanRows: number;
  issues: {
    column: string;
    type: string;
    count: number;
    examples: any[];
  }[];
  recommendations: string[];
}

export class DataTransformer {
  static analyzeDataQuality(data: any[]): DataQualityReport {
    if (!data || data.length === 0) {
      return {
        totalRows: 0,
        cleanRows: 0,
        issues: [],
        recommendations: []
      };
    }

    const issues: DataQualityReport['issues'] = [];
    const columns = Object.keys(data[0]);
    let cleanRows = 0;

    // Analyze each column
    columns.forEach(column => {
      const columnData = data.map(row => row[column]);
      
      // Check for nulls/undefined
      const nullCount = columnData.filter(val => val === null || val === undefined || val === '').length;
      if (nullCount > 0) {
        issues.push({
          column,
          type: 'missing_values',
          count: nullCount,
          examples: data.filter(row => !row[column]).slice(0, 3).map((_, i) => `Row ${i + 1}`)
        });
      }

      // Check for inconsistent data types
      const types = new Set(columnData.filter(val => val !== null).map(val => typeof val));
      if (types.size > 1) {
        issues.push({
          column,
          type: 'mixed_types',
          count: types.size,
          examples: Array.from(types)
        });
      }

      // Check for outliers in numeric columns
      const numericValues = columnData.filter(val => typeof val === 'number' && !isNaN(val));
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const stdDev = Math.sqrt(numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length);
        const outliers = numericValues.filter(val => Math.abs(val - mean) > 3 * stdDev);
        
        if (outliers.length > 0) {
          issues.push({
            column,
            type: 'outliers',
            count: outliers.length,
            examples: outliers.slice(0, 3)
          });
        }
      }

      // Check for duplicate values
      const uniqueValues = new Set(columnData.filter(val => val !== null));
      if (uniqueValues.size < columnData.length * 0.1) {
        issues.push({
          column,
          type: 'low_cardinality',
          count: uniqueValues.size,
          examples: Array.from(uniqueValues).slice(0, 5)
        });
      }
    });

    // Count clean rows (rows without any issues)
    cleanRows = data.filter(row => {
      return columns.every(col => {
        const val = row[col];
        return val !== null && val !== undefined && val !== '';
      });
    }).length;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'missing_values')) {
      recommendations.push('Consider filling missing values with defaults or using interpolation');
    }
    if (issues.some(i => i.type === 'mixed_types')) {
      recommendations.push('Standardize data types within columns for consistent analysis');
    }
    if (issues.some(i => i.type === 'outliers')) {
      recommendations.push('Review outliers - they may be errors or significant insights');
    }
    if (issues.some(i => i.type === 'low_cardinality')) {
      recommendations.push('Low-cardinality columns might be good candidates for grouping or categorization');
    }

    return {
      totalRows: data.length,
      cleanRows,
      issues,
      recommendations
    };
  }

  static cleanData(data: any[], rules?: TransformationRule[]): any[] {
    let cleanedData = [...data];

    // Default cleaning operations
    cleanedData = cleanedData.map(row => {
      const cleanedRow: any = {};
      
      Object.entries(row).forEach(([key, value]) => {
        // Trim strings
        if (typeof value === 'string') {
          cleanedRow[key] = value.trim();
          
          // Convert empty strings to null
          if (cleanedRow[key] === '') {
            cleanedRow[key] = null;
          }
          
          // Try to parse numbers
          if (cleanedRow[key] && !isNaN(Number(cleanedRow[key]))) {
            cleanedRow[key] = Number(cleanedRow[key]);
          }
          
          // Parse dates
          if (cleanedRow[key] && typeof cleanedRow[key] === 'string') {
            const datePattern = /^\d{4}-\d{2}-\d{2}/;
            if (datePattern.test(cleanedRow[key])) {
              cleanedRow[key] = new Date(cleanedRow[key]);
            }
          }
        } else {
          cleanedRow[key] = value;
        }
      });
      
      return cleanedRow;
    });

    // Apply custom transformation rules
    if (rules) {
      rules.forEach(rule => {
        cleanedData = this.applyTransformation(cleanedData, rule);
      });
    }

    return cleanedData;
  }

  private static applyTransformation(data: any[], rule: TransformationRule): any[] {
    return data.map(row => {
      const newRow = { ...row };
      
      switch (rule.operation) {
        case 'clean':
          // Remove special characters
          if (typeof newRow[rule.column] === 'string') {
            newRow[rule.column] = newRow[rule.column].replace(/[^\w\s.-]/g, '');
          }
          break;
          
        case 'parse':
          // Parse based on params
          if (rule.params?.type === 'currency' && typeof newRow[rule.column] === 'string') {
            newRow[rule.column] = parseFloat(newRow[rule.column].replace(/[$,]/g, ''));
          }
          break;
          
        case 'convert':
          // Convert units
          if (rule.params?.from && rule.params?.to && typeof newRow[rule.column] === 'number') {
            // Example: convert millions to actual values
            if (rule.params.from === 'millions' && rule.params.to === 'units') {
              newRow[rule.column] = newRow[rule.column] * 1000000;
            }
          }
          break;
          
        case 'normalize':
          // Normalize text
          if (typeof newRow[rule.column] === 'string') {
            newRow[rule.column] = newRow[rule.column].toLowerCase().trim();
          }
          break;
          
        case 'fill':
          // Fill missing values
          if (newRow[rule.column] === null || newRow[rule.column] === undefined) {
            newRow[rule.column] = rule.params?.value || 0;
          }
          break;
      }
      
      return newRow;
    });
  }

  static aggregateData(data: any[], groupBy: string[], metrics: { column: string; operation: string }[]): any[] {
    const groups: { [key: string]: any[] } = {};
    
    // Group data
    data.forEach(row => {
      const key = groupBy.map(col => row[col]).join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });
    
    // Aggregate each group
    return Object.entries(groups).map(([key, rows]) => {
      const keyParts = key.split('|');
      const result: any = {};
      
      // Add group keys
      groupBy.forEach((col, index) => {
        result[col] = keyParts[index];
      });
      
      // Calculate metrics
      metrics.forEach(metric => {
        const values = rows.map(row => row[metric.column]).filter(val => typeof val === 'number');
        
        switch (metric.operation) {
          case 'sum':
            result[`${metric.column}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            result[`${metric.column}_avg`] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            result[`${metric.column}_count`] = values.length;
            break;
          case 'min':
            result[`${metric.column}_min`] = Math.min(...values);
            break;
          case 'max':
            result[`${metric.column}_max`] = Math.max(...values);
            break;
        }
      });
      
      return result;
    });
  }

  static pivotData(data: any[], rowKey: string, columnKey: string, valueKey: string, aggregation: string = 'sum'): any[] {
    // Get unique column values
    const columnValues = [...new Set(data.map(row => row[columnKey]))];
    const pivoted: { [key: string]: any } = {};
    
    // Initialize pivot structure
    data.forEach(row => {
      const rowKeyValue = row[rowKey];
      if (!pivoted[rowKeyValue]) {
        pivoted[rowKeyValue] = { [rowKey]: rowKeyValue };
        columnValues.forEach(col => {
          pivoted[rowKeyValue][col] = null;
        });
      }
    });
    
    // Fill in values
    data.forEach(row => {
      const rowKeyValue = row[rowKey];
      const colKeyValue = row[columnKey];
      const value = row[valueKey];
      
      if (aggregation === 'sum') {
        pivoted[rowKeyValue][colKeyValue] = (pivoted[rowKeyValue][colKeyValue] || 0) + (value || 0);
      } else if (aggregation === 'avg') {
        // For average, we need to track count as well
        if (!pivoted[rowKeyValue][`${colKeyValue}_count`]) {
          pivoted[rowKeyValue][`${colKeyValue}_count`] = 0;
          pivoted[rowKeyValue][`${colKeyValue}_sum`] = 0;
        }
        pivoted[rowKeyValue][`${colKeyValue}_count`]++;
        pivoted[rowKeyValue][`${colKeyValue}_sum`] += value || 0;
        pivoted[rowKeyValue][colKeyValue] = pivoted[rowKeyValue][`${colKeyValue}_sum`] / pivoted[rowKeyValue][`${colKeyValue}_count`];
      }
    });
    
    // Clean up temporary fields and return
    return Object.values(pivoted).map(row => {
      const cleanRow: any = {};
      Object.keys(row).forEach(key => {
        if (!key.includes('_count') && !key.includes('_sum')) {
          cleanRow[key] = row[key];
        }
      });
      return cleanRow;
    });
  }

  static detectTrends(data: any[], timeColumn: string, valueColumn: string): {
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
    forecast: number[];
    seasonality: boolean;
  } {
    // Sort by time
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a[timeColumn]).getTime();
      const dateB = new Date(b[timeColumn]).getTime();
      return dateA - dateB;
    });
    
    const values = sorted.map(row => row[valueColumn] || 0);
    
    // Calculate trend using linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Determine trend
    const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
    
    // Calculate change percent
    const firstValue = values[0] || 1;
    const lastValue = values[values.length - 1] || 1;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;
    
    // Simple forecast (next 3 periods)
    const forecast = [1, 2, 3].map(i => slope * (n + i) + intercept);
    
    // Detect seasonality (simplified - checks for repeating patterns)
    const seasonality = this.detectSeasonality(values);
    
    return {
      trend,
      changePercent,
      forecast,
      seasonality
    };
  }

  private static detectSeasonality(values: number[]): boolean {
    if (values.length < 12) return false;
    
    // Simple seasonality detection - compare month-over-month patterns
    const monthlyChanges = [];
    for (let i = 1; i < values.length; i++) {
      monthlyChanges.push(values[i] - values[i - 1]);
    }
    
    // Check if pattern repeats
    const patternLength = 12; // Assume monthly data
    if (values.length >= patternLength * 2) {
      let patternMatch = 0;
      for (let i = 0; i < patternLength; i++) {
        if (Math.sign(monthlyChanges[i]) === Math.sign(monthlyChanges[i + patternLength])) {
          patternMatch++;
        }
      }
      return patternMatch > patternLength * 0.7; // 70% match threshold
    }
    
    return false;
  }
}