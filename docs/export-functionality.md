# Data Export Functionality

## Overview

The Finance Tracker application includes comprehensive data export functionality that allows users to export their financial data to Excel format (.xlsx). This feature supports exporting transactions, budgets, portfolio assets, and forecasts with optional date range filtering.

## Features

### Supported Data Types

1. **Transactions**
   - Date, type (income/expense), category, amount, description
   - Automatic totals calculation (total income, total expenses, net balance)
   - Formatted as currency

2. **Budgets**
   - Budget name, period, total amount
   - Category breakdown with allocated, spent, and remaining amounts
   - Grouped by budget with clear separation

3. **Portfolio**
   - Platform, asset type, name, ticker
   - Units, buy price, current price, currency
   - Purchase date
   - Calculated cost basis, current value, unrealized gain/loss, gain percentage
   - Total portfolio value and total unrealized gain/loss

4. **Forecasts**
   - Forecast metadata (name, start date, end date, created date)
   - Projected income, expenses, and balance over time
   - Each forecast in a separate worksheet

### Date Range Filtering

Users can optionally specify a date range to filter the exported data:
- **Transactions**: Filtered by transaction date
- **Portfolio**: Filtered by purchase date
- **Forecasts**: Filtered by creation date
- **Budgets**: No date filtering (all budgets exported)

### Export Progress Indicator

The export dialog includes a visual progress indicator that shows:
- Progress percentage (0-100%)
- Progress bar with smooth animation
- Loading state during export

## Usage

### Using the Export Button

The `ExportButton` component can be added to any page:

```tsx
import ExportButton from '@/components/ExportButton';

export default function MyPage() {
  return (
    <div>
      <ExportButton variant="outline" size="md" />
    </div>
  );
}
```

### Export Dialog

The export dialog provides:
1. **Data Type Selection**: Checkboxes to select which data types to export
2. **Date Range**: Optional start and end date inputs
3. **Progress Indicator**: Visual feedback during export
4. **Export Button**: Triggers the export and downloads the file

### API Endpoint

The export functionality is powered by the `/api/export` endpoint:

**Request:**
```json
POST /api/export
{
  "dataTypes": ["transactions", "budgets", "portfolio", "forecasts"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download with name: `finance-tracker-export-YYYY-MM-DD.xlsx`

## Technical Implementation

### Dependencies

- **ExcelJS**: Library for creating Excel files
- **date-fns**: Date formatting utilities

### File Structure

```
lib/utils/excel-export.ts       # Excel generation utility
app/api/export/route.ts          # API endpoint
components/ExportDialog.tsx      # Export dialog component
components/ExportButton.tsx      # Export button component
components/ui/dialog.tsx         # Dialog UI component
components/ui/checkbox.tsx       # Checkbox UI component
```

### Excel Formatting

- **Headers**: Bold text with gray background
- **Currency Columns**: Formatted with `#,##0.00` number format
- **Percentage Columns**: Formatted with `0.00%` number format
- **Formulas**: Used for totals and calculations
- **Column Widths**: Auto-sized for readability

### Security

- User authentication required (NextAuth session)
- Row-level security (users can only export their own data)
- Input validation for date ranges and data types

## Error Handling

The export functionality includes comprehensive error handling:

1. **Validation Errors**
   - At least one data type must be selected
   - Invalid date ranges are prevented

2. **API Errors**
   - Unauthorized access (401)
   - User not found (404)
   - Server errors (500)
   - User-friendly error messages displayed

3. **Client-Side Errors**
   - Network failures
   - File download issues
   - Progress indicator reset on error

## Future Enhancements

Potential improvements for the export functionality:

1. **Additional Formats**: Support for CSV, PDF exports
2. **Scheduled Exports**: Automatic periodic exports via email
3. **Custom Templates**: User-defined export templates
4. **Batch Exports**: Export multiple date ranges at once
5. **Cloud Storage**: Direct export to Google Drive, Dropbox, etc.
6. **Export History**: Track previous exports
7. **Partial Exports**: Select specific categories or assets
8. **Charts in Excel**: Include visual charts in exported files

## Testing

To test the export functionality:

1. Create sample data (transactions, budgets, assets, forecasts)
2. Click the "Export Data" button
3. Select data types to export
4. Optionally set date range
5. Click "Export to Excel"
6. Verify the downloaded file contains correct data
7. Check Excel formatting and formulas

## Troubleshooting

### Export Button Not Appearing
- Ensure the component is imported correctly
- Check that the user is authenticated

### Empty Export File
- Verify that data exists for the selected types
- Check date range filters aren't too restrictive

### Download Fails
- Check browser download settings
- Verify API endpoint is accessible
- Check console for error messages

### Incorrect Data
- Verify database queries in API endpoint
- Check data transformations in excel-export.ts
- Ensure date filtering logic is correct
