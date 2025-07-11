import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "test-key"
});

export async function processAIQuery(query: string, context?: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business intelligence assistant. Help users analyze data and create insights. Provide clear, actionable recommendations based on the data context provided."
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || "No response generated";
  } catch (error) {
    console.error("AI processing error:", error);
    return "AI processing temporarily unavailable. Please try again later.";
  }
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
          content: "Generate chart configuration in JSON format based on the description. Return a valid JSON object with type, data, and config properties. Use chart types like 'bar', 'line', 'pie', 'scatter', 'area', 'waterfall', 'treemap', etc."
        },
        {
          role: "user",
          content: `Description: ${description}\nData context: ${JSON.stringify(data)}`
        }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Chart generation error:", error);
    return { type: "bar", data: [], config: {} };
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
