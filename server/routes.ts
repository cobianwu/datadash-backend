import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, requireAuth, hashPassword } from "./auth";
import { FileProcessor } from "./services/fileProcessor";
import { processAIQuery, generateSQLFromNaturalLanguage, generateChartFromDescription, generateInsights } from "./services/ai";
import { SQLParser } from "./services/sqlParser";
import { DataTransformer } from "./services/dataTransformer";
import { AnalyticsEngine } from "./services/analyticsEngine";
import { ChartGenerator } from "./services/chartGenerator";
import { z } from "zod";
import { analyticsRouter } from "./routes/analytics";
import { exportRouter } from "./routes/export";
import { advancedAnalyticsRouter } from "./routes/advancedAnalytics";
import { dataCleanRouter } from "./routes/dataClean";
import { RealtimeService } from "./services/realtimeService";
import Papa from "papaparse";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Register analytics routes
  app.use('/api/analytics', analyticsRouter);
  
  // Register export routes
  app.use('/api/export', exportRouter);
  
  // Register advanced analytics routes
  app.use('/api/advanced-analytics', advancedAnalyticsRouter);
  
  // Register data cleaning routes
  app.use('/api', dataCleanRouter);

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user, message: "Login successful" });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUserWithPassword(username, email, passwordHash);
      
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Dashboard data routes
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const companies = await storage.getUserCompanies(userId);
      
      const totalValue = companies.reduce((sum, company) => 
        sum + parseFloat(company.marketCap || "0"), 0);
      
      const metrics = {
        totalPortfolioValue: totalValue,
        activeInvestments: companies.length,
        averageIRR: 24.8,
        dataQualityScore: 94
      };
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/dashboard/portfolio-performance", requireAuth, async (req, res) => {
    try {
      // Mock portfolio performance data
      const performanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Portfolio Value',
          data: [1800, 1950, 2100, 2050, 2200, 2300, 2250, 2400, 2350, 2500, 2450, 2400]
        }, {
          label: 'Forecast',
          data: [null, null, null, null, null, null, null, null, null, 2500, 2600, 2750]
        }]
      };
      
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  app.get("/api/dashboard/sector-allocation", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const companies = await storage.getUserCompanies(userId);
      
      const sectorData = companies.reduce((acc, company) => {
        acc[company.sector] = (acc[company.sector] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const chartData = {
        labels: Object.keys(sectorData),
        data: Object.values(sectorData)
      };
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sector data" });
    }
  });

  app.get("/api/dashboard/top-performers", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const companies = await storage.getUserCompanies(userId);
      
      // Mock performance data
      const performers = companies.map(company => ({
        id: company.id,
        name: company.name,
        sector: company.sector,
        performance: Math.random() * 40 + 5, // 5-45% range
        value: parseFloat(company.marketCap || "0")
      })).sort((a, b) => b.performance - a.performance).slice(0, 3);
      
      res.json(performers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  // Company routes
  app.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const companies = await storage.getUserCompanies(userId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const company = await storage.createCompany({ ...req.body, userId });
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Warehouse routes
  app.get("/api/warehouses", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const warehouses = await storage.getUserWarehouses(userId);
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/warehouses", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const warehouse = await storage.createWarehouse({ ...req.body, userId });
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ message: "Failed to create warehouse" });
    }
  });

  app.patch("/api/warehouses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const warehouse = await storage.updateWarehouse(id, req.body);
      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update warehouse" });
    }
  });

  // Data source routes
  app.get("/api/data-sources", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const dataSources = await storage.getUserDataSources(userId);
      res.json(dataSources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post("/api/data-sources/upload", requireAuth, FileProcessor.upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req.user as any).id;
      const processedFile = await FileProcessor.processFile(req.file.path, req.file.originalname);
      
      // Check if it's a multi-sheet workbook
      const isMultiSheet = processedFile.type === 'excel-multisheet';
      let multiSheetData = null;
      let workbookSummary = null;
      let sheets = null;
      
      if (isMultiSheet) {
        multiSheetData = (processedFile as any).multiSheetData;
        workbookSummary = (processedFile as any).workbookSummary;
        sheets = (processedFile as any).sheets;
      }
      
      const dataSource = await storage.createDataSource({
        name: processedFile.name,
        type: processedFile.type,
        fileName: req.file.originalname,
        filePath: req.file.path,
        schema: processedFile.schema,
        rowCount: processedFile.rowCount,
        status: 'ready',
        userId
      });

      // Clean and analyze the data
      const cleanedData = DataTransformer.cleanData(processedFile.data || []);
      const dataQuality = DataTransformer.analyzeDataQuality(cleanedData);
      const analysis = AnalyticsEngine.performComprehensiveAnalysis(cleanedData);
      
      // Store the data in database for persistence
      await storage.storeDataSourceData(
        dataSource.id,
        cleanedData,
        processedFile.columns,
        analysis,
        dataQuality
      );
      
      // Also keep in memory for quick access
      (global as any).uploadedData = (global as any).uploadedData || {};
      (global as any).uploadedData[dataSource.id] = {
        data: cleanedData,
        columns: processedFile.columns,
        analysis,
        dataQuality,
        multiSheetData,
        workbookSummary,
        sheets
      };

      res.json({
        ...dataSource,
        columns: processedFile.columns,
        sampleData: cleanedData?.slice(0, 5),
        dataQuality: {
          totalRows: dataQuality.totalRows,
          cleanRows: dataQuality.cleanRows,
          issues: dataQuality.issues.length,
          recommendations: dataQuality.recommendations
        },
        analysis: {
          summary: analysis.summary,
          insights: analysis.insights.slice(0, 3)
        }
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: `Failed to process file: ${error}` });
    }
  });

  // Data sources preview endpoint
  app.get("/api/data-sources/:id/preview", requireAuth, async (req, res) => {
    try {
      const dataSource = await storage.getDataSource(parseInt(req.params.id));
      
      if (!dataSource || dataSource.userId !== req.user!.id) {
        return res.status(404).json({ message: "Data source not found" });
      }

      console.log("Fetching preview for data source:", dataSource.id);

      // Try to get data from memory first
      const uploadedData = (global as any).uploadedData || {};
      const memoryData = uploadedData[dataSource.id];
      
      if (memoryData && memoryData.data) {
        console.log("Found data in memory:", memoryData.data.length, "rows");
        const previewData = memoryData.data.slice(0, 20);
        return res.json({ 
          preview: previewData,
          totalRows: memoryData.data.length,
          columns: memoryData.columns || dataSource.columns || []
        });
      }

      // Get data from storage
      const storedData = await storage.getDataSourceData(dataSource.id);
      console.log("Stored data result:", storedData ? "found" : "not found");
      
      if (storedData && storedData.data && storedData.data.length > 0) {
        // Return first 20 rows for preview
        const previewData = storedData.data.slice(0, 20);
        
        // Cache in memory for future use
        uploadedData[dataSource.id] = storedData;
        (global as any).uploadedData = uploadedData;
        
        return res.json({ 
          preview: previewData,
          totalRows: storedData.data.length,
          columns: storedData.columns || dataSource.columns || []
        });
      }

      // Try to load from file if available
      if (dataSource.filePath) {
        try {
          const fs = await import("fs");
          if (fs.existsSync(dataSource.filePath)) {
            const processedFile = await FileProcessor.processFile(dataSource.filePath, dataSource.fileName || "file");
            if (processedFile.data && processedFile.data.length > 0) {
              const previewData = processedFile.data.slice(0, 20);
              
              // Store for future use
              await storage.storeDataSourceData(
                dataSource.id,
                processedFile.data,
                processedFile.columns,
                null,
                null
              );
              
              return res.json({ 
                preview: previewData,
                totalRows: processedFile.data.length,
                columns: processedFile.columns || []
              });
            }
          }
        } catch (fileError) {
          console.error("Error loading from file:", fileError);
        }
      }

      console.log("No data found for preview");
      res.json({ preview: [], totalRows: 0, columns: dataSource.columns || [] });
    } catch (error) {
      console.error("Error fetching preview:", error);
      res.status(500).json({ message: "Failed to fetch preview" });
    }
  });

  // Download data source endpoint
  app.get("/api/data-sources/:id/download", requireAuth, async (req, res) => {
    try {
      const dataSource = await storage.getDataSource(parseInt(req.params.id));
      
      if (!dataSource || dataSource.userId !== req.user!.id) {
        return res.status(404).json({ message: "Data source not found" });
      }

      // Get data from storage
      const storedData = await storage.getDataSourceData(dataSource.id);
      
      if (!storedData || !storedData.data) {
        return res.status(404).json({ message: "Data not found" });
      }

      // Convert data to CSV format
      const csv = Papa.unparse(storedData.data);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${dataSource.name}.csv"`);
      
      res.send(csv);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download data source" });
    }
  });

  // Delete data source endpoint
  app.delete("/api/data-sources/:id", requireAuth, async (req, res) => {
    try {
      const dataSourceId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Verify ownership
      const dataSource = await storage.getDataSource(dataSourceId);
      if (!dataSource || dataSource.userId !== userId) {
        return res.status(404).json({ message: "Data source not found" });
      }
      
      // Delete from storage
      const deleted = await storage.deleteDataSource(dataSourceId);
      
      // Remove from memory cache
      const uploadedData = (global as any).uploadedData || {};
      delete uploadedData[dataSourceId];
      (global as any).uploadedData = uploadedData;
      
      if (deleted) {
        res.json({ success: true, message: "Data source deleted successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to delete data source" });
      }
    } catch (error) {
      console.error("Delete data source error:", error);
      res.status(500).json({ success: false, message: "Failed to delete data source" });
    }
  });

  // SQL query routes
  app.post("/api/query/execute", requireAuth, async (req, res) => {
    try {
      const { sql, warehouseId } = req.body;
      const userId = (req.user as any).id;

      const validation = SQLParser.validateSQL(sql);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      const result = await SQLParser.executeQuery(sql, warehouseId);
      
      // Save to query history
      await storage.createQueryHistory({
        sqlQuery: sql,
        status: 'completed',
        duration: result.duration,
        rowsReturned: result.rowCount,
        creditsUsed: "0.001",
        warehouseId,
        userId
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Query execution failed" });
    }
  });

  app.get("/api/query/history", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const history = await storage.getUserQueryHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch query history" });
    }
  });

  // AI routes
  app.post("/api/ai/query", requireAuth, async (req, res) => {
    try {
      const { query, dataSourceId } = req.body;
      const userId = (req.user as any)?.id;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const startTime = Date.now();

      // Get uploaded data if available
      const uploadedData = (global as any).uploadedData || {};
      let analysisData = [];
      let columns = [];

      console.log("AI Query - DataSourceId:", dataSourceId);
      console.log("Available data sources:", Object.keys(uploadedData));

      // Check for data source
      let sourceAnalysis = null;
      if (dataSourceId && uploadedData[dataSourceId]) {
        const sourceData = uploadedData[dataSourceId];
        analysisData = sourceData.data || [];
        columns = sourceData.columns || [];
        sourceAnalysis = sourceData.analysis;
        console.log(`Found data for source ${dataSourceId}: ${analysisData.length} rows, ${columns.length} columns`);
      } else {
        console.log(`No data found for source ${dataSourceId}`);
        // Try to fetch from database storage if not in memory
        if (dataSourceId) {
          try {
            console.log("Checking database for stored data...");
            const storedData = await storage.getDataSourceData(dataSourceId);
            if (storedData) {
              analysisData = storedData.data;
              columns = storedData.columns;
              sourceAnalysis = storedData.analysis;
              
              // Store back in memory for quick access
              uploadedData[dataSourceId] = {
                data: analysisData,
                columns: columns,
                analysis: storedData.analysis,
                dataQuality: storedData.dataQuality
              };
              (global as any).uploadedData = uploadedData;
              console.log(`Loaded data from database: ${analysisData.length} rows`);
            } else {
              // Fallback: try to reload from file
              const dataSource = await storage.getDataSource(dataSourceId);
              if (dataSource && dataSource.filePath) {
                console.log("Attempting to reload data from file:", dataSource.filePath);
                const processedFile = await FileProcessor.processFile(dataSource.filePath, dataSource.fileName);
                analysisData = processedFile.data || [];
                columns = processedFile.columns || [];
                
                // Store back in memory and database
                const analysis = AnalyticsEngine.performComprehensiveAnalysis(analysisData);
                const dataQuality = DataTransformer.analyzeDataQuality(analysisData);
                
                await storage.storeDataSourceData(dataSourceId, analysisData, columns, analysis, dataQuality);
                
                uploadedData[dataSourceId] = {
                  data: analysisData,
                  columns: columns,
                  analysis,
                  dataQuality
                };
                (global as any).uploadedData = uploadedData;
                console.log(`Reloaded and stored data: ${analysisData.length} rows`);
              }
            }
          } catch (error) {
            console.error("Error loading data:", error);
          }
        }
      }

      // Use analytics engine to generate smart query
      const smartQuery = AnalyticsEngine.generateSmartQuery(analysisData, query);
      
      // Use real AI to process the query
      const sql = smartQuery.sql || await generateSQLFromNaturalLanguage(query);
      
      // Generate insights based on the actual data
      const engineInsights = sourceAnalysis ? sourceAnalysis.insights : [];
      const aiInsights = await generateInsights(analysisData, query);
      const insights = [...engineInsights, ...aiInsights].slice(0, 5);
      
      // Get chart recommendations from chart generator
      const chartRecommendations = ChartGenerator.recommendCharts(analysisData, query, columns);
      const chartSuggestions = chartRecommendations.map(rec => ({
        type: rec.type,
        title: rec.reason,
        config: rec.config
      }));

      // Process the data based on the query
      let resultData = [];
      
      if (analysisData.length > 0) {
        // Simple data processing based on common queries
        const queryLower = query.toLowerCase();
        
        // Find relevant columns intelligently
        const findColumn = (keywords: string[]) => {
          for (const keyword of keywords) {
            const col = columns.find(c => c.toLowerCase().includes(keyword));
            if (col) return col;
          }
          return null;
        };
        
        // Identify date, value and category columns
        const dateColumn = findColumn(['date', 'month', 'time', 'period', 'year']);
        const revenueColumn = findColumn(['revenue', 'sales', 'amount', 'total', 'value']);
        const profitColumn = findColumn(['profit', 'earnings', 'income']);
        const companyColumn = findColumn(['company', 'customer', 'client', 'name']);
        const regionColumn = findColumn(['region', 'area', 'location', 'country']);
        const productColumn = findColumn(['product', 'item', 'service']);
        
        if (queryLower.includes("month") || queryLower.includes("time") || queryLower.includes("trend")) {
          // Time series data
          const timeCol = dateColumn || columns[0];
          const valueCol = revenueColumn || profitColumn || columns.find(c => typeof analysisData[0][c] === 'number') || columns[1];
          
          // Group by time period
          const timeGroups: any = {};
          analysisData.forEach(row => {
            const timeKey = row[timeCol] || 'Unknown';
            if (!timeGroups[timeKey]) timeGroups[timeKey] = 0;
            timeGroups[timeKey] += parseFloat(row[valueCol]) || 0;
          });
          
          resultData = Object.entries(timeGroups)
            .map(([name, value]) => ({
              name,
              value: Math.round(value as number)
            }))
            .sort((a, b) => {
              // Sort by date if possible
              const dateA = new Date(a.name).getTime();
              const dateB = new Date(b.name).getTime();
              if (!isNaN(dateA) && !isNaN(dateB)) {
                return dateA - dateB;
              }
              return 0;
            })
            .slice(0, 24); // Show up to 24 time periods
            
        } else if (queryLower.includes("top") || queryLower.includes("best")) {
          // Top performers
          const nameCol = companyColumn || productColumn || columns[0];
          const valueCol = revenueColumn || profitColumn || columns.find(c => typeof analysisData[0][c] === 'number') || columns[1];
          
          // Aggregate by name
          const groups: any = {};
          analysisData.forEach(row => {
            const key = row[nameCol] || 'Unknown';
            if (!groups[key]) groups[key] = 0;
            groups[key] += parseFloat(row[valueCol]) || 0;
          });
          
          resultData = Object.entries(groups)
            .map(([name, value]) => ({
              name,
              value: Math.round(value as number)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
            
        } else if (queryLower.includes("by") || queryLower.includes("group") || queryLower.includes("compare")) {
          // Group by analysis
          let groupColumn = columns[0];
          let valueColumn = revenueColumn || profitColumn || columns.find(c => typeof analysisData[0][c] === 'number') || columns[1];
          
          // Determine grouping based on query
          if (queryLower.includes("company") || queryLower.includes("customer")) {
            groupColumn = companyColumn || columns[0];
          } else if (queryLower.includes("region") || queryLower.includes("location")) {
            groupColumn = regionColumn || columns[0];
          } else if (queryLower.includes("product") || queryLower.includes("item")) {
            groupColumn = productColumn || columns[0];
          }
          
          const groups: any = {};
          analysisData.forEach(row => {
            const key = row[groupColumn] || "Other";
            if (!groups[key]) groups[key] = 0;
            const value = parseFloat(row[valueColumn]) || 0;
            groups[key] += value;
          });
          
          resultData = Object.entries(groups)
            .map(([name, value]) => ({
              name,
              value: Math.round(value as number)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20); // Show top 20 groups
            
        } else {
          // Default: show summary of numeric columns
          const numericCol = revenueColumn || profitColumn || columns.find(c => typeof analysisData[0][c] === 'number');
          const nameCol = companyColumn || productColumn || columns[0];
          
          if (numericCol) {
            // Aggregate by name column
            const groups: any = {};
            analysisData.forEach(row => {
              const key = row[nameCol] || 'Item';
              if (!groups[key]) groups[key] = 0;
              groups[key] += parseFloat(row[numericCol]) || 0;
            });
            
            resultData = Object.entries(groups)
              .map(([name, value]) => ({
                name,
                value: Math.round(value as number)
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 15);
          } else {
            // Fallback to counting occurrences
            const counts: any = {};
            analysisData.forEach(row => {
              const key = row[nameCol] || 'Item';
              counts[key] = (counts[key] || 0) + 1;
            });
            
            resultData = Object.entries(counts)
              .map(([name, value]) => ({
                name,
                value: value as number
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 10);
          }
        }
      } else {
        // Fallback data if no data source
        resultData = [
          { name: "Jan", value: 4000 },
          { name: "Feb", value: 3000 },
          { name: "Mar", value: 5000 },
          { name: "Apr", value: 4500 },
          { name: "May", value: 6000 },
          { name: "Jun", value: 5500 }
        ];
      }

      // For now, we'll use the simple resultData directly
      // This ensures data is always in the correct format for charts
      let chartData = resultData;

      const result = {
        sql,
        data: resultData,
        insights: insights.length > 0 ? insights : [
          `Found ${resultData.length} data points matching your query`,
          `Highest value: ${Math.max(...resultData.map(d => d.value))}`,
          `Average value: ${Math.round(resultData.reduce((sum, d) => sum + d.value, 0) / resultData.length)}`
        ],
        chartSuggestions,
        chartData,
        queryExplanation: smartQuery.explanation,
        executionTime: Date.now() - startTime
      };

      res.json(result);
    } catch (error) {
      console.error("AI query error:", error);
      res.status(500).json({ error: "Failed to process AI query" });
    }
  });

  app.post("/api/ai/sql", requireAuth, async (req, res) => {
    try {
      const { query, schema } = req.body;
      const sql = await generateSQLFromNaturalLanguage(query, schema);
      res.json({ sql });
    } catch (error) {
      res.status(500).json({ message: "SQL generation failed" });
    }
  });

  app.post("/api/ai/chart", requireAuth, async (req, res) => {
    try {
      const { description, data } = req.body;
      const chartConfig = await generateChartFromDescription(description, data);
      res.json(chartConfig);
    } catch (error) {
      res.status(500).json({ message: "Chart generation failed" });
    }
  });

  app.post("/api/ai/insights", requireAuth, async (req, res) => {
    try {
      const { data, context } = req.body;
      const insights = await generateInsights(data, context);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: "Insights generation failed" });
    }
  });

  // Chart routes
  app.get("/api/charts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const charts = await storage.getUserCharts(userId);
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch charts" });
    }
  });

  app.post("/api/charts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const chart = await storage.createChart({ ...req.body, userId });
      res.json(chart);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chart" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboards", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const dashboards = await storage.getUserDashboards(userId);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboards" });
    }
  });

  app.post("/api/dashboards", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const dashboard = await storage.createDashboard({ ...req.body, userId });
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dashboard" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize RealtimeService with the server
  RealtimeService.initialize(httpServer);
  
  return httpServer;
}
