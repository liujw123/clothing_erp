import type { FlowTemplateConfig, FlowTemplateDto } from '#shared/flow-templates'
import { FLOW_TEMPLATES } from '#shared/flow-templates'
import { prisma } from '../utils/prisma'

const templateOrder = Object.keys(FLOW_TEMPLATES)

interface FlowTemplateRecord {
  code: string
  name: string
  config: unknown
  createdAt: Date
  updatedAt: Date
}

function toDto(template: FlowTemplateRecord): FlowTemplateDto {
  return {
    code: template.code,
    name: template.name,
    config: template.config as FlowTemplateConfig,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  }
}

export async function listFlowTemplates() {
  const templates = await prisma.flowTemplate.findMany()
  return templates
    .sort((a, b) => templateOrder.indexOf(a.code) - templateOrder.indexOf(b.code))
    .map(toDto)
}

export async function getFlowTemplate(code: string) {
  const template = await prisma.flowTemplate.findUnique({ where: { code } })
  return template ? toDto(template) : null
}
