# Database Migration Guide

## Running Your First Migration

Once your PostgreSQL database is running, follow these steps to create and apply the initial migration:

### Step 1: Ensure Database is Running

**Using Docker:**
```bash
docker-compose up -d
docker ps  # Verify postgres container is running
```

**Using Local PostgreSQL:**
```bash
# Windows
pg_ctl status

# macOS/Linux
sudo systemctl status postgresql
```

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

This creates the TypeScript types for your database models.

### Step 3: Create and Apply Migration

```bash
npm run db:migrate
```

You'll be prompted to name your migration. Suggested name: `init` or `initial_schema`

This command will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Create all tables, indexes, and relationships

### Step 4: Verify Setup

```bash
npm run db:verify
```

This will check:
- Database connection
- Table creation
- Model accessibility

### Step 5: Explore Your Database (Optional)

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Explore relationships

## Common Migration Commands

### Create a New Migration
```bash
npm run db:migrate
```

### Apply Pending Migrations
```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Check Migration Status
```bash
npx prisma migrate status
```

### Push Schema Without Migration (Dev Only)
```bash
npm run db:push
```

## Migration Workflow

### Development
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Name your migration descriptively
4. Test the changes

### Production
1. Commit migration files to version control
2. Deploy code with migrations
3. Run `npx prisma migrate deploy` on production

## Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Verify port 5432 is not blocked

### "Migration failed"
- Check database logs: `docker-compose logs postgres`
- Ensure database user has proper permissions
- Try `npm run db:push` for development

### "Prisma Client not found"
- Run `npm run db:generate`
- Restart your IDE/editor
- Check `node_modules/@prisma/client` exists

### "Database already exists"
- This is normal if you've run migrations before
- Use `npx prisma migrate reset` to start fresh (⚠️ deletes data)

### "Migration conflicts"
- Pull latest migrations from version control
- Run `npx prisma migrate resolve --applied <migration_name>` if needed
- Or reset and reapply: `npx prisma migrate reset`

## Best Practices

1. **Always commit migration files** to version control
2. **Never edit migration files** after they're applied
3. **Test migrations** on a development database first
4. **Backup production data** before running migrations
5. **Use descriptive names** for migrations
6. **Review generated SQL** in migration files

## Migration File Structure

After running your first migration, you'll see:

```
prisma/
├── migrations/
│   ├── migration_lock.toml
│   └── 20240101000000_init/
│       └── migration.sql
└── schema.prisma
```

The `migration.sql` file contains the actual SQL commands that were executed.

## Next Steps After Migration

1. ✅ Database schema is created
2. ✅ Prisma Client is generated
3. 📝 Start implementing API routes
4. 🔐 Set up authentication (Task 3)
5. 🎨 Build UI components

## Need Help?

- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for setup issues
- See [QUICKSTART.md](./QUICKSTART.md) for quick setup
- Check Prisma docs: https://www.prisma.io/docs
