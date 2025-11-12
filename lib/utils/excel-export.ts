import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import type { Transaction, Budget, Asset } from '@/types';

export interface ExportOptions {
  dataTypes: ('transactions' | 'budgets' | 'portfolio' | 'forecasts')[];
  startDate?: Date;
  endDate?: Date;
}

export interface ForecastData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  projectedData: any;
  parameters: any;
  createdAt: Date;
}

export async function generateExcelExport(
  data: {
    transactions?: Transaction[];
    budgets?: Budget[];
    assets?: Asset[];
    forecasts?: ForecastData[];
  },
  options: ExportOptions
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = 'Finance Tracker';
  workbook.created = new Date();
  
  // Export transactions
  if (options.dataTypes.includes('transactions') && data.transactions) {
    addTransactionsSheet(workbook, data.transactions);
  }
  
  // Export budgets
  if (options.dataTypes.includes('budgets') && data.budgets) {
    addBudgetsSheet(workbook, data.budgets);
  }
  
  // Export portfolio
  if (options.dataTypes.includes('portfolio') && data.assets) {
    addPortfolioSheet(workbook, data.assets);
  }
  
  // Export forecasts
  if (options.dataTypes.includes('forecasts') && data.forecasts) {
    addForecastsSheet(workbook, data.forecasts);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function addTransactionsSheet(workbook: ExcelJS.Workbook, transactions: Transaction[]) {
  const sheet = workbook.addWorksheet('Transactions');
  
  // Add headers
  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'description', width: 40 },
  ];
  
  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  
  // Add data
  transactions.forEach((transaction) => {
    sheet.addRow({
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      type: transaction.type,
      category: transaction.category?.name || 'Uncategorized',
      amount: transaction.amount,
      description: transaction.description,
    });
  });
  
  // Format amount column as currency
  sheet.getColumn('amount').numFmt = '#,##0.00';
  
  // Add totals
  const lastRow = sheet.rowCount + 2;
  sheet.getCell(`A${lastRow}`).value = 'Total Income:';
  sheet.getCell(`A${lastRow}`).font = { bold: true };
  sheet.getCell(`D${lastRow}`).value = {
    formula: `SUMIF(B2:B${sheet.rowCount},"income",D2:D${sheet.rowCount})`,
  };
  
  sheet.getCell(`A${lastRow + 1}`).value = 'Total Expenses:';
  sheet.getCell(`A${lastRow + 1}`).font = { bold: true };
  sheet.getCell(`D${lastRow + 1}`).value = {
    formula: `SUMIF(B2:B${sheet.rowCount},"expense",D2:D${sheet.rowCount})`,
  };
  
  sheet.getCell(`A${lastRow + 2}`).value = 'Net Balance:';
  sheet.getCell(`A${lastRow + 2}`).font = { bold: true };
  sheet.getCell(`D${lastRow + 2}`).value = {
    formula: `D${lastRow}-D${lastRow + 1}`,
  };
}

function addBudgetsSheet(workbook: ExcelJS.Workbook, budgets: Budget[]) {
  const sheet = workbook.addWorksheet('Budgets');
  
  // Add headers
  sheet.columns = [
    { header: 'Budget Name', key: 'budgetName', width: 20 },
    { header: 'Period', key: 'period', width: 12 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Allocated', key: 'allocated', width: 15 },
    { header: 'Spent', key: 'spent', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
  ];
  
  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  
  // Add data
  budgets.forEach((budget) => {
    budget.categories.forEach((category, index) => {
      sheet.addRow({
        budgetName: index === 0 ? budget.name : '',
        period: index === 0 ? budget.period : '',
        totalAmount: index === 0 ? budget.totalAmount : '',
        category: category.name,
        allocated: category.allocatedAmount,
        spent: category.spentAmount || 0,
        remaining: category.allocatedAmount - (category.spentAmount || 0),
      });
    });
    
    // Add empty row between budgets
    sheet.addRow({});
  });
  
  // Format currency columns
  ['totalAmount', 'allocated', 'spent', 'remaining'].forEach((col) => {
    sheet.getColumn(col).numFmt = '#,##0.00';
  });
}

function addPortfolioSheet(workbook: ExcelJS.Workbook, assets: Asset[]) {
  const sheet = workbook.addWorksheet('Portfolio');
  
  // Add headers
  sheet.columns = [
    { header: 'Platform', key: 'platform', width: 15 },
    { header: 'Asset Type', key: 'assetType', width: 12 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Ticker', key: 'ticker', width: 10 },
    { header: 'Units', key: 'units', width: 12 },
    { header: 'Buy Price', key: 'buyPrice', width: 12 },
    { header: 'Current Price', key: 'currentPrice', width: 12 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
    { header: 'Cost Basis', key: 'costBasis', width: 15 },
    { header: 'Current Value', key: 'currentValue', width: 15 },
    { header: 'Unrealized Gain/Loss', key: 'unrealizedGain', width: 18 },
    { header: 'Gain %', key: 'gainPercent', width: 10 },
  ];
  
  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  
  // Add data
  assets.forEach((asset) => {
    const costBasis = asset.units * asset.buyPrice;
    const currentValue = asset.currentPrice ? asset.units * asset.currentPrice : costBasis;
    const unrealizedGain = currentValue - costBasis;
    const gainPercent = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
    
    sheet.addRow({
      platform: asset.platform,
      assetType: asset.assetType,
      name: asset.name,
      ticker: asset.ticker || '',
      units: asset.units,
      buyPrice: asset.buyPrice,
      currentPrice: asset.currentPrice || asset.buyPrice,
      currency: asset.currency,
      purchaseDate: format(new Date(asset.purchaseDate), 'yyyy-MM-dd'),
      costBasis,
      currentValue,
      unrealizedGain,
      gainPercent,
    });
  });
  
  // Format number columns
  ['units', 'buyPrice', 'currentPrice', 'costBasis', 'currentValue', 'unrealizedGain'].forEach((col) => {
    sheet.getColumn(col).numFmt = '#,##0.00';
  });
  sheet.getColumn('gainPercent').numFmt = '0.00%';
  
  // Add totals
  const lastRow = sheet.rowCount + 2;
  sheet.getCell(`A${lastRow}`).value = 'Total Portfolio Value:';
  sheet.getCell(`A${lastRow}`).font = { bold: true };
  sheet.getCell(`K${lastRow}`).value = {
    formula: `SUM(K2:K${sheet.rowCount})`,
  };
  
  sheet.getCell(`A${lastRow + 1}`).value = 'Total Unrealized Gain/Loss:';
  sheet.getCell(`A${lastRow + 1}`).font = { bold: true };
  sheet.getCell(`L${lastRow + 1}`).value = {
    formula: `SUM(L2:L${sheet.rowCount})`,
  };
}

function addForecastsSheet(workbook: ExcelJS.Workbook, forecasts: ForecastData[]) {
  forecasts.forEach((forecast, index) => {
    const sheet = workbook.addWorksheet(`Forecast ${index + 1}`);
    
    // Add forecast info
    sheet.addRow(['Forecast Name:', forecast.name]);
    sheet.addRow(['Start Date:', format(new Date(forecast.startDate), 'yyyy-MM-dd')]);
    sheet.addRow(['End Date:', format(new Date(forecast.endDate), 'yyyy-MM-dd')]);
    sheet.addRow(['Created:', format(new Date(forecast.createdAt), 'yyyy-MM-dd HH:mm')]);
    sheet.addRow([]);
    
    // Add projection headers
    sheet.addRow(['Date', 'Projected Income', 'Projected Expenses', 'Projected Balance']);
    sheet.getRow(6).font = { bold: true };
    sheet.getRow(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    // Add projection data
    if (forecast.projectedData && Array.isArray(forecast.projectedData)) {
      forecast.projectedData.forEach((projection: any) => {
        sheet.addRow([
          projection.date,
          projection.projectedIncome || 0,
          projection.projectedExpenses || 0,
          projection.projectedBalance || 0,
        ]);
      });
    }
    
    // Format columns
    sheet.getColumn(1).width = 15;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 18;
    
    ['B', 'C', 'D'].forEach((col) => {
      sheet.getColumn(col).numFmt = '#,##0.00';
    });
  });
}
