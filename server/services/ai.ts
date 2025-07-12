import OpenAI from "openai";
import { IntelligentDataParser } from "./intelligentDataParser";
import { AdvancedAggregator } from "./advancedAggregator";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "test-key"
});

export async function processAIQuery(query: string, context?: any): Promise<any> {
  try {
    // Extract data and metadata from context
    const { data, sheets, workbookSummary } = context || {};
    
    // Analyze query for calculated metrics
    const calculatedMetrics = detectCalculatedMetrics(query);
    const requestedMetrics = extractRequestedMetrics(query);
    const timeFrame = detectTimeFrame(query);
    const aggregationLevel = detectAggregationLevel(query);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an advanced business intelligence assistant specialized in financial analysis and complex data operations.
          
          Available metrics: ${workbookSummary?.availableMetrics?.join(', ') || 'Unknown'}
          Available dimensions: ${workbookSummary?.availableDimensions?.join(', ') || 'Unknown'}
          Date range: ${workbookSummary?.dateRange ? `${workbookSummary.dateRange.start} to ${workbookSummary.dateRange.end}` : 'Unknown'}
          
          Calculated metrics you can compute:
          - EBITDA Margin = EBITDA / Revenue * 100
          - Gross Margin = Gross Profit / Revenue * 100
          - Net Margin = Net Profit / Revenue * 100
          - Revenue per Customer = Revenue / Customers
          - Price per Unit = Revenue / Units
          - Growth Rate = (Current Period - Previous Period) / Previous Period * 100
          - Customer Retention Rate
          - Productivity metrics (revenue/employee, units/hour, etc.)
          
          When analyzing data:
          1. Intelligently search for requested metrics across all sheets and columns
          2. Calculate derived metrics when base metrics are available
          3. Aggregate data at the requested level (company, segment, state, market)
          4. Apply time-based aggregations (monthly, quarterly, annually)
          5. Identify trends and provide actionable insights
          
          Return a structured JSON response with:
          {
            "metrics": ["list of metrics to analyze"],
            "calculations": [{"name": "metric name", "formula": "calculation"}],
            "aggregation": {"level": "company|segment|state|market", "groupBy": ["dimensions"]},
            "timeFrame": {"period": "monthly|quarterly|annually", "start": "date", "end": "date"},
            "chartType": "best chart type for this data",
            "insights": ["key findings"],
            "recommendations": ["actionable recommendations"]
          }`
        },
        {
          role: "user",
          content: `Query: ${query}\n\nCalculated metrics requested: ${calculatedMetrics.join(', ')}\nTime frame: ${timeFrame}\nAggregation level: ${aggregationLevel}`
        }
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Process the data based on AI recommendations
    if (data && result.metrics) {
      const processedData = processDataWithAI(data, result, sheets);
      result.processedData = processedData;
    }
    
    return result;
  } catch (error) {
    console.error("AI processing error:", error);
    return {
      error: "AI processing temporarily unavailable",
      fallback: true,
      metrics: ["revenue"],
      chartType: "bar"
    };
  }
}

function detectCalculatedMetrics(query: string): string[] {
  const metrics = [];
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('margin') || queryLower.includes('ebitda margin')) {
    metrics.push('ebitda_margin');
  }
  if (queryLower.includes('gross margin')) {
    metrics.push('gross_margin');
  }
  if (queryLower.includes('net margin')) {
    metrics.push('net_margin');
  }
  if (queryLower.includes('revenue per customer') || queryLower.includes('arpu')) {
    metrics.push('revenue_per_customer');
  }
  if (queryLower.includes('price per unit') || queryLower.includes('average price')) {
    metrics.push('price_per_unit');
  }
  if (queryLower.includes('growth') || queryLower.includes('yoy') || queryLower.includes('mom')) {
    metrics.push('growth_rate');
  }
  if (queryLower.includes('retention') || queryLower.includes('churn')) {
    metrics.push('retention_rate');
  }
  if (queryLower.includes('productivity')) {
    metrics.push('productivity');
  }
  
  return metrics;
}

function extractRequestedMetrics(query: string): string[] {
  const metrics = [];
  const queryLower = query.toLowerCase();
  
  const metricPatterns = {
    revenue: /revenue|sales|income|turnover/i,
    ebitda: /ebitda|earnings before/i,
    expenses: /expense|cost|opex/i,
    profit: /profit|margin/i,
    customers: /customer|client|account/i,
    units: /unit|volume|quantity/i,
    price: /price|pricing|asp/i
  };
  
  for (const [metric, pattern] of Object.entries(metricPatterns)) {
    if (pattern.test(query)) {
      metrics.push(metric);
    }
  }
  
  return metrics;
}

function detectTimeFrame(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('monthly') || queryLower.includes('by month')) {
    return 'monthly';
  }
  if (queryLower.includes('quarterly') || queryLower.includes('by quarter')) {
    return 'quarterly';
  }
  if (queryLower.includes('annually') || queryLower.includes('yearly') || queryLower.includes('by year')) {
    return 'annually';
  }
  if (queryLower.includes('daily')) {
    return 'daily';
  }
  if (queryLower.includes('weekly')) {
    return 'weekly';
  }
  
  return 'monthly'; // default
}

function detectAggregationLevel(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('by state') || queryLower.includes('state level')) {
    return 'state';
  }
  if (queryLower.includes('by segment') || queryLower.includes('segment level')) {
    return 'segment';
  }
  if (queryLower.includes('by market') || queryLower.includes('market level')) {
    return 'market';
  }
  if (queryLower.includes('by channel')) {
    return 'channel';
  }
  if (queryLower.includes('total') || queryLower.includes('company') || queryLower.includes('overall')) {
    return 'company';
  }
  
  return 'company'; // default
}

function processDataWithAI(data: any, aiResult: any, sheets: any[]): any {
  // Combine data from all sheets if needed
  let combinedData = [];
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Multi-sheet data
    combinedData = Object.values(data).flat();
  } else {
    combinedData = data;
  }
  
  // Apply aggregation based on AI recommendations
  if (aiResult.aggregation) {
    combinedData = AdvancedAggregator.aggregateData(combinedData, {
      level: aiResult.aggregation.level,
      groupBy: aiResult.aggregation.groupBy || [],
      metrics: aiResult.metrics || []
    });
  }
  
  // Create time series if requested
  if (aiResult.timeFrame && aiResult.metrics?.length > 0) {
    combinedData = AdvancedAggregator.createTimeSeries(combinedData, {
      metric: aiResult.metrics[0],
      period: aiResult.timeFrame.period,
      groupBy: aiResult.aggregation?.groupBy || [],
      calculateGrowth: true
    });
  }
  
  // Calculate derived metrics
  if (aiResult.calculations) {
    combinedData = combinedData.map(row => {
      const enhanced = { ...row };
      
      aiResult.calculations.forEach(calc => {
        if (calc.name === 'ebitda_margin' && row.revenue) {
          enhanced.ebitda_margin = (row.ebitda / row.revenue) * 100;
        }
        if (calc.name === 'gross_margin' && row.revenue) {
          enhanced.gross_margin = (row.grossProfit / row.revenue) * 100;
        }
        // Add more calculations as needed
      });
      
      return enhanced;
    });
  }
  
  return combinedData;
}

export async function generateSQLFromNaturalLanguage(query: string, schema?: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a SQL expert. Convert natural language queries to SQL.
          Schema context: ${JSON.stringify(schema || {})}
          
          Generate valid SQL queries based on the schema provided. Focus on business intelligence and analytics use cases.`
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || "SELECT 1;";
  } catch (error) {
    console.error("SQL generation error:", error);
    return "SELECT 1; -- AI temporarily unavailable";
  }
}

export async function generateChartFromDescription(description: string, data?: any): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate chart suggestions based on the query. Return a JSON object with 'suggestions' array containing objects with 'type' and 'title' properties. Chart types can be 'bar', 'line', 'pie', 'scatter', 'area', 'waterfall', 'treemap', etc."
        },
        {
          role: "user",
          content: `Query: ${description}\nData context: ${JSON.stringify(data)}`
        }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || '{"suggestions": []}';
    const result = JSON.parse(content);
    return result.suggestions || [
      { type: "bar", title: "Revenue by Category" },
      { type: "line", title: "Growth Trend" }
    ];
  } catch (error) {
    console.error("Chart generation error:", error);
    return [
      { type: "bar", title: "Revenue Analysis" },
      { type: "scatter", title: "Correlation Analysis" }
    ];
  }
}

export async function generateInsights(data: any[], context?: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the provided data and generate business insights. Return insights as a JSON array of strings. Focus on trends, anomalies, opportunities, and recommendations."
        },
        {
          role: "user",
          content: `Data: ${JSON.stringify(data.slice(0, 10))}\nContext: ${context || 'Portfolio analysis'}`
        }
      ],
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"insights": []}');
    return result.insights || [];
  } catch (error) {
    console.error("Insights generation error:", error);
    return ["Unable to generate insights at this time."];
  }
}
