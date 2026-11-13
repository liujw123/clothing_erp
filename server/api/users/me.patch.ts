import { z } from 'zod'
import { requireUser, toAuthUser } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { defineApiHandler } from '../../utils/response'

const profileSchema = z.object({
  name: z.string().trim().min(1, '请输入用户昵称').max(50, '昵称最多 50 个字符'),
  email: z.string().trim().email('邮箱格式不正确'),
  phone: z.string().trim().max(20, '手机号最多 20 位').nullable().optional().transform(value => value || null),
  gender: z.enum(['MALE', 'FEMALE']).nullable().optional()
})

export default defineApiHandler(async (event) => {
  const current = await requireUser(event)
  const body: unknown = await readBody(event)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const email = parsed.data.email.toLowerCase()
  const emailOwner = await prisma.user.findFirst({
    where: { email, NOT: { id: current.id } },
    select: { id: true }
  })
  if (emailOwner) {
    throw createError({ statusCode: 409, statusMessage: '邮箱已被使用' })
  }

  const updated = await prisma.user.update({
    where: { id: current.id },
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      gender: parsed.data.gender ?? null
    },
    include: { roles: { include: { role: true } } }
  })

  return toAuthUser(updated)
})
