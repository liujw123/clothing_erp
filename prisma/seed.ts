import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createPrismaClient } from '../server/utils/db'
import { ROLE_DEFINITIONS } from '../shared/permissions'

interface DemoUser {
  email: string
  name: string
  deptId: string
  roleCode: string
}

const demoUsers: DemoUser[] = [
  { email: 'admin@erp.local', name: '系统管理员', deptId: 'MANAGEMENT', roleCode: 'ADMIN' },
  { email: 'design.manager@erp.local', name: '设计主管', deptId: 'DESIGN', roleCode: 'DESIGN_MANAGER' },
  { email: 'designer@erp.local', name: '设计师', deptId: 'DESIGN', roleCode: 'DESIGNER' }
]

const prisma = createPrismaClient()

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

  for (const demo of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        name: demo.name,
        password: passwordHash,
        deptId: demo.deptId,
        active: true
      },
      create: {
        email: demo.email,
        name: demo.name,
        password: passwordHash,
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

  console.log(`seed 完成：${ROLE_DEFINITIONS.length} 个角色，${demoUsers.length} 个演示账号`)
}

main()
  .catch((error: unknown) => {
    console.error('seed 失败', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
