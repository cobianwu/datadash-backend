import { Router } from 'express';
import { requireAuth } from '../auth';
import { DataTransformer } from '../services/dataTransformer';
import { AnalyticsEngine } from '../services/analyticsEngine';
import { ChartGenerator } from '../services/chartGenerator';

export const analyticsRouter = Router();

// Analyze data quality
analyticsRouter.post('/data-quality', requireAuth, async (req, res) => {
  try {
    const { dataSourceId } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const quality = DataTransformer.analyzeDataQuality(data);
    
    res.json(quality);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze data quality' });
  }
});

// Transform data
analyticsRouter.post('/transform', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, transformations } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const transformed = DataTransformer.cleanData(data, transformations);
    
    // Update stored data
    uploadedData[dataSourceId].data = transformed;
    
    res.json({
      success: true,
      rowCount: transformed.length,
      sampleData: transformed.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transform data' });
  }
});

// Aggregate data
analyticsRouter.post('/aggregate', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, groupBy, metrics } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const aggregated = DataTransformer.aggregateData(data, groupBy, metrics);
    
    res.json({
      data: aggregated,
      rowCount: aggregated.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate data' });
  }
});

// Pivot data
analyticsRouter.post('/pivot', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, rowKey, columnKey, valueKey, aggregation } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const pivoted = DataTransformer.pivotData(data, rowKey, columnKey, valueKey, aggregation);
    
    res.json({
      data: pivoted,
      rowCount: pivoted.length,
      columns: Object.keys(pivoted[0] || {})
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to pivot data' });
  }
});

// Detect trends
analyticsRouter.post('/trends', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, timeColumn, valueColumn } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const trends = DataTransformer.detectTrends(data, timeColumn, valueColumn);
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect trends' });
  }
});

// Heatmap data
analyticsRouter.post('/heatmap', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, metric } = req.body;
    const { storage } = await import('../storage');
    
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    const { data } = storedData;
    
    // Transform data for heatmap display
    // For now, we'll try to extract company/entity data and compute metrics
    const heatmapData = data.map((row: any, index: number) => ({
      company: row.company || row.name || row.entity || `Entity ${index + 1}`,
      sector: row.sector || row.category || row.type || 'General',
      revenue: parseFloat(row.revenue) || parseFloat(row.sales) || parseFloat(row.amount) || 0,
      ebitda: parseFloat(row.ebitda) || parseFloat(row.profit) || parseFloat(row.income) || 0,
      growth: parseFloat(row.growth) || parseFloat(row.growth_rate) || 0,
      margin: parseFloat(row.margin) || parseFloat(row.profit_margin) || 0,
      roic: parseFloat(row.roic) || parseFloat(row.return_on_investment) || 0
    }));
    
    res.json({ data: heatmapData });
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Failed to generate heatmap data' });
  }
});

// Comprehensive analysis
analyticsRouter.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { dataSourceId } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, analysis: cachedAnalysis } = uploadedData[dataSourceId];
    
    // Return cached analysis if available
    if (cachedAnalysis) {
      return res.json(cachedAnalysis);
    }
    
    // Perform new analysis
    const analysis = AnalyticsEngine.performComprehensiveAnalysis(data);
    
    // Cache the analysis
    uploadedData[dataSourceId].analysis = analysis;
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

// Get chart recommendations
analyticsRouter.post('/chart-recommendations', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, query } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, columns } = uploadedData[dataSourceId];
    const recommendations = ChartGenerator.recommendCharts(data, query || '', columns);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chart recommendations' });
  }
});

// Generate chart data
analyticsRouter.post('/chart-data', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, chartConfig } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data } = uploadedData[dataSourceId];
    const chartData = ChartGenerator.generateChartData(data, chartConfig);
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate chart data' });
  }
});