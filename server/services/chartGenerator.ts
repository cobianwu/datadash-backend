export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'heatmap' | 'waterfall' | 'treemap' | 'funnel' | 'gauge' | 'radar' | 'sankey';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  stacked?: boolean;
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export interface ChartRecommendation {
  type: ChartConfig['type'];
  reason: string;
  config: Partial<ChartConfig>;
  score: number;
}

export class ChartGenerator {
  static recommendCharts(data: any[], query: string, columns: string[]): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = [];
    const queryLower = query.toLowerCase();
    
    // Analyze data characteristics
    const numericColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'number')
    );
    const categoricalColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'string')
    );
    const dateColumns = columns.filter(col => 
      data.some(row => row[col] instanceof Date || !isNaN(Date.parse(row[col])))
    );
    
    // Time series analysis
    if ((queryLower.includes('trend') || queryLower.includes('over time') || queryLower.includes('monthly')) && dateColumns.length > 0) {
      recommendations.push({
        type: 'line',
        reason: 'Best for showing trends over time',
        config: {
          xAxis: dateColumns[0],
          yAxis: numericColumns[0],
          showDataLabels: false
        },
        score: 0.95
      });
      
      recommendations.push({
        type: 'area',
        reason: 'Shows trends with emphasis on magnitude',
        config: {
          xAxis: dateColumns[0],
          yAxis: numericColumns[0],
          stacked: false
        },
        score: 0.85
      });
    }
    
    // Comparison analysis
    if (queryLower.includes('compare') || queryLower.includes('versus') || queryLower.includes('by')) {
      recommendations.push({
        type: 'bar',
        reason: 'Ideal for comparing values across categories',
        config: {
          xAxis: categoricalColumns[0] || columns[0],
          yAxis: numericColumns[0] || columns[1],
          showDataLabels: true
        },
        score: 0.9
      });
      
      if (data.length <= 10) {
        recommendations.push({
          type: 'pie',
          reason: 'Shows proportion of total for small datasets',
          config: {
            showLegend: true,
            showDataLabels: true
          },
          score: 0.8
        });
      }
    }
    
    // Distribution analysis
    if (queryLower.includes('distribution') || queryLower.includes('breakdown')) {
      recommendations.push({
        type: 'treemap',
        reason: 'Excellent for hierarchical data and proportions',
        config: {
          showDataLabels: true
        },
        score: 0.9
      });
      
      recommendations.push({
        type: 'pie',
        reason: 'Classic view of proportions',
        config: {
          showLegend: true,
          showDataLabels: true
        },
        score: 0.85
      });
    }
    
    // Correlation analysis
    if (queryLower.includes('correlation') || queryLower.includes('relationship')) {
      recommendations.push({
        type: 'scatter',
        reason: 'Shows relationships between two numeric variables',
        config: {
          xAxis: numericColumns[0],
          yAxis: numericColumns[1] || numericColumns[0]
        },
        score: 0.95
      });
      
      recommendations.push({
        type: 'heatmap',
        reason: 'Visualizes correlation matrix',
        config: {},
        score: 0.85
      });
    }
    
    // Performance/KPI
    if (queryLower.includes('performance') || queryLower.includes('kpi') || queryLower.includes('metric')) {
      recommendations.push({
        type: 'gauge',
        reason: 'Shows progress toward a goal',
        config: {
          showDataLabels: true
        },
        score: 0.9
      });
      
      recommendations.push({
        type: 'waterfall',
        reason: 'Shows incremental changes',
        config: {},
        score: 0.8
      });
    }
    
    // Funnel analysis
    if (queryLower.includes('funnel') || queryLower.includes('conversion') || queryLower.includes('pipeline')) {
      recommendations.push({
        type: 'funnel',
        reason: 'Perfect for showing conversion or process flow',
        config: {},
        score: 0.95
      });
    }
    
    // Multi-dimensional comparison
    if (numericColumns.length >= 3) {
      recommendations.push({
        type: 'radar',
        reason: 'Compares multiple variables at once',
        config: {
          showLegend: true
        },
        score: 0.85
      });
    }
    
    // Flow analysis
    if (queryLower.includes('flow') || queryLower.includes('journey')) {
      recommendations.push({
        type: 'sankey',
        reason: 'Visualizes flow and relationships',
        config: {},
        score: 0.9
      });
    }
    
    // Default fallback
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'bar',
        reason: 'General purpose visualization',
        config: {
          xAxis: columns[0],
          yAxis: numericColumns[0] || columns[1]
        },
        score: 0.7
      });
      
      recommendations.push({
        type: 'line',
        reason: 'Alternative general visualization',
        config: {
          xAxis: columns[0],
          yAxis: numericColumns[0] || columns[1]
        },
        score: 0.65
      });
    }
    
    // Sort by score and return top recommendations
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 4);
  }
  
  static generateChartData(rawData: any[], config: ChartConfig): any {
    switch (config.type) {
      case 'line':
      case 'area':
        return this.generateLineData(rawData, config);
      
      case 'bar':
        return this.generateBarData(rawData, config);
      
      case 'pie':
        return this.generatePieData(rawData, config);
      
      case 'scatter':
        return this.generateScatterData(rawData, config);
      
      case 'heatmap':
        return this.generateHeatmapData(rawData, config);
      
      case 'waterfall':
        return this.generateWaterfallData(rawData, config);
      
      case 'treemap':
        return this.generateTreemapData(rawData, config);
      
      case 'funnel':
        return this.generateFunnelData(rawData, config);
      
      case 'gauge':
        return this.generateGaugeData(rawData, config);
      
      case 'radar':
        return this.generateRadarData(rawData, config);
      
      case 'sankey':
        return this.generateSankeyData(rawData, config);
      
      default:
        return rawData;
    }
  }
  
  private static generateLineData(data: any[], config: ChartConfig): any {
    const { xAxis, yAxis, series } = config;
    
    if (!xAxis || !yAxis) return data;
    
    // Group by x-axis
    const grouped: { [key: string]: any } = {};
    
    data.forEach(row => {
      const x = row[xAxis];
      if (!grouped[x]) {
        grouped[x] = { [xAxis]: x };
      }
      
      if (series && series.length > 0) {
        series.forEach(s => {
          grouped[x][s] = (grouped[x][s] || 0) + (row[s] || 0);
        });
      } else {
        grouped[x][yAxis] = (grouped[x][yAxis] || 0) + (row[yAxis] || 0);
      }
    });
    
    return Object.values(grouped).sort((a, b) => {
      // Sort by date if x-axis is date
      const aVal = a[xAxis];
      const bVal = b[xAxis];
      
      if (!isNaN(Date.parse(aVal))) {
        return new Date(aVal).getTime() - new Date(bVal).getTime();
      }
      
      return aVal > bVal ? 1 : -1;
    });
  }
  
  private static generateBarData(data: any[], config: ChartConfig): any {
    return this.generateLineData(data, config); // Similar structure
  }
  
  private static generatePieData(data: any[], config: ChartConfig): any {
    const { xAxis = Object.keys(data[0])[0], yAxis = Object.keys(data[0])[1] } = config;
    
    return data.map(row => ({
      name: row[xAxis],
      value: row[yAxis] || 0
    }));
  }
  
  private static generateScatterData(data: any[], config: ChartConfig): any {
    const { xAxis, yAxis } = config;
    
    if (!xAxis || !yAxis) return data;
    
    return data.map(row => ({
      x: row[xAxis] || 0,
      y: row[yAxis] || 0,
      name: row[Object.keys(row)[0]] // Use first column as label
    }));
  }
  
  private static generateHeatmapData(data: any[], config: ChartConfig): any {
    // Generate correlation matrix or 2D grid
    const numericCols = Object.keys(data[0]).filter(col => 
      typeof data[0][col] === 'number'
    );
    
    const matrix: any[] = [];
    
    numericCols.forEach((col1, i) => {
      numericCols.forEach((col2, j) => {
        const correlation = this.calculateCorrelation(
          data.map(r => r[col1]),
          data.map(r => r[col2])
        );
        
        matrix.push({
          x: col1,
          y: col2,
          value: correlation
        });
      });
    });
    
    return matrix;
  }
  
  private static generateWaterfallData(data: any[], config: ChartConfig): any {
    const { xAxis = Object.keys(data[0])[0], yAxis = Object.keys(data[0])[1] } = config;
    
    let cumulative = 0;
    
    return data.map((row, index) => {
      const value = row[yAxis] || 0;
      const start = cumulative;
      cumulative += value;
      
      return {
        name: row[xAxis],
        value: value,
        start: start,
        end: cumulative,
        isTotal: index === data.length - 1
      };
    });
  }
  
  private static generateTreemapData(data: any[], config: ChartConfig): any {
    const { xAxis = Object.keys(data[0])[0], yAxis = Object.keys(data[0])[1] } = config;
    
    return data.map(row => ({
      name: row[xAxis],
      value: row[yAxis] || 0,
      // Color can be based on a third dimension
      colorValue: row[Object.keys(row)[2]] || row[yAxis]
    }));
  }
  
  private static generateFunnelData(data: any[], config: ChartConfig): any {
    const { xAxis = Object.keys(data[0])[0], yAxis = Object.keys(data[0])[1] } = config;
    
    // Sort by value descending for proper funnel shape
    const sorted = [...data].sort((a, b) => (b[yAxis] || 0) - (a[yAxis] || 0));
    
    return sorted.map((row, index) => ({
      name: row[xAxis],
      value: row[yAxis] || 0,
      percentage: index === 0 ? 100 : ((row[yAxis] || 0) / (sorted[0][yAxis] || 1)) * 100
    }));
  }
  
  private static generateGaugeData(data: any[], config: ChartConfig): any {
    const { yAxis = Object.keys(data[0]).find(k => typeof data[0][k] === 'number') } = config;
    
    if (!yAxis || data.length === 0) return { value: 0, min: 0, max: 100 };
    
    const values = data.map(r => r[yAxis] || 0).filter(v => typeof v === 'number');
    const currentValue = values[values.length - 1]; // Latest value
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      value: currentValue,
      min: min,
      max: max,
      target: max * 0.8, // 80% of max as target
      percentage: ((currentValue - min) / (max - min)) * 100
    };
  }
  
  private static generateRadarData(data: any[], config: ChartConfig): any {
    const { xAxis = Object.keys(data[0])[0] } = config;
    const numericCols = Object.keys(data[0]).filter(col => 
      typeof data[0][col] === 'number' && col !== xAxis
    );
    
    return data.map(row => ({
      name: row[xAxis],
      data: numericCols.map(col => ({
        axis: col,
        value: row[col] || 0
      }))
    }));
  }
  
  private static generateSankeyData(data: any[], config: ChartConfig): any {
    // Assumes data has source, target, value columns
    const sourceCol = Object.keys(data[0]).find(k => k.toLowerCase().includes('source') || k.toLowerCase().includes('from')) || Object.keys(data[0])[0];
    const targetCol = Object.keys(data[0]).find(k => k.toLowerCase().includes('target') || k.toLowerCase().includes('to')) || Object.keys(data[0])[1];
    const valueCol = Object.keys(data[0]).find(k => typeof data[0][k] === 'number') || Object.keys(data[0])[2];
    
    const nodes = new Set<string>();
    const links: any[] = [];
    
    data.forEach(row => {
      const source = row[sourceCol];
      const target = row[targetCol];
      const value = row[valueCol] || 1;
      
      nodes.add(source);
      nodes.add(target);
      
      links.push({
        source,
        target,
        value
      });
    });
    
    return {
      nodes: Array.from(nodes).map(name => ({ name })),
      links
    };
  }
  
  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;
    
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}