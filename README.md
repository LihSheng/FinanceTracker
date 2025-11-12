# Finance Tracker

A comprehensive Personal Finance & Portfolio Tracker web application built with Next.js 14.

## Features

- Budget Management
- Transaction Tracking
- Portfolio Management (Multi-platform, Multi-currency)
- Goal Tracking
- Financial Statistics & Visualization
- AI-Powered Insights
- Forecasting
- Automated Data Sync
- Investment Journal

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Automation**: n8n

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

4. Set up the database:

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**
- Install PostgreSQL 14+
- Create a database named `finance_tracker`
- Update `DATABASE_URL` in `.env.local`

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

5. Run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
finance-tracker/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
├── types/           # TypeScript type definitions
├── prisma/          # Database schema and migrations
└── public/          # Static assets
```

## Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes (dev only)
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database with sample data

## License

MIT
