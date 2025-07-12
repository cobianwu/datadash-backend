import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, requireAuth, hashPassword } from "./auth";
import { FileProcessor } from "./services/fileProcessor";
import { processAIQuery, generateSQLFromNaturalLanguage, generateChartFromDescription, generateInsights } from "./services/ai";
import { SQLParser } from "./services/sqlParser";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

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

      // Store the actual data in memory for quick access
      (global as any).uploadedData = (global as any).uploadedData || {};
      (global as any).uploadedData[dataSource.id] = {
        data: processedFile.data,
        columns: processedFile.columns
      };

      res.json({
        ...dataSource,
        columns: processedFile.columns,
        sampleData: processedFile.data?.slice(0, 5)
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: `Failed to process file: ${error}` });
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

      // Check for data source
      if (dataSourceId && uploadedData[dataSourceId]) {
        const sourceData = uploadedData[dataSourceId];
        analysisData = sourceData.data || [];
        columns = sourceData.columns || [];
      }

      // Use real AI to process the query
      const sql = await generateSQLFromNaturalLanguage(query);
      
      // Generate insights based on the actual data
      const insights = await generateInsights(analysisData, query);
      
      // Suggest appropriate charts
      const chartSuggestions = await generateChartFromDescription(query, analysisData);

      // Process the data based on the query
      let resultData = [];
      
      if (analysisData.length > 0) {
        // Simple data processing based on common queries
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes("month") || queryLower.includes("time") || queryLower.includes("trend")) {
          // Time series data
          resultData = analysisData.slice(0, 12).map((row, index) => ({
            name: row[columns[0]] || `Month ${index + 1}`,
            value: row[columns[1]] || Math.floor(Math.random() * 10000),
            category: row[columns[2]] || "Default"
          }));
        } else if (queryLower.includes("top") || queryLower.includes("best")) {
          // Top performers
          resultData = analysisData
            .sort((a, b) => (b[columns[1]] || 0) - (a[columns[1]] || 0))
            .slice(0, 10)
            .map(row => ({
              name: row[columns[0]] || "Unknown",
              value: row[columns[1]] || 0,
              category: row[columns[2]] || "Default"
            }));
        } else if (queryLower.includes("by") || queryLower.includes("group")) {
          // Group by analysis
          const groups: any = {};
          
          // Determine which column to group by
          let groupColumn = columns[0]; // Default to first column
          let valueColumn = columns.find(col => col.toLowerCase().includes('revenue')) || columns[3]; // Look for revenue column
          
          // If query mentions company, group by company
          if (queryLower.includes("company")) {
            groupColumn = columns.find(col => col.toLowerCase().includes('company')) || columns[0];
          } else if (queryLower.includes("region")) {
            groupColumn = columns.find(col => col.toLowerCase().includes('region')) || columns[0];
          } else if (queryLower.includes("product")) {
            groupColumn = columns.find(col => col.toLowerCase().includes('product')) || columns[0];
          }
          
          analysisData.forEach(row => {
            const key = row[groupColumn] || "Other";
            if (!groups[key]) groups[key] = 0;
            const value = parseFloat(row[valueColumn]) || 0;
            groups[key] += value;
          });
          
          resultData = Object.entries(groups)
            .map(([name, value]) => ({
              name,
              value: Math.round(value as number),
              category: groupColumn
            }))
            .sort((a, b) => b.value - a.value);
        } else {
          // Default: show first 10 rows
          resultData = analysisData.slice(0, 10).map(row => ({
            name: row[columns[0]] || "Item",
            value: row[columns[1]] || 0,
            category: row[columns[2]] || "Default"
          }));
        }
      } else {
        // Fallback data if no data source
        resultData = [
          { name: "Jan", value: 4000, category: "Sales" },
          { name: "Feb", value: 3000, category: "Sales" },
          { name: "Mar", value: 5000, category: "Sales" },
          { name: "Apr", value: 4500, category: "Sales" },
          { name: "May", value: 6000, category: "Sales" },
          { name: "Jun", value: 5500, category: "Sales" }
        ];
      }

      const result = {
        sql,
        data: resultData,
        insights: insights.length > 0 ? insights : [
          `Found ${resultData.length} data points matching your query`,
          `Highest value: ${Math.max(...resultData.map(d => d.value))}`,
          `Average value: ${Math.round(resultData.reduce((sum, d) => sum + d.value, 0) / resultData.length)}`
        ],
        chartSuggestions,
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
  return httpServer;
}
