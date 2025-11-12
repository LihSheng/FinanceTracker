/**
 * Test script to verify authentication setup
 * Run with: npx tsx scripts/test-auth.ts
 */

import { config } from "dotenv";
import bcrypt from "bcryptjs";

// Load environment variables
config({ path: ".env.local" });
config();

async function testAuthSetup() {
  console.log("🔐 Testing Authentication Setup...\n");

  // Test 1: Password hashing
  console.log("Test 1: Password Hashing");
  const password = "TestPassword123";
  const hashedPassword = await bcrypt.hash(password, 10);
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log(`✅ Password hashing: ${isValid ? "PASS" : "FAIL"}`);
  console.log(`   Original: ${password}`);
  console.log(`   Hashed: ${hashedPassword.substring(0, 30)}...`);
  console.log(`   Verification: ${isValid}\n`);

  // Test 2: Environment variables
  console.log("Test 2: Environment Variables");
  const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"];
  let allEnvVarsPresent = true;

  for (const envVar of requiredEnvVars) {
    const isPresent = !!process.env[envVar];
    console.log(`   ${envVar}: ${isPresent ? "✅ Present" : "❌ Missing"}`);
    if (!isPresent) allEnvVarsPresent = false;
  }

  console.log(
    `\n${allEnvVarsPresent ? "✅" : "❌"} Environment variables: ${allEnvVarsPresent ? "PASS" : "FAIL"}\n`
  );

  // Test 3: Check if Prisma client is available
  console.log("Test 3: Prisma Client");
  try {
    const { prisma } = await import("../lib/prisma");
    await prisma.$connect();
    console.log("✅ Prisma client connection: PASS");
    await prisma.$disconnect();
  } catch (error) {
    console.log("❌ Prisma client connection: FAIL");
    console.log(`   Error: ${error}`);
  }

  console.log("\n🎉 Authentication setup test complete!");
}

testAuthSetup().catch(console.error);
