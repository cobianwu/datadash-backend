import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, Send, Copy, Database, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIResponse {
  sql: string;
  data: any[];
  insights: string[];
  chartSuggestions: Array<{ type: string; title: string }>;
  executionTime: number;
}

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState<Array<{ query: string; response: AIResponse }>>([]);
  const { toast } = useToast();

  const aiQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Query failed");
      return response.json();
    },
    onSuccess: (data, originalQuery) => {
      setResponses(prev => [...prev, { query: originalQuery, response: data }]);
      setQuery("");
    },
    onError: () => {
      toast({
        title: "Query failed",
        description: "There was an error processing your query",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      aiQueryMutation.mutate(query);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied"
    });
  };

  const sampleQueries = [
    "Show me revenue growth by quarter for the last 2 years",
    "Which customers have the highest lifetime value?",
    "Analyze churn rate trends by customer segment",
    "Calculate the average deal size by sales rep",
    "Find products with declining sales momentum"
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Data Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions in natural language and get instant insights
          </p>
        </div>

        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Describe what you want to analyze in plain English
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me the top 10 customers by revenue this year"
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Try: {sampleQueries[Math.floor(Math.random() * sampleQueries.length)]}
                </div>
                <Button type="submit" disabled={!query.trim() || aiQueryMutation.isPending}>
                  <Send className="mr-2 h-4 w-4" />
                  {aiQueryMutation.isPending ? "Analyzing..." : "Send"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sample Queries */}
        {responses.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sample Queries</CardTitle>
              <CardDescription>Click any query below to try it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {sampleQueries.map((sample, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4"
                    onClick={() => setQuery(sample)}
                  >
                    {sample}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responses */}
        <div className="space-y-6">
          {responses.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Query {idx + 1}</CardTitle>
                    <CardDescription className="mt-1">{item.query}</CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.response.executionTime}ms
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SQL Query */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Generated SQL
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.response.sql)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                    <code>{item.response.sql}</code>
                  </pre>
                </div>

                {/* Data Preview */}
                {item.response.data && item.response.data.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Results Preview</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr>
                            {Object.keys(item.response.data[0]).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {item.response.data.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {Object.values(row).map((value: any, colIdx) => (
                                <td key={colIdx} className="px-4 py-2 text-sm">
                                  {typeof value === 'number' 
                                    ? value.toLocaleString() 
                                    : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {item.response.data.length > 5 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ... and {item.response.data.length - 5} more rows
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {item.response.insights && item.response.insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Insights
                    </h4>
                    <ul className="space-y-1">
                      {item.response.insights.map((insight, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chart Suggestions */}
                {item.response.chartSuggestions && item.response.chartSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Visualization Suggestions
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {item.response.chartSuggestions.map((chart, i) => (
                        <Button key={i} variant="outline" size="sm">
                          Create {chart.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}