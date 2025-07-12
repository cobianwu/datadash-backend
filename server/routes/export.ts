import { Router } from 'express';
import { requireAuth } from '../auth';
import { ExportService } from '../services/exportService';

export const exportRouter = Router();

// Export to Excel
exportRouter.post('/excel', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, includeAnalysis } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, columns, analysis } = uploadedData[dataSourceId];
    const metadata = includeAnalysis ? {
      insights: analysis?.insights || [],
      summary: analysis?.summary || {}
    } : undefined;
    
    const buffer = await ExportService.exportToExcel(data, columns, metadata);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=dataflow_export.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
});

// Export to CSV
exportRouter.post('/csv', requireAuth, async (req, res) => {
  try {
    const { dataSourceId } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, columns } = uploadedData[dataSourceId];
    const csv = await ExportService.exportToCSV(data, columns);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dataflow_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export to PDF
exportRouter.post('/pdf', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, includeAnalysis } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, columns, analysis } = uploadedData[dataSourceId];
    const metadata = includeAnalysis ? {
      insights: analysis?.insights || [],
      summary: analysis?.summary || {}
    } : undefined;
    
    const buffer = await ExportService.exportToPDF(data, columns, metadata);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=dataflow_report.pdf');
    res.send(buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export to PDF' });
  }
});

// Export to PowerPoint (returns JSON structure)
exportRouter.post('/powerpoint', requireAuth, async (req, res) => {
  try {
    const { dataSourceId, charts, insights } = req.body;
    const uploadedData = (global as any).uploadedData || {};
    
    if (!dataSourceId || !uploadedData[dataSourceId]) {
      return res.status(400).json({ error: 'No data source found' });
    }
    
    const { data, columns } = uploadedData[dataSourceId];
    const presentation = await ExportService.exportToPowerPoint(
      data, 
      columns, 
      charts, 
      insights || uploadedData[dataSourceId].analysis?.insights
    );
    
    res.json(presentation);
  } catch (error) {
    console.error('PowerPoint export error:', error);
    res.status(500).json({ error: 'Failed to export to PowerPoint' });
  }
});