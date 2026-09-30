import { prisma } from '../server/src/db';

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS IN DB:', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
