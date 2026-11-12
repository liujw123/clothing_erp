import { createPrismaClient } from './db'

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 开发环境热更新时复用同一个连接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
