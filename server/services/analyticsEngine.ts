import { DataTransformer } from './dataTransformer';

export interface AnalyticsResult {
  summary: {
    totalRows: number;
    totalColumns: number;
    numericColumns: string[];
    categoricalColumns: string[];
    dateColumns: string[];
  };
  statistics: {
    [column: string]: {
      mean?: number;
      median?: number;
      mode?: any;
      stdDev?: number;
      min?: number;
      max?: number;
      uniqueValues?: number;
      nullCount?: number;
    };
  };
  correlations: {
    [pair: string]: number;
  };
  insights: string[];
  recommendations: string[];
}

export class AnalyticsEngine {
  static performComprehensiveAnalysis(data: any[]): AnalyticsResult {
    if (!data || data.length === 0) {
      return {
        summary: {
          totalRows: 0,
          totalColumns: 0,
          numericColumns: [],
          categoricalColumns: [],
          dateColumns: []
        },
        statistics: {},
        correlations: {},
        insights: [],
        recommendations: []
      };
    }

    const columns = Object.keys(data[0]);
    const summary = this.analyzeSummary(data, columns);
    const statistics = this.calculateStatistics(data, columns);
    const correlations = this.calculateCorrelations(data, summary.numericColumns);
    const insights = this.generateInsights(data, summary, statistics, correlations);
    const recommendations = this.generateRecommendations(summary, statistics, correlations);

    return {
      summary,
      statistics,
      correlations,
      insights,
      recommendations
    };
  }

  private static analyzeSummary(data: any[], columns: string[]): AnalyticsResult['summary'] {
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const dateColumns: string[] = [];

    columns.forEach(col => {
      const sample = data.find(row => row[col] !== null && row[col] !== undefined)?.[col];
      
      if (sample instanceof Date || (typeof sample === 'string' && !isNaN(Date.parse(sample)))) {
        dateColumns.push(col);
      } else if (typeof sample === 'number') {
        numericColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    });

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns,
      categoricalColumns,
      dateColumns
    };
  }

  private static calculateStatistics(data: any[], columns: string[]): AnalyticsResult['statistics'] {
    const stats: AnalyticsResult['statistics'] = {};

    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      const nullCount = data.length - values.length;

      stats[col] = { nullCount };

      if (values.length === 0) return;

      // For numeric columns
      if (typeof values[0] === 'number') {
        const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
        
        if (numericValues.length > 0) {
          stats[col].mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          stats[col].min = Math.min(...numericValues);
          stats[col].max = Math.max(...numericValues);
          
          // Calculate median
          const sorted = [...numericValues].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          stats[col].median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          
          // Calculate standard deviation
          const mean = stats[col].mean!;
          const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
          stats[col].stdDev = Math.sqrt(variance);
        }
      }

      // For all columns - count unique values
      stats[col].uniqueValues = new Set(values).size;

      // Calculate mode
      const frequency: { [key: string]: number } = {};
      values.forEach(val => {
        const key = String(val);
        frequency[key] = (frequency[key] || 0) + 1;
      });
      
      let maxFreq = 0;
      let mode = null;
      Object.entries(frequency).forEach(([val, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          mode = val;
        }
      });
      stats[col].mode = mode;
    });

    return stats;
  }

  private static calculateCorrelations(data: any[], numericColumns: string[]): AnalyticsResult['correlations'] {
    const correlations: AnalyticsResult['correlations'] = {};

    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        const pairs = data
          .filter(row => typeof row[col1] === 'number' && typeof row[col2] === 'number')
          .map(row => [row[col1], row[col2]]);
        
        if (pairs.length > 2) {
          const correlation = this.pearsonCorrelation(pairs);
          correlations[`${col1}_${col2}`] = correlation;
        }
      }
    }

    return correlations;
  }

  private static pearsonCorrelation(pairs: number[][]): number {
    const n = pairs.length;
    const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
    const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);
    const sumY2 = pairs.reduce((sum, [, y]) => sum + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static generateInsights(
    data: any[],
    summary: AnalyticsResult['summary'],
    statistics: AnalyticsResult['statistics'],
    correlations: AnalyticsResult['correlations']
  ): string[] {
    const insights: string[] = [];

    // Data completeness insight
    const totalCells = summary.totalRows * summary.totalColumns;
    const nullCells = Object.values(statistics).reduce((sum, stat) => sum + (stat.nullCount || 0), 0);
    const completeness = ((totalCells - nullCells) / totalCells * 100).toFixed(1);
    insights.push(`Data completeness: ${completeness}% of cells contain valid data`);

    // Find columns with high null rates
    Object.entries(statistics).forEach(([col, stat]) => {
      const nullRate = (stat.nullCount || 0) / summary.totalRows;
      if (nullRate > 0.3) {
        insights.push(`Column "${col}" has ${(nullRate * 100).toFixed(1)}% missing values`);
      }
    });

    // Identify high variance columns
    summary.numericColumns.forEach(col => {
      const stat = statistics[col];
      if (stat.stdDev && stat.mean && stat.stdDev > stat.mean * 0.5) {
        insights.push(`High variability in "${col}" (CV: ${(stat.stdDev / stat.mean).toFixed(2)})`);
      }
    });

    // Find strong correlations
    Object.entries(correlations).forEach(([pair, correlation]) => {
      if (Math.abs(correlation) > 0.7) {
        const [col1, col2] = pair.split('_');
        const strength = Math.abs(correlation) > 0.9 ? 'Very strong' : 'Strong';
        const direction = correlation > 0 ? 'positive' : 'negative';
        insights.push(`${strength} ${direction} correlation between "${col1}" and "${col2}" (${correlation.toFixed(2)})`);
      }
    });

    // Identify potential categorical columns that should be numeric
    summary.categoricalColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null);
      const numericLike = values.filter(v => !isNaN(Number(v))).length / values.length;
      if (numericLike > 0.8) {
        insights.push(`Column "${col}" appears to contain mostly numeric values but is treated as text`);
      }
    });

    return insights;
  }

  private static generateRecommendations(
    summary: AnalyticsResult['summary'],
    statistics: AnalyticsResult['statistics'],
    correlations: AnalyticsResult['correlations']
  ): string[] {
    const recommendations: string[] = [];

    // Data quality recommendations
    const highNullColumns = Object.entries(statistics)
      .filter(([, stat]) => (stat.nullCount || 0) > summary.totalRows * 0.2)
      .map(([col]) => col);
    
    if (highNullColumns.length > 0) {
      recommendations.push(`Consider removing or imputing missing values in: ${highNullColumns.join(', ')}`);
    }

    // Feature engineering recommendations
    if (summary.dateColumns.length > 0) {
      recommendations.push('Extract time-based features (month, quarter, day of week) from date columns for trend analysis');
    }

    // Correlation-based recommendations
    const highCorrelations = Object.entries(correlations)
      .filter(([, corr]) => Math.abs(corr) > 0.9)
      .map(([pair]) => pair);
    
    if (highCorrelations.length > 0) {
      recommendations.push(`Consider removing redundant features due to high correlation: ${highCorrelations.join(', ')}`);
    }

    // Analysis recommendations
    if (summary.numericColumns.length >= 2) {
      recommendations.push('Perform regression analysis to predict key metrics');
    }

    if (summary.categoricalColumns.length > 0 && summary.numericColumns.length > 0) {
      recommendations.push('Create pivot tables to analyze metrics by categories');
    }

    // Scale recommendations
    const hasWideRanges = summary.numericColumns.some(col => {
      const stat = statistics[col];
      return stat.max && stat.min && (stat.max - stat.min) > stat.mean! * 10;
    });
    
    if (hasWideRanges) {
      recommendations.push('Consider normalizing numeric columns with wide value ranges');
    }

    return recommendations;
  }

  static generateSmartQuery(data: any[], userIntent: string): {
    sql: string;
    explanation: string;
    suggestedVisualizations: string[];
  } {
    const intent = userIntent.toLowerCase();
    const columns = Object.keys(data[0] || {});
    const summary = this.analyzeSummary(data, columns);
    
    let sql = '';
    let explanation = '';
    let suggestedVisualizations: string[] = [];

    // Time-based analysis
    if (intent.includes('trend') || intent.includes('over time') || intent.includes('monthly')) {
      const dateCol = summary.dateColumns[0] || columns.find(c => c.toLowerCase().includes('date'));
      const valueCol = summary.numericColumns[0] || columns.find(c => c.toLowerCase().includes('revenue') || c.toLowerCase().includes('sales'));
      
      if (dateCol && valueCol) {
        sql = `SELECT DATE_TRUNC('month', ${dateCol}) as month, SUM(${valueCol}) as total FROM data GROUP BY month ORDER BY month`;
        explanation = `Aggregating ${valueCol} by month to show trends over time`;
        suggestedVisualizations = ['line', 'area', 'column'];
      }
    }
    
    // Comparison analysis
    else if (intent.includes('compare') || intent.includes('versus') || intent.includes('by')) {
      const groupCol = summary.categoricalColumns[0] || columns.find(c => 
        c.toLowerCase().includes('category') || 
        c.toLowerCase().includes('type') || 
        c.toLowerCase().includes('region')
      );
      const valueCol = summary.numericColumns[0];
      
      if (groupCol && valueCol) {
        sql = `SELECT ${groupCol}, SUM(${valueCol}) as total FROM data GROUP BY ${groupCol} ORDER BY total DESC`;
        explanation = `Comparing total ${valueCol} across different ${groupCol}`;
        suggestedVisualizations = ['bar', 'pie', 'treemap'];
      }
    }
    
    // Top/Bottom analysis
    else if (intent.includes('top') || intent.includes('best') || intent.includes('highest')) {
      const valueCol = summary.numericColumns[0];
      const nameCol = columns[0];
      const limit = intent.match(/\d+/) ? intent.match(/\d+/)![0] : '10';
      
      sql = `SELECT ${nameCol}, ${valueCol} FROM data ORDER BY ${valueCol} DESC LIMIT ${limit}`;
      explanation = `Showing top ${limit} records by ${valueCol}`;
      suggestedVisualizations = ['bar', 'table'];
    }
    
    // Distribution analysis
    else if (intent.includes('distribution') || intent.includes('breakdown')) {
      const categoryCol = summary.categoricalColumns[0];
      const valueCol = summary.numericColumns[0];
      
      if (categoryCol) {
        sql = `SELECT ${categoryCol}, COUNT(*) as count, AVG(${valueCol || 1}) as average FROM data GROUP BY ${categoryCol}`;
        explanation = `Analyzing distribution of records by ${categoryCol}`;
        suggestedVisualizations = ['pie', 'donut', 'treemap'];
      }
    }
    
    // Default aggregation
    else {
      const valueCol = summary.numericColumns[0] || columns[1];
      sql = `SELECT COUNT(*) as total_records, SUM(${valueCol}) as total_value, AVG(${valueCol}) as avg_value FROM data`;
      explanation = 'Showing overall summary statistics';
      suggestedVisualizations = ['scorecard', 'table'];
    }

    return { sql, explanation, suggestedVisualizations };
  }
}