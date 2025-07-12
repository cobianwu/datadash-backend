let duckdb: any;
try {
  duckdb = require('duckdb');
} catch (error) {
  console.log('DuckDB not available');
}

export class DuckDBService {
  private static instance: DuckDBService;
  private db: any;
  private connection: any;
  private isAvailable: boolean = false;

  private constructor() {
    if (duckdb) {
      try {
        this.db = new duckdb.Database(':memory:');
        this.connection = this.db.connect();
        this.isAvailable = true;
      } catch (error) {
        console.error('Failed to initialize DuckDB:', error);
        this.isAvailable = false;
      }
    }
  }

  static getInstance(): DuckDBService {
    if (!DuckDBService.instance) {
      DuckDBService.instance = new DuckDBService();
    }
    return DuckDBService.instance;
  }

  async executeQuery(query: string): Promise<any[]> {
    if (!this.isAvailable) {
      throw new Error('DuckDB is not available');
    }
    
    return new Promise((resolve, reject) => {
      this.connection.all(query, (err: Error | null, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async createTableFromData(tableName: string, data: any[], columns: string[]): Promise<void> {
    if (!data || data.length === 0) {
      throw new Error('No data provided');
    }

    // Infer column types from first row
    const columnDefs = columns.map(col => {
      const value = data[0][col];
      let type = 'VARCHAR';
      
      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'INTEGER' : 'DOUBLE';
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        type = 'TIMESTAMP';
      } else if (typeof value === 'boolean') {
        type = 'BOOLEAN';
      }
      
      return `"${col}" ${type}`;
    });

    // Create table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columnDefs.join(', ')}
      )
    `;
    
    await this.executeQuery(createTableQuery);

    // Insert data in batches
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = batch.map(row => {
        const vals = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return val;
        });
        return `(${vals.join(', ')})`;
      }).join(', ');

      const insertQuery = `
        INSERT INTO ${tableName} VALUES ${values}
      `;
      
      await this.executeQuery(insertQuery);
    }
  }

  async performAdvancedAnalytics(tableName: string): Promise<any> {
    const results: any = {};

    // Get table statistics
    results.tableStats = await this.executeQuery(`
      SELECT COUNT(*) as row_count FROM ${tableName}
    `);

    // Get column statistics for numeric columns
    const columns = await this.executeQuery(`
      PRAGMA table_info('${tableName}')
    `);

    const numericColumns = columns.filter(col => 
      col.type === 'INTEGER' || col.type === 'DOUBLE'
    );

    results.columnStats = {};
    for (const col of numericColumns) {
      const stats = await this.executeQuery(`
        SELECT 
          MIN("${col.name}") as min,
          MAX("${col.name}") as max,
          AVG("${col.name}") as avg,
          MEDIAN("${col.name}") as median,
          STDDEV("${col.name}") as stddev,
          VAR_POP("${col.name}") as variance,
          PERCENTILE_DISC(0.25) WITHIN GROUP (ORDER BY "${col.name}") as q1,
          PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY "${col.name}") as q3
        FROM ${tableName}
        WHERE "${col.name}" IS NOT NULL
      `);
      results.columnStats[col.name] = stats[0];
    }

    // Perform correlation analysis
    if (numericColumns.length >= 2) {
      results.correlations = {};
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i].name;
          const col2 = numericColumns[j].name;
          const corr = await this.executeQuery(`
            SELECT CORR("${col1}", "${col2}") as correlation
            FROM ${tableName}
            WHERE "${col1}" IS NOT NULL AND "${col2}" IS NOT NULL
          `);
          results.correlations[`${col1}_${col2}`] = corr[0].correlation;
        }
      }
    }

    return results;
  }

  async runSQLQuery(query: string, dataSourceId: number, data: any[]): Promise<any> {
    try {
      // Create temporary table for the data
      const tableName = `data_source_${dataSourceId}`;
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        await this.createTableFromData(tableName, data, columns);
      }

      // Execute the query
      let modifiedQuery = query;
      // Replace common table references
      modifiedQuery = modifiedQuery.replace(/FROM\s+data/gi, `FROM ${tableName}`);
      modifiedQuery = modifiedQuery.replace(/FROM\s+table/gi, `FROM ${tableName}`);

      const result = await this.executeQuery(modifiedQuery);
      
      // Clean up
      await this.executeQuery(`DROP TABLE IF EXISTS ${tableName}`);
      
      return result;
    } catch (error) {
      console.error('DuckDB query error:', error);
      throw error;
    }
  }

  async performWindowAnalytics(tableName: string, orderByColumn: string, partitionByColumn?: string): Promise<any[]> {
    let query = `
      SELECT *,
        ROW_NUMBER() OVER (${partitionByColumn ? `PARTITION BY "${partitionByColumn}"` : ''} ORDER BY "${orderByColumn}") as row_num,
        RANK() OVER (${partitionByColumn ? `PARTITION BY "${partitionByColumn}"` : ''} ORDER BY "${orderByColumn}") as rank,
        DENSE_RANK() OVER (${partitionByColumn ? `PARTITION BY "${partitionByColumn}"` : ''} ORDER BY "${orderByColumn}") as dense_rank,
        LAG("${orderByColumn}") OVER (${partitionByColumn ? `PARTITION BY "${partitionByColumn}"` : ''} ORDER BY "${orderByColumn}") as prev_value,
        LEAD("${orderByColumn}") OVER (${partitionByColumn ? `PARTITION BY "${partitionByColumn}"` : ''} ORDER BY "${orderByColumn}") as next_value
      FROM ${tableName}
      ORDER BY ${partitionByColumn ? `"${partitionByColumn}",` : ''} "${orderByColumn}"
    `;

    return await this.executeQuery(query);
  }

  async performPivotAnalysis(
    tableName: string, 
    rowColumn: string, 
    columnColumn: string, 
    valueColumn: string,
    aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN' = 'SUM'
  ): Promise<any[]> {
    // First get unique values for pivot columns
    const uniqueValues = await this.executeQuery(`
      SELECT DISTINCT "${columnColumn}" FROM ${tableName} ORDER BY "${columnColumn}"
    `);

    const pivotColumns = uniqueValues.map(row => row[columnColumn]);

    // Build dynamic pivot query
    const pivotSelections = pivotColumns.map(val => 
      `${aggregation}(CASE WHEN "${columnColumn}" = '${val}' THEN "${valueColumn}" END) as "${val}"`
    ).join(', ');

    const pivotQuery = `
      SELECT 
        "${rowColumn}",
        ${pivotSelections}
      FROM ${tableName}
      GROUP BY "${rowColumn}"
      ORDER BY "${rowColumn}"
    `;

    return await this.executeQuery(pivotQuery);
  }

  async close(): Promise<void> {
    if (!this.isAvailable) return;
    
    return new Promise((resolve, reject) => {
      this.connection.close((err: Error | null) => {
        if (err) reject(err);
        else {
          this.db.close((err: Error | null) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  }
  
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }
}