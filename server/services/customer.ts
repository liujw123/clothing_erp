import { createError } from 'h3'
import { prisma } from '../utils/prisma'

export interface CustomerDto {
  id: string
  code: string
  name: string
  country: string | null
  createdAt: string
  updatedAt: string
}

export interface CustomerListParams {
  page: number
  pageSize: number
  keyword?: string
}

export interface CustomerInput {
  code: string
  name: string
  country?: string | null
}

interface CustomerRecord {
  id: string
  code: string
  name: string
  country: string | null
  createdAt: Date
  updatedAt: Date
}

function toDto(customer: CustomerRecord): CustomerDto {
  return {
    id: customer.id,
    code: customer.code,
    name: customer.name,
    country: customer.country,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString()
  }
}

export async function listCustomers(params: CustomerListParams) {
  const { page, pageSize, keyword } = params
  const where = keyword
    ? {
        OR: [
          { code: { contains: keyword } },
          { name: { contains: keyword } },
          { country: { contains: keyword } }
        ]
      }
    : {}

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { code: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  return {
    items: customers.map(toDto),
    total
  }
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } })
  return customer ? toDto(customer) : null
}

export async function createCustomer(input: CustomerInput) {
  const code = input.code.toUpperCase()
  const existing = await prisma.customer.findUnique({
    where: { code },
    select: { id: true }
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '客户编码已存在' })
  }

  const customer = await prisma.customer.create({
    data: {
      code,
      name: input.name,
      country: input.country ?? null
    }
  })
  return toDto(customer)
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const existing = await prisma.customer.findUnique({
    where: { id },
    select: { id: true }
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: '客户不存在' })
  }

  const code = input.code.toUpperCase()
  const codeOwner = await prisma.customer.findUnique({
    where: { code },
    select: { id: true }
  })
  if (codeOwner && codeOwner.id !== id) {
    throw createError({ statusCode: 409, statusMessage: '客户编码已存在' })
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      code,
      name: input.name,
      country: input.country ?? null
    }
  })
  return toDto(customer)
}
