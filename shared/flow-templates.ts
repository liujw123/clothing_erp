import type { StageCode } from './types/domain'

export interface StageTaskConfig {
  type: string
  title: string
  roleCode: string
  reviewerRoles: string[]
}

export interface StageConfig {
  code: StageCode
  name: string
  sort: number
  tasks: StageTaskConfig[]
}

export interface FlowTemplateConfig {
  stages: StageConfig[]
}

export type FlowTemplateCode = 'COMPANY' | 'CUSTOM_2' | 'CUSTOM_3' | 'REPEAT'

export interface FlowTemplateDefinition {
  name: string
  config: FlowTemplateConfig
}

export interface FlowTemplateDto {
  code: string
  name: string
  config: FlowTemplateConfig
  createdAt: string
  updatedAt: string
}

type StageBlueprint = Omit<StageConfig, 'sort'>

const stageBlueprints: Record<StageCode, StageBlueprint> = {
  DESIGN: {
    code: 'DESIGN',
    name: '设计',
    tasks: [
      { type: 'DESIGN_EFFECT', title: '效果图设计', roleCode: 'DESIGNER', reviewerRoles: ['DESIGN_MANAGER', 'ADMIN'] },
      { type: 'DESIGN_COLOR', title: '齐色图设计', roleCode: 'DESIGNER', reviewerRoles: ['DESIGN_MANAGER', 'ADMIN'] },
      { type: 'DESIGN_PATTERN', title: '花稿图设计', roleCode: 'DESIGNER', reviewerRoles: ['DESIGN_MANAGER', 'ADMIN'] }
    ]
  },
  SAMPLE: {
    code: 'SAMPLE',
    name: '打版',
    tasks: [
      { type: 'SAMPLE_FABRIC', title: '面料样', roleCode: 'SAMPLE_FOLLOWER', reviewerRoles: ['DESIGNER', 'SAMPLE_MANAGER'] },
      { type: 'SAMPLE_CRAFT', title: '工艺样', roleCode: 'SAMPLE_FOLLOWER', reviewerRoles: ['DESIGNER', 'SAMPLE_MANAGER'] },
      { type: 'SAMPLE_GARMENT', title: '成衣样', roleCode: 'SAMPLE_FOLLOWER', reviewerRoles: ['DESIGNER', 'SAMPLE_MANAGER'] }
    ]
  },
  COST: {
    code: 'COST',
    name: '核价',
    tasks: [
      { type: 'COST_FABRIC', title: '面料核价', roleCode: 'COST_SPECIALIST', reviewerRoles: ['FOLLOWER', 'COST_MANAGER'] },
      { type: 'COST_TRIM', title: '辅料核价', roleCode: 'COST_SPECIALIST', reviewerRoles: ['FOLLOWER', 'COST_MANAGER'] },
      { type: 'COST_CRAFT', title: '工艺核价', roleCode: 'COST_SPECIALIST', reviewerRoles: ['FOLLOWER', 'COST_MANAGER'] },
      { type: 'COST_PRECISE', title: '精准核价', roleCode: 'COST_SPECIALIST', reviewerRoles: ['FOLLOWER', 'COST_MANAGER'] }
    ]
  },
  QUOTE: {
    code: 'QUOTE',
    name: '报价',
    tasks: [
      { type: 'QUOTE_PRECISE', title: '精准报价', roleCode: 'FOLLOWER', reviewerRoles: ['BIZ', 'FOLLOWER_MANAGER', 'ADMIN'] }
    ]
  },
  ORDER: {
    code: 'ORDER',
    name: '订单',
    tasks: [
      { type: 'ORDER_STOCK', title: '现货订单', roleCode: 'BIZ', reviewerRoles: ['ADMIN'] },
      { type: 'ORDER_CUSTOM', title: '定制订单', roleCode: 'BIZ', reviewerRoles: ['ADMIN'] }
    ]
  },
  PURCHASE: {
    code: 'PURCHASE',
    name: '采购',
    tasks: [
      { type: 'PURCHASE_STOCK', title: '现货采购', roleCode: 'FOLLOWER', reviewerRoles: ['BIZ', 'FOLLOWER_MANAGER', 'ADMIN'] },
      { type: 'PURCHASE_CUSTOM', title: '定制采购', roleCode: 'FOLLOWER', reviewerRoles: ['BIZ', 'FOLLOWER_MANAGER', 'ADMIN'] }
    ]
  },
  QC: {
    code: 'QC',
    name: '质检',
    tasks: [
      { type: 'QC_FIRST', title: '首扎质检', roleCode: 'QC', reviewerRoles: ['QC_MANAGER', 'BIZ', 'FOLLOWER'] },
      { type: 'QC_MIDDLE', title: '中期质检', roleCode: 'QC', reviewerRoles: ['QC_MANAGER', 'BIZ', 'FOLLOWER'] },
      { type: 'QC_FINAL', title: '尾期质检', roleCode: 'QC', reviewerRoles: ['QC_MANAGER', 'BIZ', 'FOLLOWER'] }
    ]
  },
  STOCK: {
    code: 'STOCK',
    name: '进出库',
    tasks: [
      { type: 'STOCK_IN', title: '采购入库', roleCode: 'SHIPPER', reviewerRoles: ['FOLLOWER', 'FOLLOWER_MANAGER'] },
      { type: 'STOCK_OUT', title: '销售出库', roleCode: 'SHIPPER', reviewerRoles: ['FOLLOWER', 'FOLLOWER_MANAGER'] }
    ]
  },
  SETTLE: {
    code: 'SETTLE',
    name: '结算',
    tasks: [
      { type: 'SETTLE_SUPPLIER', title: '供应商对账', roleCode: 'FOLLOWER', reviewerRoles: ['FINANCE'] },
      { type: 'SETTLE_CUSTOMER', title: '客户对账', roleCode: 'FOLLOWER', reviewerRoles: ['FINANCE'] }
    ]
  }
}

const customerReviewOverrides: Partial<Record<StageCode, string[]>> = {
  DESIGN: ['DESIGN_MANAGER', 'BIZ'],
  ORDER: ['BIZ_MANAGER', 'ADMIN']
}

function buildStages(codes: StageCode[], line: 'COMPANY' | 'CUSTOM'): StageConfig[] {
  return codes.map((code, index) => {
    const blueprint = stageBlueprints[code]
    if (!blueprint) {
      throw new Error(`Unknown stage: ${code}`)
    }
    const reviewers = line === 'CUSTOM' ? customerReviewOverrides[code] : undefined
    return {
      ...blueprint,
      sort: index + 1,
      tasks: blueprint.tasks.map(task => ({
        ...task,
        reviewerRoles: reviewers ?? task.reviewerRoles
      }))
    }
  })
}

const companyStages: StageCode[] = ['DESIGN', 'SAMPLE', 'COST', 'QUOTE', 'ORDER', 'PURCHASE', 'QC', 'STOCK', 'SETTLE']
const custom3Stages: StageCode[] = ['DESIGN', 'QUOTE', 'ORDER', 'PURCHASE', 'QC', 'STOCK', 'SETTLE']
const repeatStages: StageCode[] = ['QUOTE', 'ORDER', 'PURCHASE', 'QC', 'STOCK', 'SETTLE']

export const FLOW_TEMPLATES: Record<FlowTemplateCode, FlowTemplateDefinition> = {
  COMPANY: {
    name: '公司开发线',
    config: { stages: buildStages(companyStages, 'COMPANY') }
  },
  CUSTOM_2: {
    name: '二线定开',
    config: { stages: buildStages(companyStages, 'CUSTOM') }
  },
  CUSTOM_3: {
    name: '三线定开',
    config: { stages: buildStages(custom3Stages, 'CUSTOM') }
  },
  REPEAT: {
    name: '翻单',
    config: { stages: buildStages(repeatStages, 'CUSTOM') }
  }
}
