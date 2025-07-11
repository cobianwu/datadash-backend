export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  duration: number;
}

export class SQLParser {
  static async executeQuery(sql: string, warehouseId?: number): Promise<QueryResult> {
    const startTime = Date.now();
    
    // Mock SQL execution - in real implementation this would connect to actual data warehouse
    const mockResult = this.generateMockResult(sql);
    const duration = Date.now() - startTime;
    
    return {
      ...mockResult,
      duration
    };
  }

  private static generateMockResult(sql: string): Omit<QueryResult, 'duration'> {
    // Parse basic SQL to determine structure
    const sqlUpper = sql.toUpperCase();
    
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('REVENUE')) {
      return {
        columns: ['company', 'revenue', 'sector'],
        rows: [
          ['TechCorp', 45200000, 'Technology'],
          ['GreenSolutions', 38900000, 'Energy'],
          ['FinanceInc', 52100000, 'Financial']
        ],
        rowCount: 3
      };
    }
    
    if (sqlUpper.includes('SELECT') && sqlUpper.includes('COUNT')) {
      return {
        columns: ['count'],
        rows: [['47']],
        rowCount: 1
      };
    }
    
    // Default mock result
    return {
      columns: ['result'],
      rows: [['Query executed successfully']],
      rowCount: 1
    };
  }

  static validateSQL(sql: string): { valid: boolean; error?: string } {
    // Basic SQL validation
    const forbidden = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER'];
    const sqlUpper = sql.toUpperCase();
    
    for (const keyword of forbidden) {
      if (sqlUpper.includes(keyword)) {
        return {
          valid: false,
          error: `${keyword} statements are not allowed for security reasons`
        };
      }
    }
    
    if (!sqlUpper.includes('SELECT')) {
      return {
        valid: false,
        error: 'Only SELECT statements are allowed'
      };
    }
    
    return { valid: true };
  }
}
