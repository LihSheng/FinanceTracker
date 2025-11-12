#!/usr/bin/env tsx

/**
 * Database Setup Verification Script
 * 
 * This script verifies that the database is properly configured and accessible.
 * Run with: npx tsx scripts/verify-setup.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying database setup...\n')

  try {
    // Test database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connection successful!\n')

    // Check if tables exist by trying to count users
    console.log('2. Checking database tables...')
    try {
      await prisma.user.count()
      console.log('   ✅ Database tables exist and are accessible\n')
    } catch (error) {
      console.log('   ⚠️  Tables may not exist. Run migrations with: npm run db:migrate\n')
    }

    // Verify key models
    console.log('3. Verifying Prisma models...')
    const modelChecks = [
      { name: 'User', check: () => prisma.user.count() },
      { name: 'Budget', check: () => prisma.budget.count() },
      { name: 'Transaction', check: () => prisma.transaction.count() },
      { name: 'Asset', check: () => prisma.asset.count() },
      { name: 'Goal', check: () => prisma.goal.count() },
    ]

    let allModelsAccessible = true
    for (const model of modelChecks) {
      try {
        await model.check()
        console.log(`   ✅ ${model.name} model accessible`)
      } catch (error) {
        console.log(`   ❌ ${model.name} model not accessible`)
        allModelsAccessible = false
      }
    }
    
    if (!allModelsAccessible) {
      console.log('\n   Note: If tables exist but models are not accessible,')
      console.log('   try regenerating Prisma Client: npm run db:generate')
    }

    console.log('\n✨ Database setup verification complete!')
    console.log('\nNext steps:')
    console.log('  - Run the development server: npm run dev')
    console.log('  - Open Prisma Studio: npm run db:studio')
    
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('\nError details:', error)
    console.error('\nTroubleshooting:')
    console.error('  1. Ensure PostgreSQL is running')
    console.error('  2. Check DATABASE_URL in .env.local')
    console.error('  3. For Docker: run "docker-compose up -d"')
    console.error('  4. Run migrations: npm run db:migrate')
    console.error('\nSee DATABASE_SETUP.md for detailed instructions.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabaseConnection()
