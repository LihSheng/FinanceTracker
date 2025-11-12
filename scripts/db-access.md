# Quick Database Access

## Fastest Way (Recommended)

Open your terminal and run:

```bash
npx prisma studio
```

Then open your browser to: **http://localhost:5555**

You'll see a visual interface with all your tables!

## Alternative: Direct PostgreSQL Connection

**Connection String:**
```
postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable
```

**Individual Details:**
- **Host**: localhost
- **Port**: 51214
- **Database**: template1
- **Username**: postgres
- **Password**: postgres

## Using psql (Command Line)

```bash
psql postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable
```

Then you can run SQL commands:
```sql
-- List all tables
\dt

-- View users
SELECT * FROM "User";

-- View transactions
SELECT * FROM "Transaction";

-- Count records
SELECT COUNT(*) FROM "User";
```

## Using GUI Tools

### pgAdmin
1. Download: https://www.pgadmin.org/download/
2. Add server with details above

### DBeaver (Free)
1. Download: https://dbeaver.io/download/
2. New Connection → PostgreSQL
3. Enter details above

### TablePlus (Mac/Windows)
1. Download: https://tableplus.com/
2. New Connection → PostgreSQL
3. Enter details above

## Need Help?

See full guide: `docs/database-access-guide.md`
