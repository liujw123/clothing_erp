export default defineEventHandler(async () => {
  const startedAt = Date.now()
  await prisma.$queryRaw`SELECT 1`
  return {
    ok: true,
    database: 'mysql',
    latencyMs: Date.now() - startedAt
  }
})
