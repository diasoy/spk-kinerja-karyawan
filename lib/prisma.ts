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
    // Use Transaction mode (port 6543) with proper pooling
    const connectionString = process.env.DATABASE_URL
    
    global.pool = new Pool({
      connectionString: connectionString,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return error after 10 seconds if unable to connect
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
export const pool = global.pool
