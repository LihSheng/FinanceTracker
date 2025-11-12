# Requirements Document

## Introduction

This document outlines the requirements for a comprehensive Personal Finance & Portfolio Tracker web application that enables users to manage their budget, track investments across multiple platforms and currencies, monitor their financial status through visual analytics, and forecast future financial positions. The application will provide tools for salary distribution planning, portfolio management, goal tracking, multi-currency support, real-time financial statistics with charts, and exportable forecasting capabilities to Excel format.

## Requirements

### Requirement 1: User Budget Management

**User Story:** As a user, I want to create and manage budgets for my salary distribution, so that I can plan how my income is allocated across different categories.

#### Acceptance Criteria

1. WHEN a user logs into the application THEN the system SHALL display their current budget overview
2. WHEN a user creates a new budget THEN the system SHALL allow them to input their total salary amount
3. WHEN a user defines budget categories THEN the system SHALL allow them to allocate specific amounts or percentages to each category
4. WHEN a user allocates funds across categories THEN the system SHALL validate that the total allocation does not exceed 100% of their salary
5. WHEN a user saves a budget THEN the system SHALL persist the budget data and display a confirmation message
6. WHEN a user edits an existing budget THEN the system SHALL load the current values and allow modifications
7. WHEN a user deletes a budget category THEN the system SHALL prompt for confirmation before removing the category

### Requirement 2: Financial Transaction Tracking

**User Story:** As a user, I want to record my income and expenses, so that I can track my actual spending against my budget.

#### Acceptance Criteria

1. WHEN a user adds a transaction THEN the system SHALL require a date, amount, category, and description
2. WHEN a user categorizes a transaction THEN the system SHALL associate it with a budget category
3. WHEN a user submits a transaction THEN the system SHALL update the relevant budget category balance
4. WHEN a user views their transactions THEN the system SHALL display them in a sortable and filterable list
5. WHEN a user edits a transaction THEN the system SHALL recalculate the affected budget category balances
6. WHEN a user deletes a transaction THEN the system SHALL prompt for confirmation and update budget balances accordingly
7. IF a transaction exceeds the budget category limit THEN the system SHALL display a warning notification

### Requirement 3: Financial Statistics and Visualization

**User Story:** As a user, I want to view my current financial position through charts and statistics, so that I can quickly understand my spending patterns and financial health.

#### Acceptance Criteria

1. WHEN a user accesses the statistics dashboard THEN the system SHALL display their current financial overview
2. WHEN displaying budget status THEN the system SHALL show a comparison between budgeted and actual spending for each category
3. WHEN visualizing data THEN the system SHALL provide at least three chart types (pie chart for category distribution, bar chart for budget vs actual, and line chart for spending trends over time)
4. WHEN a user selects a time period THEN the system SHALL filter statistics to show data for that specific period (daily, weekly, monthly, yearly)
5. WHEN displaying spending trends THEN the system SHALL show historical data with clear visual indicators for overspending
6. WHEN a user hovers over chart elements THEN the system SHALL display detailed information in tooltips
7. WHEN the financial data updates THEN the system SHALL refresh charts and statistics in real-time

### Requirement 4: Future Financial Forecasting

**User Story:** As a user, I want to forecast my future financial position based on current trends, so that I can plan ahead and make informed financial decisions.

#### Acceptance Criteria

1. WHEN a user accesses the forecasting feature THEN the system SHALL analyze historical spending patterns
2. WHEN generating a forecast THEN the system SHALL project future balances based on average income and expenses
3. WHEN a user specifies a forecast period THEN the system SHALL generate predictions for that timeframe (1 month, 3 months, 6 months, 1 year)
4. WHEN displaying forecasts THEN the system SHALL show projected income, expenses, and net balance
5. WHEN a user adjusts forecast parameters THEN the system SHALL recalculate projections dynamically
6. IF historical data is insufficient THEN the system SHALL display a message indicating limited forecast accuracy
7. WHEN showing forecast results THEN the system SHALL include visual representations (line charts showing projected trends)

### Requirement 5: Data Export Functionality

**User Story:** As a user, I want to export my financial data and forecasts to Excel format, so that I can perform additional analysis or share reports.

#### Acceptance Criteria

1. WHEN a user clicks the export button THEN the system SHALL provide options for what data to export (transactions, budgets, statistics, forecasts)
2. WHEN a user selects data to export THEN the system SHALL allow them to specify a date range
3. WHEN generating an Excel export THEN the system SHALL create a properly formatted spreadsheet with appropriate headers
4. WHEN exporting transactions THEN the system SHALL include all transaction details (date, category, amount, description)
5. WHEN exporting budgets THEN the system SHALL include budget categories, allocated amounts, and actual spending
6. WHEN exporting forecasts THEN the system SHALL include projected data with clear labeling
7. WHEN the export is complete THEN the system SHALL download the Excel file to the user's device
8. IF the export fails THEN the system SHALL display an error message with details

### Requirement 6: User Authentication and Data Security

**User Story:** As a user, I want my financial data to be secure and accessible only to me, so that my personal information remains private.

#### Acceptance Criteria

1. WHEN a new user registers THEN the system SHALL require a unique email and secure password
2. WHEN a user logs in THEN the system SHALL authenticate credentials before granting access
3. WHEN storing passwords THEN the system SHALL use secure hashing algorithms
4. WHEN a user session is active THEN the system SHALL maintain authentication state
5. WHEN a user logs out THEN the system SHALL clear the session and require re-authentication
6. WHEN accessing financial data THEN the system SHALL ensure users can only view their own data
7. IF a user enters incorrect credentials THEN the system SHALL display an error message without revealing which field is incorrect

### Requirement 7: Portfolio Dashboard and Investment Tracking

**User Story:** As an investor, I want to track my investment portfolio across multiple platforms and asset classes, so that I can monitor my total net worth and investment performance.

#### Acceptance Criteria

1. WHEN a user accesses the portfolio dashboard THEN the system SHALL display total net worth, invested capital, unrealized gain/loss, and percentage growth
2. WHEN displaying portfolio breakdown THEN the system SHALL show distribution by asset class (stocks, cash, gold, crypto, etc.)
3. WHEN showing platform distribution THEN the system SHALL display holdings across different platforms (StashAway, moomoo, Versa, etc.)
4. WHEN a user adds an investment THEN the system SHALL require platform, asset name/ticker, buy price, units, and current price
5. WHEN displaying asset performance THEN the system SHALL calculate and show gain/loss for each position
6. WHEN a user imports transactions THEN the system SHALL support CSV import for bulk data entry
7. WHEN viewing historical performance THEN the system SHALL display month-over-month growth charts

### Requirement 8: Multi-Currency Support and Exchange Rate Tracking

**User Story:** As a user with multi-currency investments, I want to track exchange rates and view my portfolio in different currencies, so that I can understand my true financial position across currencies.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL support MYR, SGD, and USD as base currencies
2. WHEN displaying portfolio THEN the system SHALL allow users to toggle between MYR and SGD views
3. WHEN exchange rates update THEN the system SHALL automatically fetch daily rates from a reliable API
4. WHEN a user adds an asset THEN the system SHALL allow manual or automatic exchange rate entry
5. WHEN displaying currency exposure THEN the system SHALL show percentage breakdown by currency
6. WHEN a user sets an exchange rate alert THEN the system SHALL notify when the threshold is reached
7. WHEN calculating returns THEN the system SHALL use historical exchange rates for accurate performance

### Requirement 9: Financial Goal Tracking

**User Story:** As a user, I want to set and track financial goals, so that I can monitor my progress toward major life milestones.

#### Acceptance Criteria

1. WHEN a user creates a goal THEN the system SHALL require goal name, target amount, and timeframe
2. WHEN displaying goal progress THEN the system SHALL show current savings, target amount, and percentage complete
3. WHEN a user tags savings or investments to a goal THEN the system SHALL update the goal progress automatically
4. WHEN viewing a goal THEN the system SHALL display "remaining needed" and "projected completion date"
5. WHEN calculating completion date THEN the system SHALL use current savings, monthly investment rate, and average return
6. WHEN a user has multiple goals THEN the system SHALL display all goals with their progress on the dashboard
7. IF a goal is at risk of not being met THEN the system SHALL display a warning indicator

### Requirement 10: Automatic Price Updates and Data Sync

**User Story:** As a user, I want my investment prices to update automatically, so that I don't have to manually enter current market prices.

#### Acceptance Criteria

1. WHEN the system runs scheduled updates THEN it SHALL fetch current prices for all tracked assets
2. WHEN fetching stock prices THEN the system SHALL use a reliable market data API (e.g., Yahoo Finance)
3. WHEN fetching cryptocurrency prices THEN the system SHALL use appropriate crypto data sources
4. WHEN fetching gold prices THEN the system SHALL use commodity price APIs
5. WHEN price updates fail THEN the system SHALL log the error and retry with exponential backoff
6. WHEN displaying asset prices THEN the system SHALL show the last update timestamp
7. WHEN a user manually refreshes prices THEN the system SHALL fetch the latest data immediately

### Requirement 11: AI-Powered Insights and Analytics

**User Story:** As a user, I want AI-generated insights about my financial health, so that I can make better investment and spending decisions.

#### Acceptance Criteria

1. WHEN the user accesses insights THEN the system SHALL generate personalized financial summaries
2. WHEN portfolio allocation changes significantly THEN the system SHALL suggest rebalancing recommendations
3. WHEN calculating financial health THEN the system SHALL compute liquidity ratio, diversification score, and savings rate
4. WHEN displaying analytics THEN the system SHALL show CAGR (Compound Annual Growth Rate) and drawdown charts
5. WHEN generating forecasts THEN the system SHALL use historical data to project future portfolio value
6. WHEN diversification is poor THEN the system SHALL highlight concentration risks
7. WHEN savings rate is low THEN the system SHALL provide actionable recommendations

### Requirement 12: Smart Alerts and Notifications

**User Story:** As a user, I want to receive alerts for important financial events, so that I can take timely action.

#### Acceptance Criteria

1. WHEN a portfolio milestone is reached THEN the system SHALL send a notification
2. WHEN exchange rates cross user-defined thresholds THEN the system SHALL trigger an alert
3. WHEN portfolio allocation drifts more than 5% from target THEN the system SHALL notify the user
4. WHEN a bill payment is due THEN the system SHALL send a reminder
5. WHEN configuring alerts THEN the system SHALL allow users to choose notification channels (email, in-app)
6. WHEN an alert is triggered THEN the system SHALL log it in the notification history
7. WHEN a user dismisses an alert THEN the system SHALL mark it as read

### Requirement 13: Investment Journal and Decision Tracking

**User Story:** As an investor, I want to record my investment decisions and emotions, so that I can learn from past decisions and improve my strategy.

#### Acceptance Criteria

1. WHEN a user makes a buy/sell decision THEN the system SHALL allow them to record the rationale
2. WHEN recording a decision THEN the system SHALL allow emotional tags (confident, uncertain, FOMO, etc.)
3. WHEN viewing journal entries THEN the system SHALL display them chronologically with associated trades
4. WHEN analyzing performance THEN the system SHALL correlate emotional states with investment outcomes
5. WHEN a position is closed THEN the system SHALL show the original journal entry alongside the result
6. WHEN reviewing past decisions THEN the system SHALL highlight patterns in successful vs unsuccessful trades
7. WHEN exporting journal data THEN the system SHALL include all entries with timestamps and outcomes

### Requirement 14: Responsive User Interface

**User Story:** As a user, I want to access the application from any device, so that I can manage my finances on desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN a user accesses the application from any device THEN the system SHALL display a responsive interface
2. WHEN viewing on mobile devices THEN the system SHALL adapt the layout for smaller screens
3. WHEN interacting with charts on touch devices THEN the system SHALL support touch gestures
4. WHEN navigating the application THEN the system SHALL provide an intuitive menu structure
5. WHEN forms are displayed THEN the system SHALL use appropriate input types for mobile keyboards
6. WHEN charts are rendered THEN the system SHALL ensure they are readable on all screen sizes
7. IF the screen size changes THEN the system SHALL dynamically adjust the layout
