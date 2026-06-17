import { QueueUser, PriorityLevel, InsertionRecord, CallRecord, ChargingPile, ChargingPileStatus } from '@/types'
import { sortQueueByPriority, generateTicketNumber } from '@/utils/queue'

const now = Date.now()

export const mockChargingPiles: ChargingPile[] = [
  { id: 'pile1', name: 'A01桩', status: ChargingPileStatus.CHARGING, power: 120, currentUser: 'u1', startedAt: now - 30 * 60000, progress: 65 },
  { id: 'pile2', name: 'A02桩', status: ChargingPileStatus.CHARGING, power: 60, currentUser: 'u2', startedAt: now - 15 * 60000, progress: 30 },
  { id: 'pile3', name: 'A03桩', status: ChargingPileStatus.IDLE, power: 120 },
  { id: 'pile4', name: 'B01桩', status: ChargingPileStatus.CHARGING, power: 60, currentUser: 'u3', startedAt: now - 50 * 60000, progress: 90 },
  { id: 'pile5', name: 'B02桩', status: ChargingPileStatus.MAINTENANCE, power: 120 },
  { id: 'pile6', name: 'B03桩', status: ChargingPileStatus.CHARGING, power: 60, currentUser: 'u4', startedAt: now - 20 * 60000, progress: 45 }
]

export const mockQueueUsers: QueueUser[] = [
  {
    id: 'u10',
    ticketNumber: generateTicketNumber(PriorityLevel.EMERGENCY),
    nickname: '救援车张师傅',
    plateNumber: '京A·12345',
    priority: PriorityLevel.EMERGENCY,
    joinTime: now - 2 * 60000,
    estimatedWaitTime: 0,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'u11',
    ticketNumber: generateTicketNumber(PriorityLevel.VIP),
    nickname: 'VIP李先生',
    plateNumber: '京B·88888',
    priority: PriorityLevel.VIP,
    joinTime: now - 8 * 60000,
    estimatedWaitTime: 15,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'u12',
    ticketNumber: generateTicketNumber(PriorityLevel.VIP),
    nickname: 'VIP王女士',
    plateNumber: '京C·66666',
    priority: PriorityLevel.VIP,
    joinTime: now - 12 * 60000,
    estimatedWaitTime: 45,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'me',
    ticketNumber: generateTicketNumber(PriorityLevel.NORMAL),
    nickname: '我',
    plateNumber: '京D·99999',
    priority: PriorityLevel.NORMAL,
    joinTime: now - 15 * 60000,
    estimatedWaitTime: 90,
    isCurrentUser: true,
    status: 'waiting'
  },
  {
    id: 'u14',
    ticketNumber: generateTicketNumber(PriorityLevel.NORMAL),
    nickname: '赵先生',
    plateNumber: '京E·11111',
    priority: PriorityLevel.NORMAL,
    joinTime: now - 18 * 60000,
    estimatedWaitTime: 135,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'u15',
    ticketNumber: generateTicketNumber(PriorityLevel.NORMAL),
    nickname: '孙女士',
    plateNumber: '京F·22222',
    priority: PriorityLevel.NORMAL,
    joinTime: now - 20 * 60000,
    estimatedWaitTime: 180,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'u16',
    ticketNumber: generateTicketNumber(PriorityLevel.NORMAL),
    nickname: '周先生',
    plateNumber: '京G·33333',
    priority: PriorityLevel.NORMAL,
    joinTime: now - 25 * 60000,
    estimatedWaitTime: 225,
    isCurrentUser: false,
    status: 'waiting'
  },
  {
    id: 'u17',
    ticketNumber: generateTicketNumber(PriorityLevel.NORMAL),
    nickname: '吴女士',
    plateNumber: '京H·44444',
    priority: PriorityLevel.NORMAL,
    joinTime: now - 30 * 60000,
    estimatedWaitTime: 270,
    isCurrentUser: false,
    status: 'waiting'
  }
]

export const mockInsertionRecords: InsertionRecord[] = [
  {
    id: 'ins_001',
    insertedUserId: 'u10',
    insertedUserName: '救援车张师傅',
    insertedPriority: PriorityLevel.EMERGENCY,
    affectedUserIds: ['u11', 'u12', 'me', 'u14', 'u15', 'u16', 'u17'],
    affectedUserNames: ['VIP李先生', 'VIP王女士', '我', '赵先生', '孙女士', '周先生', '吴女士'],
    previousPositions: { u11: 0, u12: 1, me: 2, u14: 3, u15: 4, u16: 5, u17: 6 },
    newPositions: { u11: 1, u12: 2, me: 3, u14: 4, u15: 5, u16: 6, u17: 7 },
    timestamp: now - 2 * 60000
  },
  {
    id: 'ins_002',
    insertedUserId: 'u11',
    insertedUserName: 'VIP李先生',
    insertedPriority: PriorityLevel.VIP,
    affectedUserIds: ['me', 'u14', 'u15', 'u16', 'u17'],
    affectedUserNames: ['我', '赵先生', '孙女士', '周先生', '吴女士'],
    previousPositions: { me: 0, u14: 1, u15: 2, u16: 3, u17: 4 },
    newPositions: { me: 2, u14: 3, u15: 4, u16: 5, u17: 6 },
    timestamp: now - 8 * 60000
  }
]

export const mockCallRecords: CallRecord[] = [
  {
    id: 'call_001',
    ticketNumber: 'A6183201',
    userName: '郑先生',
    priority: PriorityLevel.NORMAL,
    calledAt: now - 5 * 60000,
    pileName: 'A03桩'
  },
  {
    id: 'call_002',
    ticketNumber: 'V6189023',
    userName: 'VIP陈先生',
    priority: PriorityLevel.VIP,
    calledAt: now - 15 * 60000,
    pileName: 'A01桩'
  },
  {
    id: 'call_003',
    ticketNumber: 'E6181098',
    userName: '应急车刘师傅',
    priority: PriorityLevel.EMERGENCY,
    calledAt: now - 30 * 60000,
    pileName: 'B01桩'
  },
  {
    id: 'call_004',
    ticketNumber: 'A6187765',
    userName: '黄女士',
    priority: PriorityLevel.NORMAL,
    calledAt: now - 45 * 60000,
    pileName: 'B03桩'
  }
]

export const getSortedQueue = () => sortQueueByPriority(mockQueueUsers)
