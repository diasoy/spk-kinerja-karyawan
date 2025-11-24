import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  var prisma: PrismaClient | undefined
  var pool: Pool | undefined
}

// Only initialize on server-side
if (typeof window === 'undefined') {
  if (!global.pool) {
    global.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  
  if (!global.prisma) {
    const adapter = new PrismaPg(global.pool)
    global.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
}

export const prisma = global.prisma!
