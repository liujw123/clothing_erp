import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { setAuthCookie, signToken, toAuthUser } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { defineApiHandler } from '../../utils/response'

const loginSchema = z.object({
  email: z.string().trim().min(1, '请输入邮箱').email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位')
})

export default defineApiHandler(async (event) => {
  const body: unknown = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } }
  })

  if (!user || !user.active) {
    throw createError({ statusCode: 401, statusMessage: '账号或密码错误' })
  }

  const passwordOk = await bcrypt.compare(parsed.data.password, user.password)
  if (!passwordOk) {
    throw createError({ statusCode: 401, statusMessage: '账号或密码错误' })
  }

  const token = await signToken(user.id)
  setAuthCookie(event, token)
  setResponseStatus(event, 201)

  return toAuthUser(user)
})
