# Prisma Database Access Guide

## Your Current Setup

- **Database**: PostgreSQL (via Prisma Postgres)
- **Provider**: Prisma local development server
- **Ports**: 
  - Main DB: 51214
  - Shadow DB: 51215
  - Proxy: 51213

## Methods to Access Your Database

### 1. Prisma Studio (Recommended - Visual Interface)

**Easiest way to view and edit data:**

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can:
- ✅ View all tables
- ✅ Browse records
- ✅ Add/edit/delete data
- ✅ Filter and search
- ✅ No SQL knowledge required

### 2. Prisma CLI Commands

#### View Database Schema
```bash
npx prisma db pull
```

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Run Migrations
```bash
npx prisma migrate dev --name your_migration_name
```

#### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

#### Seed Database
```bash
npx prisma db seed
```

### 3. Direct PostgreSQL Connection

**Using psql (PostgreSQL CLI):**

```bash
# Extract connection details from your DATABASE_URL
psql postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable
```

**Connection Details:**
- Host: `localhost`
- Port: `51214`
- Database: `template1`
- Username: `postgres`
- Password: `postgres`

### 4. Database GUI Tools

#### Option A: pgAdmin
1. Download: https://www.pgadmin.org/download/
2. Add new server:
   - Host: `localhost`
   - Port: `51214`
   - Database: `template1`
   - Username: `postgres`
   - Password: `postgres`

#### Option B: DBeaver
1. Download: https://dbeaver.io/download/
2. Create new PostgreSQL connection
3. Use connection details above

#### Option C: TablePlus
1. Download: https://tableplus.com/
2. Create new PostgreSQL connection
3. Use connection details above

### 5. Programmatic Access (In Your Code)

**Using Prisma Client:**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Query examples
async function examples() {
  // Get all users
  const users = await prisma.user.findMany();
  
  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  });
  
  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email: 'new@example.com',
      name: 'New User',
      password: 'hashed_password'
    }
  });
  
  // Update user
  const updated = await prisma.user.update({
    where: { id: 'user_id' },
    data: { name: 'Updated Name' }
  });
  
  // Delete user
  await prisma.user.delete({
    where: { id: 'user_id' }
  });
}
```

### 6. Create Database Seed Script

**File**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password_here',
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**
```bash
npx prisma db seed
```

## Quick Commands Reference

```bash
# Open Prisma Studio (Visual Interface)
npx prisma studio

# View current schema
npx prisma db pull

# Apply schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## Common Tasks

### View All Tables
```bash
npx prisma studio
# Then browse in the web interface
```

### Export Data
```bash
# Using pg_dump
pg_dump -h localhost -p 51214 -U postgres -d template1 > backup.sql
```

### Import Data
```bash
# Using psql
psql -h localhost -p 51214 -U postgres -d template1 < backup.sql
```

### Check Database Status
```bash
# In your project
npx prisma db pull
```

## Troubleshooting

### Can't Connect to Database

1. **Check if Prisma server is running:**
   ```bash
   # Start Prisma development server
   npx prisma dev
   ```

2. **Verify DATABASE_URL in .env:**
   ```
   DATABASE_URL="prisma+postgres://localhost:51213/..."
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Database is Empty

1. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

2. **Seed database:**
   ```bash
   npx prisma db seed
   ```

### Schema Changes Not Reflecting

1. **Push changes:**
   ```bash
   npx prisma db push
   ```

2. **Regenerate client:**
   ```bash
   npx prisma generate
   ```

3. **Restart dev server**

## Best Practices

1. ✅ **Always use Prisma Studio** for quick data viewing
2. ✅ **Use migrations** for schema changes (not db push in production)
3. ✅ **Backup before reset** - `prisma migrate reset` deletes everything
4. ✅ **Use seed scripts** for test data
5. ✅ **Keep schema.prisma** in version control
6. ⚠️ **Never commit .env** with real credentials

## Useful Prisma Studio Features

- **Filter**: Click column headers to filter
- **Sort**: Click column headers to sort
- **Search**: Use search box for text search
- **Relations**: Click relation fields to navigate
- **Edit**: Double-click cells to edit
- **Add**: Click "Add record" button
- **Delete**: Select rows and click delete

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Studio](https://www.prisma.io/studio)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## Quick Start

**To access your database right now:**

```bash
# Open visual interface
npx prisma studio
```

Then open your browser to `http://localhost:5555` and you'll see all your tables!
