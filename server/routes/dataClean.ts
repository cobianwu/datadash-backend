import { Router } from "express";
import { requireAuth } from "../auth";
import { storage } from "../storage";
import { DataTransformer } from "../services/dataTransformer";

export const dataCleanRouter = Router();

// Clean data source
dataCleanRouter.post("/data-sources/:id/clean", requireAuth, async (req, res) => {
  try {
    const dataSourceId = parseInt(req.params.id);
    const { options } = req.body;
    
    // Get current data
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: "Data source not found" });
    }

    let { data, columns } = storedData;
    let cleanedRows = 0;
    let fixedIssues = 0;

    // Fill missing values
    if (options.fillMissing) {
      data = data.map(row => {
        const newRow = { ...row };
        let rowFixed = false;
        
        columns.forEach(col => {
          if (!newRow[col] || newRow[col] === '') {
            // Use smart defaults based on column type
            const otherValues = data.map(r => r[col]).filter(v => v !== null && v !== '');
            if (otherValues.length > 0) {
              const isNumeric = otherValues.every(v => !isNaN(parseFloat(v)));
              if (isNumeric) {
                // Use mean for numeric columns
                const mean = otherValues.reduce((a, b) => a + parseFloat(b), 0) / otherValues.length;
                newRow[col] = mean.toFixed(2);
              } else {
                // Use mode for categorical columns
                const counts = otherValues.reduce((acc, val) => {
                  acc[val] = (acc[val] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                newRow[col] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
              }
              rowFixed = true;
              fixedIssues++;
            }
          }
        });
        
        if (rowFixed) cleanedRows++;
        return newRow;
      });
    }

    // Remove outliers
    if (options.removeOutliers) {
      columns.forEach(col => {
        const numericValues = data
          .map(row => parseFloat(row[col]))
          .filter(val => !isNaN(val));
        
        if (numericValues.length > 0) {
          const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          const stdDev = Math.sqrt(
            numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
          );
          
          // Remove rows with values more than 3 standard deviations from mean
          const originalLength = data.length;
          data = data.filter(row => {
            const val = parseFloat(row[col]);
            if (isNaN(val)) return true;
            return Math.abs(val - mean) <= 3 * stdDev;
          });
          
          const removed = originalLength - data.length;
          if (removed > 0) {
            fixedIssues += removed;
          }
        }
      });
    }

    // Standardize data types
    if (options.standardizeTypes) {
      data = data.map(row => {
        const newRow = { ...row };
        
        columns.forEach(col => {
          const val = newRow[col];
          if (val !== null && val !== undefined && val !== '') {
            // Try to parse as number if it looks numeric
            if (/^-?\d+\.?\d*$/.test(String(val))) {
              newRow[col] = parseFloat(val);
            } else if (/^\d{4}-\d{2}-\d{2}/.test(String(val))) {
              // Keep date strings as is
              newRow[col] = String(val);
            } else {
              // Ensure it's a string
              newRow[col] = String(val).trim();
            }
          }
        });
        
        return newRow;
      });
      fixedIssues += data.length;
    }

    // Remove duplicates
    if (options.removeDuplicates) {
      const seen = new Set();
      const originalLength = data.length;
      
      data = data.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      const removed = originalLength - data.length;
      if (removed > 0) {
        fixedIssues += removed;
      }
    }

    // Normalize text
    if (options.normalizeText) {
      data = data.map(row => {
        const newRow = { ...row };
        
        columns.forEach(col => {
          const val = newRow[col];
          if (typeof val === 'string') {
            // Trim whitespace and standardize casing
            newRow[col] = val.trim();
            
            // Capitalize first letter if it looks like a name or category
            if (col.toLowerCase().includes('name') || col.toLowerCase().includes('category')) {
              newRow[col] = newRow[col].split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
          }
        });
        
        return newRow;
      });
    }

    // Run quality analysis on cleaned data
    const newQuality = DataTransformer.analyzeDataQuality(data);

    // Store cleaned data
    await storage.storeDataSourceData(dataSourceId, data, columns, storedData.analysis, newQuality);

    // Update data source metadata
    await storage.updateDataSource(dataSourceId, {
      rowCount: data.length,
      lastProcessed: new Date()
    });

    res.json({
      cleanedRows: data.length,
      fixedIssues,
      dataQuality: newQuality
    });
  } catch (error) {
    console.error("Data cleaning error:", error);
    res.status(500).json({ message: "Failed to clean data" });
  }
});

// Get data quality report
dataCleanRouter.get("/data-sources/:id/quality", requireAuth, async (req, res) => {
  try {
    const dataSourceId = parseInt(req.params.id);
    
    const storedData = await storage.getDataSourceData(dataSourceId);
    if (!storedData) {
      return res.status(404).json({ message: "Data source not found" });
    }

    const quality = storedData.dataQuality || DataTransformer.analyzeDataQuality(storedData.data);
    
    res.json(quality);
  } catch (error) {
    console.error("Quality check error:", error);
    res.status(500).json({ message: "Failed to check data quality" });
  }
});