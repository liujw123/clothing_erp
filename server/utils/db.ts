import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

/**
 * Prisma 7 必须通过 driver adapter 连接数据库。
 * MySQL 8 使用 @prisma/adapter-mariadb（MariaDB 驱动兼容 MySQL）。
 */
export function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'erp',
    password: process.env.DB_PASSWORD ?? 'erp123456',
    database: process.env.DB_NAME ?? 'clothing_erp',
    connectionLimit: 5
  })

  return new PrismaClient({ adapter })
}
