import { Router } from 'express';
import { requireAuth } from '../auth';
import { storage } from '../storage';
import { AdvancedAnalyticsService } from '../services/advancedAnalytics';
import { DuckDBService } from '../services/duckdbService';
import { RedisService } from '../services/redisService';
import { JobQueue } from '../services/jobQueue';

export const advancedAnalyticsRouter = Router();

// Statistical significance testing
advancedAnalyticsRouter.post('/statistical-test', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, test, column1, column2 } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Extract data for columns
    const data1 = data.map(row => row[column1]).filter(val => typeof val === 'number');
    const data2 = data.map(row => row[column2]).filter(val => typeof val === 'number');

    let result;
    switch (test) {
      case 't-test':
        result = AdvancedAnalyticsService.performTTest(data1, data2);
        break;
      case 'chi-square':
        // For chi-square, we need frequency data
        const observed = Object.values(
          data.reduce((acc: any, row) => {
            const key = row[column1];
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})
        );
        const expected = Array(observed.length).fill(data.length / observed.length);
        result = AdvancedAnalyticsService.performChiSquareTest(observed as number[], expected);
        break;
      default:
        return res.status(400).json({ message: 'Invalid test type' });
    }

    res.json(result);
  } catch (error) {
    console.error('Statistical test error:', error);
    res.status(500).json({ message: 'Failed to perform statistical test' });
  }
});

// Forecast generation
advancedAnalyticsRouter.post('/forecast', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, timeColumn, valueColumn, horizon = 12 } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Extract time series data
    const timeSeriesData = data
      .map(row => ({
        time: row[timeColumn],
        value: parseFloat(row[valueColumn])
      }))
      .filter(item => !isNaN(item.value))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (timeSeriesData.length === 0) {
      return res.status(400).json({ message: 'No valid time series data found' });
    }

    // Simple linear regression for forecasting
    const n = timeSeriesData.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = timeSeriesData.map(d => d.value);
    
    const meanX = xValues.reduce((a, b) => a + b, 0) / n;
    const meanY = yValues.reduce((a, b) => a + b, 0) / n;
    
    const slope = xValues.reduce((sum, x, i) => sum + (x - meanX) * (yValues[i] - meanY), 0) /
                  xValues.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
    const intercept = meanY - slope * meanX;

    // Generate forecast
    const forecast = [];
    const lastIndex = n - 1;
    
    // Add historical data
    timeSeriesData.forEach((item, i) => {
      forecast.push({
        period: item.time,
        actual: item.value,
        forecast: intercept + slope * i,
        lower: (intercept + slope * i) * 0.9,
        upper: (intercept + slope * i) * 1.1,
        confidence: 0.95
      });
    });
    
    // Add future predictions
    for (let i = 1; i <= horizon; i++) {
      const futureValue = intercept + slope * (lastIndex + i);
      forecast.push({
        period: `Period ${n + i}`,
        forecast: futureValue,
        lower: futureValue * 0.8,
        upper: futureValue * 1.2,
        confidence: Math.max(0.7, 0.95 - i * 0.02)
      });
    }

    res.json({ forecast });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ message: 'Failed to generate forecast' });
  }
});

// Anomaly detection
advancedAnalyticsRouter.post('/anomaly-detection', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, column, method = 'z-score' } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Extract numeric values
    const values = data
      .map(row => parseFloat(row[column]))
      .filter(val => !isNaN(val));

    if (values.length === 0) {
      return res.status(400).json({ message: 'No numeric data found in column' });
    }

    // Calculate statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
    );

    // Detect anomalies using Z-score
    const anomalies = [];
    const threshold = 2; // Standard deviations from mean

    data.forEach((row, index) => {
      const value = parseFloat(row[column]);
      if (!isNaN(value)) {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > threshold) {
          anomalies.push({
            company: row.company || row.name || `Row ${index + 1}`,
            metric: column,
            current: value,
            expected: mean,
            deviation: value - mean,
            severity: zScore > 3 ? 'high' : 'medium',
            trend: value > mean ? 'declining' : 'improving'
          });
        }
      }
    });

    res.json({ anomalies, statistics: { mean, stdDev, total: values.length } });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Failed to detect anomalies' });
  }
});

// Predictive modeling
advancedAnalyticsRouter.post('/predictive-model', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, modelType, xColumn, yColumn, degree } = req.body;
    
    // Check Redis cache first
    const redis = RedisService.getInstance();
    const cacheKey = `model:${dataSourceId}:${modelType}:${xColumn}:${yColumn}`;
    const cached = await redis.getCachedAnalytics(dataSourceId, cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Prepare data for modeling
    const modelData = data
      .map(row => ({ x: row[xColumn], y: row[yColumn] }))
      .filter(d => typeof d.x === 'number' && typeof d.y === 'number');

    if (modelData.length < 3) {
      return res.status(400).json({ message: 'Insufficient data for modeling' });
    }

    let result;
    switch (modelType) {
      case 'linear':
        result = AdvancedAnalyticsService.buildLinearRegressionModel(modelData);
        break;
      case 'polynomial':
        result = AdvancedAnalyticsService.buildPolynomialRegressionModel(modelData, degree || 2);
        break;
      default:
        return res.status(400).json({ message: 'Invalid model type' });
    }

    // Cache result
    await redis.setCachedAnalytics(dataSourceId, cacheKey, result, 3600);

    res.json(result);
  } catch (error) {
    console.error('Predictive modeling error:', error);
    res.status(500).json({ message: 'Failed to build predictive model' });
  }
});

// Anomaly detection
advancedAnalyticsRouter.post('/anomaly-detection', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, method, columns, threshold } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    const results: any = {};

    if (method === 'isolation-forest') {
      // Multi-variate anomaly detection
      results.anomalies = AdvancedAnalyticsService.detectAnomaliesIsolationForest(data, columns);
    } else {
      // Univariate anomaly detection for each column
      for (const column of columns) {
        const columnData = data.map(row => row[column]).filter(val => typeof val === 'number');
        
        switch (method) {
          case 'z-score':
            results[column] = AdvancedAnalyticsService.detectAnomaliesZScore(columnData, threshold || 3);
            break;
          case 'iqr':
            results[column] = AdvancedAnalyticsService.detectAnomaliesIQR(columnData);
            break;
        }
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Failed to detect anomalies' });
  }
});

// Time series analysis
advancedAnalyticsRouter.post('/time-series', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, dateColumn, valueColumn, operation, periods } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Prepare time series data
    const timeSeriesData = data
      .map(row => ({
        date: new Date(row[dateColumn]),
        value: row[valueColumn]
      }))
      .filter(d => !isNaN(d.date.getTime()) && typeof d.value === 'number')
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let result;
    switch (operation) {
      case 'decomposition':
        result = AdvancedAnalyticsService.performSeasonalDecomposition(timeSeriesData);
        break;
      case 'forecast':
        const values = timeSeriesData.map(d => d.value);
        const forecast = AdvancedAnalyticsService.forecastARIMA(values, periods || 12);
        result = { forecast, historical: values };
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json(result);
  } catch (error) {
    console.error('Time series analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze time series' });
  }
});

// DuckDB SQL execution
advancedAnalyticsRouter.post('/duckdb-query', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, query } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data } = storedData;
    
    // Execute query with DuckDB
    const duckdb = DuckDBService.getInstance();
    const result = await duckdb.runSQLQuery(query, dataSourceId, data);

    res.json({ 
      result,
      rowCount: result.length,
      executionTime: Date.now()
    });
  } catch (error) {
    console.error('DuckDB query error:', error);
    res.status(500).json({ message: 'Failed to execute query' });
  }
});

// Advanced aggregations
advancedAnalyticsRouter.post('/advanced-aggregation', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, groupBy, aggregations } = req.body;
    
    // Get data from storage
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const { data, columns } = storedData;
    
    // Create temporary table in DuckDB
    const duckdb = DuckDBService.getInstance();
    const tableName = `temp_${dataSourceId}`;
    await duckdb.createTableFromData(tableName, data, columns);

    // Build aggregation query
    const aggClauses = Object.entries(aggregations).map(([col, funcs]: [string, any]) => {
      return (funcs as string[]).map(func => `${func}("${col}") as ${col}_${func.toLowerCase()}`);
    }).flat();

    const query = `
      SELECT "${groupBy}", ${aggClauses.join(', ')}
      FROM ${tableName}
      GROUP BY "${groupBy}"
      ORDER BY "${groupBy}"
    `;

    const result = await duckdb.executeQuery(query);

    res.json(result);
  } catch (error) {
    console.error('Advanced aggregation error:', error);
    res.status(500).json({ message: 'Failed to perform aggregation' });
  }
});

// Trigger background analytics job
advancedAnalyticsRouter.post('/trigger-analysis', requireAuth, async (req, res) => {
  try {
    const { dataSourceId } = req.body;
    const userId = (req.user as any).id;

    // Add job to queue
    const job = await JobQueue.addAnalyticsJob(dataSourceId, userId);

    res.json({ 
      message: 'Analysis job started',
      jobId: job.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Job trigger error:', error);
    res.status(500).json({ message: 'Failed to start analysis job' });
  }
});

// Get job status
advancedAnalyticsRouter.get('/job-status/:jobId', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await JobQueue.getJobStatus('analytics', jobId);

    if (!status) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ message: 'Failed to get job status' });
  }
});