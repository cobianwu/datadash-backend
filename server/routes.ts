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

      res.json(dataSource);
    } catch (error) {
      res.status(500).json({ message: "Failed to process file" });
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
      const { query } = req.body;
      const userId = (req.user as any)?.id;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const startTime = Date.now();

      // Use real AI to process the query
      const sql = await generateSQLFromNaturalLanguage(query);
      
      // Generate insights based on the query
      const insights = await generateInsights([], query);
      
      // Suggest appropriate charts
      const chartSuggestions = await generateChartFromDescription(query);

      // For now, use mock data for the results (in production, would execute the SQL)
      const mockData = [
        { metric: "Revenue", value: 280341600, change: "+79.6%", period: "2024" },
        { metric: "ARR", value: 3364099200, change: "+65.0%", period: "2024" },
        { metric: "Customers", value: 48005, change: "+4,355", period: "Dec 2024" }
      ];

      const result = {
        sql,
        data: mockData,
        insights,
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
