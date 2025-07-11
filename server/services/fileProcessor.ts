import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface ProcessedFile {
  name: string;
  type: string;
  schema: Record<string, any>;
  rowCount: number;
  data?: any[];
}

export class FileProcessor {
  static upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /\.(csv|xlsx?|json|parquet)$/i;
      if (allowedTypes.test(file.originalname)) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV, Excel, JSON, and Parquet files are allowed'));
      }
    }
  });

  static async processFile(filePath: string, originalName: string): Promise<ProcessedFile> {
    const ext = path.extname(originalName).toLowerCase();
    
    switch (ext) {
      case '.csv':
        return this.processCSV(filePath, originalName);
      case '.xlsx':
      case '.xls':
        return this.processExcel(filePath, originalName);
      case '.json':
        return this.processJSON(filePath, originalName);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  private static async processCSV(filePath: string, originalName: string): Promise<ProcessedFile> {
    // Mock implementation - would use Papa Parse in real scenario
    const schema = {
      'Company': { type: 'string', nullable: true },
      'Revenue': { type: 'number', nullable: true },
      'Sector': { type: 'string', nullable: true }
    };
    
    return {
      name: path.basename(originalName, path.extname(originalName)),
      type: 'csv',
      schema,
      rowCount: 1000,
      data: []
    };
  }

  private static async processExcel(filePath: string, originalName: string): Promise<ProcessedFile> {
    // Mock implementation - would use XLSX in real scenario
    const schema = {
      'Company': { type: 'string', nullable: true },
      'Revenue': { type: 'number', nullable: true },
      'Sector': { type: 'string', nullable: true }
    };
    
    return {
      name: path.basename(originalName, path.extname(originalName)),
      type: 'excel',
      schema,
      rowCount: 500,
      data: []
    };
  }

  private static async processJSON(filePath: string, originalName: string): Promise<ProcessedFile> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      const arrayData = Array.isArray(data) ? data : [data];
      const schema = this.inferSchema(arrayData);
      
      return {
        name: path.basename(originalName, path.extname(originalName)),
        type: 'json',
        schema,
        rowCount: arrayData.length,
        data: arrayData.slice(0, 100)
      };
    } catch (error) {
      throw new Error(`Failed to process JSON file: ${error}`);
    }
  }

  private static inferSchema(data: any[]): Record<string, any> {
    if (!data || data.length === 0) return {};
    
    const schema: Record<string, any> = {};
    const sample = data[0];
    
    Object.keys(sample).forEach(key => {
      const value = sample[key];
      schema[key] = {
        type: this.inferType(value),
        nullable: true
      };
    });
    
    return schema;
  }

  private static inferType(value: any): string {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      if (!isNaN(Date.parse(value))) return 'date';
      if (!isNaN(Number(value))) return 'number';
    }
    return 'string';
  }
}
