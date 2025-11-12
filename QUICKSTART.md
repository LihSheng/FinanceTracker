# Quick Start Guide

Get the Finance Tracker up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- Docker Desktop (recommended) OR PostgreSQL 14+ installed locally

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# The default configuration works with Docker setup
# Edit .env.local if you're using a different database
```

### 3. Start Database

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify it's running
docker ps
```

**Option B: Local PostgreSQL**

- Ensure PostgreSQL is running
- Create a database: `CREATE DATABASE finance_tracker;`
- Update `DATABASE_URL` in `.env.local`

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Verify setup (optional)
npm run db:verify
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Useful Commands

```bash
# View database in GUI
npm run db:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Stop Docker database
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Troubleshooting

### "Can't reach database server"

1. Check if Docker is running: `docker ps`
2. Restart database: `docker-compose restart`
3. Check logs: `docker-compose logs postgres`

### "Migration failed"

1. Ensure database is running
2. Check DATABASE_URL in `.env.local`
3. Try: `npm run db:push` (for development)

### Port 5432 already in use

Another PostgreSQL instance is running. Either:
- Stop the other instance
- Change the port in `docker-compose.yml` and `DATABASE_URL`

## Next Steps

1. ✅ Database is set up
2. ✅ Development server is running
3. 📝 Start implementing features from `tasks.md`
4. 🎨 Customize the UI components
5. 🔐 Set up authentication (Task 3)

For detailed information, see:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Comprehensive database guide
- [README.md](./README.md) - Full project documentation
- [.kiro/specs/finance-tracker/](./kiro/specs/finance-tracker/) - Feature specifications
