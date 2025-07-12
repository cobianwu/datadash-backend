import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';
import XLSX from 'xlsx';

export interface ProcessedFile {
  name: string;
  type: string;
  schema: Record<string, any>;
  rowCount: number;
  data?: any[];
  columns?: string[];
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
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      const results: any[] = [];
      
      Papa.parse(stream, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          const data = result.data as any[];
          const schema = this.inferSchema(data);
          const columns = result.meta.fields || [];
          
          resolve({
            name: path.basename(originalName, path.extname(originalName)),
            type: 'csv',
            schema,
            rowCount: data.length,
            data: data.slice(0, 1000), // Limit to 1000 rows for performance
            columns
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  private static async processExcel(filePath: string, originalName: string): Promise<ProcessedFile> {
    try {
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        blankrows: false 
      }) as any[][];
      
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }
      
      // Extract headers and data
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      // Convert to object format
      const data = dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      const schema = this.inferSchema(data);
      
      return {
        name: path.basename(originalName, path.extname(originalName)),
        type: 'excel',
        schema,
        rowCount: data.length,
        data: data.slice(0, 1000), // Limit to 1000 rows
        columns: headers
      };
    } catch (error) {
      throw new Error(`Excel processing error: ${error}`);
    }
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
