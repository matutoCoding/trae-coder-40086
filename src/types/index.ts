export enum PriorityLevel {
  NORMAL = 0,
  VIP = 1,
  EMERGENCY = 2
}

export const PriorityLabel: Record<PriorityLevel, string> = {
  [PriorityLevel.NORMAL]: '普通',
  [PriorityLevel.VIP]: 'VIP',
  [PriorityLevel.EMERGENCY]: '应急'
}

export interface QueueUser {
  id: string
  ticketNumber: string
  nickname: string
  plateNumber: string
  priority: PriorityLevel
  joinTime: number
  estimatedWaitTime: number
  isCurrentUser: boolean
  status: 'waiting' | 'charging' | 'completed' | 'cancelled'
}

export interface InsertionRecord {
  id: string
  insertedUserId: string
  insertedUserName: string
  insertedPriority: PriorityLevel
  affectedUserIds: string[]
  affectedUserNames: string[]
  previousPositions: Record<string, number>
  newPositions: Record<string, number>
  timestamp: number
}

export enum ChargingPileStatus {
  IDLE = 'idle',
  CHARGING = 'charging',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export const PileStatusLabel: Record<ChargingPileStatus, string> = {
  [ChargingPileStatus.IDLE]: '空闲',
  [ChargingPileStatus.CHARGING]: '充电中',
  [ChargingPileStatus.MAINTENANCE]: '维护中',
  [ChargingPileStatus.RESERVED]: '已预约'
}

export interface ChargingPile {
  id: string
  name: string
  status: ChargingPileStatus
  power: number
  currentUser?: string
  startedAt?: number
  progress?: number
}

export enum PricePeriodType {
  VALLEY = 'valley',
  FLAT = 'flat',
  PEAK = 'peak',
  PEAK_TOP = 'peakTop'
}

export const PricePeriodLabel: Record<PricePeriodType, string> = {
  [PricePeriodType.VALLEY]: '谷峰',
  [PricePeriodType.FLAT]: '平峰',
  [PricePeriodType.PEAK]: '高峰',
  [PricePeriodType.PEAK_TOP]: '尖峰'
}

export interface PricePeriod {
  type: PricePeriodType
  startTime: string
  endTime: string
  pricePerKwh: number
  serviceFee: number
}

export interface BillingSegment {
  periodType: PricePeriodType
  startTime: number
  endTime: number
  durationMinutes: number
  powerKw: number
  energyKwh: number
  unitPrice: number
  serviceFeeUnit: number
  energyCost: number
  serviceFee: number
  subtotal: number
}

export interface Bill {
  id: string
  orderNo: string
  pileName: string
  userName: string
  plateNumber: string
  startTime: number
  endTime: number
  totalDurationMinutes: number
  totalEnergyKwh: number
  segments: BillingSegment[]
  totalEnergyCost: number
  totalServiceFee: number
  totalAmount: number
  status: 'pending' | 'paid' | 'completed' | 'refunded'
  paidAt?: number
}

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone: string
  isVip: boolean
  vipExpireAt?: number
  plateNumbers: string[]
  balance: number
  totalCharges: number
  totalKwh: number
}

export interface CallRecord {
  id: string
  ticketNumber: string
  userName: string
  priority: PriorityLevel
  calledAt: number
  pileName: string
}
