import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Example: Create a test user
  // const user = await prisma.user.create({
  //   data: {
  //     email: 'test@example.com',
  //     name: 'Test User',
  //     password: 'hashed_password_here', // Remember to hash passwords!
  //   },
  // })

  // console.log('Created user:', user)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
