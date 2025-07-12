import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Brain, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Database,
  Lightbulb,
  Zap,
  Target
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface QueryResult {
  sql: string;
  data: any[];
  insights: string[];
  chartSuggestions: any[];
  executionTime: number;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  results?: QueryResult;
}

interface QueryInterfaceProps {
  dataSourceId: string;
}

export function QueryInterface({ dataSourceId }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! I'm your AI data analyst. I'm ready to analyze your uploaded data. Ask me questions like 'Show me revenue trends' or 'What are the top performing products?'",
      timestamp: new Date()
    }
  ]);

  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      return apiRequest("POST", "/api/ai/query", { 
        query: question,
        dataSourceId: parseInt(dataSourceId)
      });
    },
    onSuccess: (result) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: "I've analyzed your query and generated insights from your data:",
        timestamp: new Date(),
        results: result
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Process query
    queryMutation.mutate(query);
    setQuery("");
  };

  const suggestedQueries = [
    "Show me companies with highest revenue growth rates",
    "What's the correlation between EBITDA margin and company size?",
    "Which sectors have the best returns in our portfolio?",
    "Compare debt-to-equity ratios across portfolio companies",
    "Identify underperforming assets requiring attention",
    "Show me trends in operating margins over the last 3 years"
  ];

  const quickInsights = [
    { icon: TrendingUp, title: "Growth Leaders", description: "Companies with >25% revenue growth" },
    { icon: Target, title: "Margin Expansion", description: "EBITDA margin improvement >5%" },
    { icon: BarChart3, title: "Scale Opportunities", description: "Sub-scale assets with potential" },
    { icon: Zap, title: "Quick Wins", description: "Operational improvements ready to deploy" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Natural Language Analytics</h2>
        <Badge variant="secondary">AI-Powered</Badge>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="suggestions">Quick Queries</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.results && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium">Generated SQL:</div>
                          <code className="text-xs bg-black bg-opacity-20 p-2 rounded block">
                            {message.results.sql}
                          </code>
                          <div className="text-xs font-medium">Key Insights:</div>
                          <ul className="text-xs space-y-1">
                            {message.results.insights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {queryMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Analyzing your query...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your data... e.g., 'Show me top performers by ROIC'"
              className="flex-1"
              disabled={queryMutation.isPending}
            />
            <Button type="submit" disabled={queryMutation.isPending || !query.trim()}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedQueries.map((suggestion, index) => (
              <Card key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{suggestion}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-0 text-blue-600"
                        onClick={() => {
                          setQuery(suggestion);
                          // Switch to chat tab
                          document.querySelector('[value="chat"]')?.click();
                        }}
                      >
                        Use this query →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <insight.icon className="h-5 w-5 text-blue-600" />
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {insight.description}
                  </p>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}