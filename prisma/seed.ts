import 'dotenv/config'
import bcrypt from 'bcryptjs'
import type { Prisma } from '../server/generated/prisma/client'
import { createPrismaClient } from '../server/utils/db'
import { FLOW_TEMPLATES } from '../shared/flow-templates'
import { ROLE_DEFINITIONS } from '../shared/permissions'

interface DemoUser {
  email: string
  username: string
  name: string
  phone: string
  gender: string
  deptId: string
  roleCode: string
}

const demoUsers: DemoUser[] = [
  { email: 'admin@erp.local', username: 'admin', name: '系统管理员', phone: '15888888888', gender: 'FEMALE', deptId: 'MANAGEMENT', roleCode: 'ADMIN' },
  { email: 'design.manager@erp.local', username: 'design.manager', name: '设计主管', phone: '13900000000', gender: 'FEMALE', deptId: 'DESIGN', roleCode: 'DESIGN_MANAGER' },
  { email: 'designer@erp.local', username: 'designer', name: '设计师', phone: '13700000000', gender: 'FEMALE', deptId: 'DESIGN', roleCode: 'DESIGNER' }
]

const prisma = createPrismaClient()

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  for (const role of ROLE_DEFINITIONS) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        permissions: role.permissions,
        dataScope: role.dataScope,
        active: true
      },
      create: {
        code: role.code,
        name: role.name,
        permissions: role.permissions,
        dataScope: role.dataScope,
        active: true
      }
    })
  }

  for (const [code, template] of Object.entries(FLOW_TEMPLATES)) {
    await prisma.flowTemplate.upsert({
      where: { code },
      update: {
        name: template.name,
        config: toJsonValue(template.config)
      },
      create: {
        code,
        name: template.name,
        config: toJsonValue(template.config)
      }
    })
  }

  for (const demo of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        username: demo.username,
        name: demo.name,
        password: passwordHash,
        phone: demo.phone,
        gender: demo.gender,
        deptId: demo.deptId,
        active: true
      },
      create: {
        email: demo.email,
        username: demo.username,
        name: demo.name,
        password: passwordHash,
        phone: demo.phone,
        gender: demo.gender,
        deptId: demo.deptId,
        active: true
      }
    })

    await prisma.userRole.upsert({
      where: {
        userId_roleCode: {
          userId: user.id,
          roleCode: demo.roleCode
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleCode: demo.roleCode
      }
    })
  }

  console.log(`seed 完成：${ROLE_DEFINITIONS.length} 个角色，${demoUsers.length} 个演示账号，${Object.keys(FLOW_TEMPLATES).length} 个流程模板`)
}

main()
  .catch((error: unknown) => {
    console.error('seed 失败', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
