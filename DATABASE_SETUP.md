# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Finance Tracker application.

## Prerequisites

- PostgreSQL 14+ installed on your system
- Node.js 18+ and npm installed

## Installation Options

### Option 1: Local PostgreSQL Installation

#### Windows
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

#### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Option 2: Docker (Recommended for Development)

Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    container_name: finance_tracker_db
    restart: always
    environment:
      POSTGRES_USER: financeuser
      POSTGRES_PASSWORD: financepass
      POSTGRES_DB: finance_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

## Database Configuration

1. Create the database (if not using Docker):
```sql
CREATE DATABASE finance_tracker;
```

2. Update your `.env.local` file with the correct DATABASE_URL:

```env
# For local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/finance_tracker"

# For Docker setup
DATABASE_URL="postgresql://financeuser:financepass@localhost:5432/finance_tracker"
```

## Running Migrations

Once your database is set up and running:

1. Generate Prisma Client:
```bash
npm run db:generate
```

2. Run the initial migration:
```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up relationships and indexes
- Generate the migration files in `prisma/migrations/`

## Useful Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply a new migration
npm run db:migrate

# Push schema changes without creating migration (dev only)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Run database seed (if available)
npm run db:seed
```

## Prisma Studio

To view and edit your database data visually:

```bash
npm run db:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Troubleshooting

### Connection Issues

1. **Can't reach database server**
   - Ensure PostgreSQL is running
   - Check if the port (5432) is correct
   - Verify your DATABASE_URL in `.env.local`

2. **Authentication failed**
   - Double-check username and password in DATABASE_URL
   - Ensure the user has proper permissions

3. **Database does not exist**
   - Create the database manually using psql or pgAdmin
   - Or use Docker which creates it automatically

### Reset Database

If you need to reset your database:

```bash
# Drop and recreate all tables
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data!

## Database Schema

The application uses the following main models:
- User (authentication and user data)
- Budget & BudgetCategory (budget management)
- Transaction (income/expense tracking)
- Asset & PriceHistory (portfolio management)
- Goal & GoalContribution (financial goals)
- ExchangeRate (multi-currency support)
- Alert & Notification (alerts system)
- JournalEntry (investment journal)
- PortfolioSnapshot (historical tracking)
- Forecast (financial forecasting)

For detailed schema information, see `prisma/schema.prisma`
