export interface AggregationLevel {
  level: 'company' | 'segment' | 'state' | 'market' | 'channel';
  groupBy: string[];
  metrics: string[];
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface TimeSeriesOptions {
  metric: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  groupBy?: string[];
  startDate?: Date;
  endDate?: Date;
  fillMissing?: boolean;
  calculateGrowth?: boolean;
}

export class AdvancedAggregator {
  static aggregateData(
    data: any[],
    options: AggregationLevel
  ): any[] {
    const { level, groupBy, metrics } = options;
    
    // Group data
    const groups = this.groupDataBy(data, groupBy);
    
    // Aggregate each group
    const results = Object.entries(groups).map(([key, rows]) => {
      const aggregated: any = this.parseGroupKey(key, groupBy);
      
      // Calculate metrics
      metrics.forEach(metric => {
        aggregated[metric] = this.calculateMetricAggregate(rows, metric);
        aggregated[`${metric}_sum`] = this.sum(rows, metric);
        aggregated[`${metric}_avg`] = this.average(rows, metric);
        aggregated[`${metric}_min`] = this.min(rows, metric);
        aggregated[`${metric}_max`] = this.max(rows, metric);
        aggregated[`${metric}_count`] = this.count(rows, metric);
      });
      
      // Add metadata
      aggregated._level = level;
      aggregated._rowCount = rows.length;
      
      return aggregated;
    });
    
    return results;
  }

  static createTimeSeries(
    data: any[],
    options: TimeSeriesOptions
  ): any[] {
    const { metric, period, groupBy = [], calculateGrowth = true } = options;
    
    // Filter by date range if specified
    let filteredData = data;
    if (options.startDate || options.endDate) {
      filteredData = data.filter(row => {
        const date = this.getDateFromRow(row);
        if (!date) return false;
        if (options.startDate && date < options.startDate) return false;
        if (options.endDate && date > options.endDate) return false;
        return true;
      });
    }
    
    // Group by period and dimensions
    const periodGroups = this.groupByPeriod(filteredData, period, groupBy);
    
    // Create time series
    const series = Object.entries(periodGroups).map(([key, rows]) => {
      const result: any = {
        period: key.split('|')[0],
        date: this.parsePeriodDate(key.split('|')[0], period),
        [metric]: this.sum(rows, metric),
        [`${metric}_avg`]: this.average(rows, metric),
        count: rows.length
      };
      
      // Add group dimensions
      if (groupBy.length > 0) {
        const groupValues = key.split('|').slice(1);
        groupBy.forEach((dim, idx) => {
          result[dim] = groupValues[idx];
        });
      }
      
      return result;
    });
    
    // Sort by date
    series.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate growth rates
    if (calculateGrowth && series.length > 1) {
      for (let i = 1; i < series.length; i++) {
        const current = series[i][metric];
        const previous = series[i - 1][metric];
        
        if (previous && previous !== 0) {
          series[i][`${metric}_growth`] = ((current - previous) / previous) * 100;
          series[i][`${metric}_growth_abs`] = current - previous;
        }
      }
      
      // Calculate CAGR for the series
      if (series.length > 2) {
        const first = series[0][metric];
        const last = series[series.length - 1][metric];
        const years = (series[series.length - 1].date.getTime() - series[0].date.getTime()) / (365 * 24 * 60 * 60 * 1000);
        
        if (first && first > 0 && years > 0) {
          const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;
          series.forEach(point => {
            point[`${metric}_cagr`] = cagr;
          });
        }
      }
    }
    
    return series;
  }

  static calculateCohorts(
    data: any[],
    options: {
      cohortBy: string; // e.g., 'signup_date', 'first_purchase_date'
      metricBy: string; // e.g., 'revenue', 'retention', 'orders'
      periods: number; // Number of periods to track
      periodType: 'days' | 'weeks' | 'months';
    }
  ): any {
    const { cohortBy, metricBy, periods, periodType } = options;
    const cohorts: Record<string, any[]> = {};
    
    // Group by cohort
    data.forEach(row => {
      const cohortDate = this.getDateFromRow(row, cohortBy);
      if (!cohortDate) return;
      
      const cohortKey = this.formatDate(cohortDate, 'month');
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = [];
      }
      cohorts[cohortKey].push(row);
    });
    
    // Calculate cohort metrics
    const cohortAnalysis = Object.entries(cohorts).map(([cohort, members]) => {
      const analysis: any = {
        cohort,
        cohortSize: members.length,
        periods: []
      };
      
      // Track metrics over periods
      for (let period = 0; period < periods; period++) {
        const periodMetrics = this.calculateCohortPeriodMetrics(
          members,
          cohort,
          period,
          periodType,
          metricBy
        );
        analysis.periods.push(periodMetrics);
      }
      
      return analysis;
    });
    
    return cohortAnalysis;
  }

  static pivotData(
    data: any[],
    options: {
      rows: string[];
      columns: string[];
      values: string;
      aggregation: 'sum' | 'average' | 'count' | 'min' | 'max';
    }
  ): any {
    const { rows, columns, values, aggregation } = options;
    const pivot: any = {};
    
    // Create pivot structure
    data.forEach(record => {
      // Build row key
      const rowKey = rows.map(r => record[r] || 'Unknown').join(' | ');
      if (!pivot[rowKey]) {
        pivot[rowKey] = {};
      }
      
      // Build column key
      const colKey = columns.map(c => record[c] || 'Unknown').join(' | ');
      if (!pivot[rowKey][colKey]) {
        pivot[rowKey][colKey] = [];
      }
      
      // Add value
      const value = record[values];
      if (value != null) {
        pivot[rowKey][colKey].push(value);
      }
    });
    
    // Aggregate values
    const result: any = {
      rows: [],
      columns: [],
      data: []
    };
    
    // Get unique columns
    const allColumns = new Set<string>();
    Object.values(pivot).forEach((cols: any) => {
      Object.keys(cols).forEach(col => allColumns.add(col));
    });
    result.columns = Array.from(allColumns).sort();
    
    // Build result matrix
    Object.entries(pivot).forEach(([rowKey, cols]: [string, any]) => {
      const row: any = { _row: rowKey };
      
      result.columns.forEach(col => {
        const values = cols[col] || [];
        row[col] = this.aggregateValues(values, aggregation);
      });
      
      // Add row totals
      row._total = this.aggregateValues(
        result.columns.flatMap(col => cols[col] || []),
        aggregation
      );
      
      result.rows.push(row);
    });
    
    // Add column totals
    const totals: any = { _row: 'Total' };
    result.columns.forEach(col => {
      const values = result.rows.flatMap((r: any) => 
        pivot[r._row]?.[col] || []
      );
      totals[col] = this.aggregateValues(values, aggregation);
    });
    totals._total = this.aggregateValues(
      data.map(d => d[values]).filter(v => v != null),
      aggregation
    );
    result.rows.push(totals);
    
    return result;
  }

  // Helper methods
  private static groupDataBy(data: any[], groupBy: string[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    data.forEach(row => {
      const key = groupBy.map(field => row[field] || 'Unknown').join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });
    
    return groups;
  }

  private static groupByPeriod(
    data: any[],
    period: string,
    additionalGroupBy: string[] = []
  ): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    data.forEach(row => {
      const date = this.getDateFromRow(row);
      if (!date) return;
      
      const periodKey = this.formatDateByPeriod(date, period);
      const additionalKeys = additionalGroupBy.map(field => row[field] || 'Unknown');
      const fullKey = [periodKey, ...additionalKeys].join('|');
      
      if (!groups[fullKey]) {
        groups[fullKey] = [];
      }
      groups[fullKey].push(row);
    });
    
    return groups;
  }

  private static getDateFromRow(row: any, dateField?: string): Date | null {
    // Try common date fields
    const dateFields = dateField ? [dateField] : ['date', 'Date', 'month', 'Month', 'period', 'Period'];
    
    for (const field of dateFields) {
      if (row[field]) {
        const date = new Date(row[field]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return null;
  }

  private static formatDateByPeriod(date: Date, period: string): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const week = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'annually':
        return date.getFullYear().toString();
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private static parsePeriodDate(periodStr: string, period: string): Date {
    switch (period) {
      case 'daily':
        return new Date(periodStr);
      case 'weekly':
        const [year, week] = periodStr.split('-W');
        return this.getDateFromWeek(parseInt(year), parseInt(week));
      case 'monthly':
        return new Date(periodStr + '-01');
      case 'quarterly':
        const [qYear, quarter] = periodStr.split('-Q');
        const month = (parseInt(quarter.replace('Q', '')) - 1) * 3;
        return new Date(parseInt(qYear), month, 1);
      case 'annually':
        return new Date(parseInt(periodStr), 0, 1);
      default:
        return new Date(periodStr);
    }
  }

  private static formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    switch (format) {
      case 'month':
        return `${year}-${month}`;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${year}-Q${quarter}`;
      case 'year':
        return year.toString();
      default:
        return `${year}-${month}-${day}`;
    }
  }

  private static parseGroupKey(key: string, groupBy: string[]): any {
    const values = key.split('|');
    const result: any = {};
    
    groupBy.forEach((field, idx) => {
      result[field] = values[idx] || 'Unknown';
    });
    
    return result;
  }

  private static calculateMetricAggregate(rows: any[], metric: string): number {
    // Default to sum for most metrics
    if (metric.includes('margin') || metric.includes('rate') || metric.includes('percent')) {
      return this.average(rows, metric);
    }
    return this.sum(rows, metric);
  }

  private static sum(rows: any[], field: string): number {
    return rows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
  }

  private static average(rows: any[], field: string): number {
    const validRows = rows.filter(row => row[field] != null);
    if (validRows.length === 0) return 0;
    return this.sum(validRows, field) / validRows.length;
  }

  private static min(rows: any[], field: string): number {
    const values = rows.map(row => Number(row[field])).filter(v => !isNaN(v));
    return values.length > 0 ? Math.min(...values) : 0;
  }

  private static max(rows: any[], field: string): number {
    const values = rows.map(row => Number(row[field])).filter(v => !isNaN(v));
    return values.length > 0 ? Math.max(...values) : 0;
  }

  private static count(rows: any[], field: string): number {
    return rows.filter(row => row[field] != null).length;
  }

  private static aggregateValues(values: number[], method: string): number {
    if (values.length === 0) return 0;
    
    switch (method) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return values.reduce((a, b) => a + b, 0);
    }
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private static getDateFromWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 1);
    const days = (week - 1) * 7;
    date.setDate(date.getDate() + days);
    return date;
  }

  private static calculateCohortPeriodMetrics(
    cohortMembers: any[],
    cohortDate: string,
    period: number,
    periodType: string,
    metric: string
  ): any {
    // This is a simplified version - you'd implement full cohort tracking logic
    return {
      period,
      retained: cohortMembers.length, // Simplified
      retentionRate: 100, // Simplified
      [metric]: this.sum(cohortMembers, metric)
    };
  }
}