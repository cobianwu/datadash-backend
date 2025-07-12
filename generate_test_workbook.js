import XLSX from 'xlsx';

// Create a new workbook
const wb = XLSX.utils.book_new();

// Markets to include
const markets = [
  { name: 'CA_Los_Angeles', state: 'CA', segment: 'Enterprise' },
  { name: 'CA_San_Francisco', state: 'CA', segment: 'Enterprise' },
  { name: 'NY_Manhattan', state: 'NY', segment: 'Enterprise' },
  { name: 'NY_Brooklyn', state: 'NY', segment: 'SMB' },
  { name: 'TX_Houston', state: 'TX', segment: 'Enterprise' },
  { name: 'TX_Dallas', state: 'TX', segment: 'SMB' },
  { name: 'FL_Miami', state: 'FL', segment: 'Consumer' },
  { name: 'FL_Orlando', state: 'FL', segment: 'Consumer' },
  { name: 'IL_Chicago', state: 'IL', segment: 'Enterprise' },
  { name: 'WA_Seattle', state: 'WA', segment: 'Enterprise' }
];

// Generate monthly data for 2023-2024
const months = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 1; month <= 12; month++) {
    if (year === 2024 && month > 6) break; // Up to June 2024
    months.push(`${year}-${month.toString().padStart(2, '0')}`);
  }
}

// Generate data for each market
markets.forEach(market => {
  const data = [];
  
  // Headers
  const headers = [
    'Month', 'Market', 'State', 'Segment',
    'Revenue', 'COGS', 'Gross Profit', 'Gross Margin %',
    'Operating Expenses', 'EBITDA', 'EBITDA Margin %',
    'Customers', 'New Customers', 'Churn Rate %', 'Retention Rate %',
    'Units Sold', 'Average Price', 'Revenue per Customer',
    'Sales Reps', 'Revenue per Rep', 'Technicians', 'Jobs Completed',
    'Productivity (Jobs/Tech)', 'Customer Satisfaction', 'NPS Score'
  ];
  
  // Generate data for each month
  months.forEach((month, idx) => {
    // Base values with some randomization
    const baseRevenue = market.segment === 'Enterprise' ? 500000 : 
                       market.segment === 'SMB' ? 200000 : 100000;
    
    // Add growth trend
    const growthFactor = 1 + (idx * 0.02) + (Math.random() * 0.1 - 0.05);
    const revenue = Math.round(baseRevenue * growthFactor);
    
    // Calculate other metrics
    const cogs = Math.round(revenue * (0.4 + Math.random() * 0.1));
    const grossProfit = revenue - cogs;
    const grossMargin = (grossProfit / revenue) * 100;
    
    const opex = Math.round(revenue * (0.3 + Math.random() * 0.05));
    const ebitda = grossProfit - opex;
    const ebitdaMargin = (ebitda / revenue) * 100;
    
    const customers = Math.round(1000 + idx * 50 + Math.random() * 100);
    const newCustomers = Math.round(customers * 0.1);
    const churnRate = 5 + Math.random() * 3;
    const retentionRate = 100 - churnRate;
    
    const unitsSold = Math.round(revenue / 150 + Math.random() * 100);
    const avgPrice = revenue / unitsSold;
    const revenuePerCustomer = revenue / customers;
    
    const salesReps = 10 + Math.floor(idx / 6);
    const revenuePerRep = revenue / salesReps;
    
    const technicians = 15 + Math.floor(idx / 4);
    const jobsCompleted = technicians * (20 + Math.random() * 10);
    const productivity = jobsCompleted / technicians;
    
    const customerSat = 4.2 + Math.random() * 0.6;
    const nps = 20 + Math.random() * 40;
    
    data.push([
      month,
      market.name,
      market.state,
      market.segment,
      revenue,
      cogs,
      grossProfit,
      grossMargin.toFixed(1),
      opex,
      ebitda,
      ebitdaMargin.toFixed(1),
      customers,
      newCustomers,
      churnRate.toFixed(1),
      retentionRate.toFixed(1),
      unitsSold,
      avgPrice.toFixed(2),
      revenuePerCustomer.toFixed(2),
      salesReps,
      revenuePerRep.toFixed(0),
      technicians,
      Math.round(jobsCompleted),
      productivity.toFixed(1),
      customerSat.toFixed(2),
      nps.toFixed(0)
    ]);
  });
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, market.name);
});

// Add a summary sheet
const summaryData = [
  ['Multi-Market Business Analysis'],
  ['Generated: ' + new Date().toLocaleDateString()],
  [],
  ['Total Markets', markets.length],
  ['States Covered', [...new Set(markets.map(m => m.state))].length],
  ['Segments', [...new Set(markets.map(m => m.segment))].join(', ')],
  ['Time Period', months[0] + ' to ' + months[months.length - 1]],
  [],
  ['Instructions:'],
  ['1. Each tab represents a different market with P&L and operational metrics'],
  ['2. Use the AI to analyze trends across markets, segments, and time periods'],
  ['3. Try queries like:'],
  ['   - "Show me EBITDA margin trends by state"'],
  ['   - "Compare revenue growth across segments"'],
  ['   - "Analyze customer retention by market"'],
  ['   - "Calculate total company revenue by month"'],
  ['   - "Show productivity metrics by state"']
];

const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary', 0);

// Write the file
XLSX.writeFile(wb, 'multi_market_analysis.xlsx');
console.log('Created multi_market_analysis.xlsx with', markets.length, 'market sheets');