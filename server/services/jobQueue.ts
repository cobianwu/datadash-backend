import Bull from 'bull';
import { FileProcessor } from './fileProcessor';
import { DataTransformer } from './dataTransformer';
import { AnalyticsEngine } from './analyticsEngine';
import { AdvancedAnalyticsService } from './advancedAnalytics';
import { DuckDBService } from './duckdbService';
import { storage } from '../storage';

// Create job queues
const analyticsQueue = new Bull('analytics', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

const fileProcessingQueue = new Bull('file-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3
  }
});

const exportQueue = new Bull('export', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 2
  }
});

// Job processors
analyticsQueue.process('comprehensive-analysis', async (job) => {
  const { dataSourceId, userId } = job.data;
  
  try {
    // Get data source
    const dataSource = await storage.getDataSource(dataSourceId);
    if (!dataSource) throw new Error('Data source not found');

    // Get data
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) throw new Error('Data not found');

    const { data, columns } = storedData;

    // Perform advanced analytics
    const advancedResults: any = {};

    // 1. Statistical tests
    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );

    if (numericColumns.length >= 2) {
      const col1Data = data.map(row => row[numericColumns[0]]);
      const col2Data = data.map(row => row[numericColumns[1]]);
      advancedResults.tTest = AdvancedAnalyticsService.performTTest(col1Data, col2Data);
    }

    // 2. Predictive modeling
    if (numericColumns.length >= 2) {
      const modelData = data.map(row => ({
        x: row[numericColumns[0]],
        y: row[numericColumns[1]]
      })).filter(d => typeof d.x === 'number' && typeof d.y === 'number');

      advancedResults.linearRegression = AdvancedAnalyticsService.buildLinearRegressionModel(modelData);
      advancedResults.polynomialRegression = AdvancedAnalyticsService.buildPolynomialRegressionModel(modelData, 2);
    }

    // 3. Anomaly detection
    if (numericColumns.length > 0) {
      const firstNumericCol = data.map(row => row[numericColumns[0]]);
      advancedResults.anomaliesZScore = AdvancedAnalyticsService.detectAnomaliesZScore(firstNumericCol);
      advancedResults.anomaliesIQR = AdvancedAnalyticsService.detectAnomaliesIQR(firstNumericCol);
    }

    // 4. DuckDB analytics
    const duckdb = DuckDBService.getInstance();
    await duckdb.createTableFromData(`ds_${dataSourceId}`, data, columns);
    advancedResults.duckdbStats = await duckdb.performAdvancedAnalytics(`ds_${dataSourceId}`);

    // Store results
    await storage.updateDataSource(dataSourceId, {
      advancedAnalytics: advancedResults,
      analysisStatus: 'completed'
    });

    return advancedResults;
  } catch (error) {
    console.error('Analytics job error:', error);
    throw error;
  }
});

fileProcessingQueue.process('process-large-file', async (job) => {
  const { filePath, fileName, dataSourceId } = job.data;
  
  try {
    // Update status
    await storage.updateDataSource(dataSourceId, { status: 'processing' });

    // Process file in chunks
    const processedFile = await FileProcessor.processFile(filePath, fileName);
    
    // Clean and analyze data
    const cleanedData = DataTransformer.cleanData(processedFile.data || []);
    const dataQuality = DataTransformer.analyzeDataQuality(cleanedData);
    const analysis = AnalyticsEngine.performComprehensiveAnalysis(cleanedData);

    // Store results
    await storage.storeDataSourceData(
      dataSourceId,
      cleanedData,
      processedFile.columns,
      analysis,
      dataQuality
    );

    // Update status
    await storage.updateDataSource(dataSourceId, { 
      status: 'ready',
      rowCount: cleanedData.length,
      schema: processedFile.schema
    });

    // Trigger advanced analytics
    await analyticsQueue.add('comprehensive-analysis', {
      dataSourceId,
      userId: job.data.userId
    });

    return { success: true, rowCount: cleanedData.length };
  } catch (error) {
    console.error('File processing job error:', error);
    await storage.updateDataSource(dataSourceId, { status: 'error' });
    throw error;
  }
});

// Job event handlers
analyticsQueue.on('completed', (job, result) => {
  console.log(`Analytics job ${job.id} completed`);
});

analyticsQueue.on('failed', (job, err) => {
  console.error(`Analytics job ${job.id} failed:`, err);
});

fileProcessingQueue.on('progress', (job, progress) => {
  console.log(`File processing job ${job.id} is ${progress}% complete`);
});

// Export functions
export const JobQueue = {
  // Add analytics job
  async addAnalyticsJob(dataSourceId: number, userId: number) {
    return await analyticsQueue.add('comprehensive-analysis', {
      dataSourceId,
      userId
    });
  },

  // Add file processing job
  async addFileProcessingJob(filePath: string, fileName: string, dataSourceId: number, userId: number) {
    return await fileProcessingQueue.add('process-large-file', {
      filePath,
      fileName,
      dataSourceId,
      userId
    });
  },

  // Add export job
  async addExportJob(type: string, dataSourceId: number, userId: number, options: any = {}) {
    return await exportQueue.add('generate-export', {
      type,
      dataSourceId,
      userId,
      options
    });
  },

  // Get job status
  async getJobStatus(queueName: string, jobId: string) {
    const queue = queueName === 'analytics' ? analyticsQueue : 
                  queueName === 'file-processing' ? fileProcessingQueue : 
                  exportQueue;
    
    const job = await queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason
    };
  },

  // Clean up old jobs
  async cleanupJobs() {
    await analyticsQueue.clean(1000 * 60 * 60 * 24); // 24 hours
    await fileProcessingQueue.clean(1000 * 60 * 60 * 24);
    await exportQueue.clean(1000 * 60 * 60 * 24);
  }
};