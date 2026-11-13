import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireUser } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'
import { defineApiHandler } from '../../../utils/response'

const passwordSchema = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z.string().min(6, '新密码至少 6 位')
})

export default defineApiHandler(async (event) => {
  const current = await requireUser(event)
  const body: unknown = await readBody(event)
  const parsed = passwordSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const record = await prisma.user.findUnique({
    where: { id: current.id },
    select: { password: true }
  })
  if (!record) {
    throw createError({ statusCode: 401, statusMessage: '账号不可用' })
  }

  const oldPasswordOk = await bcrypt.compare(parsed.data.oldPassword, record.password)
  if (!oldPasswordOk) {
    throw createError({ statusCode: 400, statusMessage: '旧密码不正确' })
  }

  if (parsed.data.oldPassword === parsed.data.newPassword) {
    throw createError({ statusCode: 400, statusMessage: '新密码不能与旧密码相同' })
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: current.id },
    data: { password: passwordHash }
  })

  return null
})
