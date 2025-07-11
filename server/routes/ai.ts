import { Router } from "express";
import { processAIQuery, generateInsights } from "../services/ai";
import { requireAuth } from "../auth";

const router = Router();

// Natural language query endpoint
router.post("/query", requireAuth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Process the query with AI
    const result = await processAIQuery(query);
    
    // Mock SQL generation and insights for demonstration
    const mockResult = {
      sql: `SELECT company_name, revenue, growth_rate 
            FROM portfolio_companies 
            WHERE growth_rate > 0.15 
            ORDER BY growth_rate DESC 
            LIMIT 10`,
      data: [
        { company: "TechCorp", revenue: 145, growth: 0.28 },
        { company: "DataSoft", revenue: 89, growth: 0.35 },
        { company: "CloudCo", revenue: 203, growth: 0.22 }
      ],
      insights: [
        "Technology companies show the highest growth rates in your portfolio",
        "3 companies are growing above 25% annually",
        "Average revenue per high-growth company is $145M"
      ],
      chartSuggestions: [
        { type: "bar", title: "Revenue by Growth Rate" },
        { type: "scatter", title: "Revenue vs Growth Correlation" }
      ],
      executionTime: 142
    };

    res.json(mockResult);
  } catch (error) {
    console.error("AI query error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

// Generate insights for data
router.post("/insights", requireAuth, async (req, res) => {
  try {
    const { data, context } = req.body;
    
    const insights = await generateInsights(data, context);
    
    res.json({ insights });
  } catch (error) {
    console.error("Insights generation error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;