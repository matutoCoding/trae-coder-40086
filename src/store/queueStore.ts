import { create } from 'zustand'
import { QueueUser, PriorityLevel, InsertionRecord, CallRecord, ChargingPile } from '@/types'
import { insertIntoQueue, generateTicketNumber, sortQueueByPriority, calculateQueuePositions, estimateWaitTime } from '@/utils/queue'
import { mockQueueUsers, mockInsertionRecords, mockCallRecords, mockChargingPiles } from '@/data/mockQueue'

interface QueueState {
  users: QueueUser[]
  insertionRecords: InsertionRecord[]
  callRecords: CallRecord[]
  piles: ChargingPile[]
  currentUserId: string
  addUserToQueue: (priority: PriorityLevel, nickname: string, plateNumber: string) => {
    newQueue: QueueUser[]
    record?: InsertionRecord
    ticketNumber: string
  }
  removeUserFromQueue: (userId: string) => void
  callNextUser: (pileId: string) => CallRecord | null
  updatePileProgress: (pileId: string, progress: number) => void
  getPosition: (userId: string) => number
  getSortedQueue: () => QueueUser[]
  getPositionMap: () => Map<string, number>
}

export const useQueueStore = create<QueueState>((set, get) => ({
  users: [...mockQueueUsers],
  insertionRecords: [...mockInsertionRecords],
  callRecords: [...mockCallRecords],
  piles: [...mockChargingPiles],
  currentUserId: 'me',

  addUserToQueue: (priority, nickname, plateNumber) => {
    const { users, insertionRecords } = get()
    const now = Date.now()

    const newUser: QueueUser = {
      id: `user_${now}_${Math.random().toString(36).substr(2, 9)}`,
      ticketNumber: generateTicketNumber(priority),
      nickname,
      plateNumber,
      priority,
      joinTime: now,
      estimatedWaitTime: 0,
      isCurrentUser: true,
      status: 'waiting'
    }

    const existingWithCurrent = users.find(u => u.isCurrentUser)
    let usersToProcess = users
    if (existingWithCurrent) {
      usersToProcess = users.map(u => ({ ...u, isCurrentUser: false }))
    }

    const { newQueue, record } = insertIntoQueue(usersToProcess, newUser)

    const positionMap = calculateQueuePositions(newQueue)
    const myPosition = positionMap.get(newUser.id) || 1
    newUser.estimatedWaitTime = estimateWaitTime(newQueue, myPosition - 1, 45, 6)

    const finalQueue = newQueue.map(u => {
      const pos = positionMap.get(u.id) || 1
      return {
        ...u,
        estimatedWaitTime: estimateWaitTime(newQueue, pos - 1, 45, 6)
      }
    })

    const newInsertionRecords = record
      ? [record, ...insertionRecords]
      : insertionRecords

    set({
      users: finalQueue,
      insertionRecords: newInsertionRecords
    })

    console.log('[QueueStore] 新增用户:', newUser.nickname, '优先级:', priority, '位置:', myPosition)
    if (record) {
      console.log('[QueueStore] 产生插队记录，影响', record.affectedUserIds.length, '人')
    }

    return {
      newQueue: finalQueue,
      record,
      ticketNumber: newUser.ticketNumber
    }
  },

  removeUserFromQueue: (userId) => {
    set(state => ({
      users: state.users.filter(u => u.id !== userId)
    }))
    console.log('[QueueStore] 移除用户:', userId)
  },

  callNextUser: (pileId) => {
    const { users, piles, callRecords } = get()
    const waitingUsers = users.filter(u => u.status === 'waiting')
    const sorted = sortQueueByPriority(waitingUsers)

    if (sorted.length === 0) {
      console.log('[QueueStore] 队列为空，无法叫号')
      return null
    }

    const nextUser = sorted[0]
    const pile = piles.find(p => p.id === pileId)
    if (!pile) {
      console.error('[QueueStore] 找不到桩位:', pileId)
      return null
    }

    const callRecord: CallRecord = {
      id: `call_${Date.now()}`,
      ticketNumber: nextUser.ticketNumber,
      userName: nextUser.nickname,
      priority: nextUser.priority,
      calledAt: Date.now(),
      pileName: pile.name
    }

    set(state => ({
      users: state.users.map(u =>
        u.id === nextUser.id ? { ...u, status: 'charging' as const } : u
      ),
      piles: state.piles.map(p =>
        p.id === pileId
          ? { ...p, status: 'charging' as const, currentUser: nextUser.nickname, startedAt: Date.now(), progress: 0 }
          : p
      ),
      callRecords: [callRecord, ...state.callRecords]
    }))

    console.log('[QueueStore] 叫号:', nextUser.nickname, '到', pile.name)
    return callRecord
  },

  updatePileProgress: (pileId, progress) => {
    set(state => ({
      piles: state.piles.map(p =>
        p.id === pileId ? { ...p, progress } : p
      )
    }))
  },

  getPosition: (userId) => {
    const { users } = get()
    const positionMap = calculateQueuePositions(users)
    return positionMap.get(userId) || 0
  },

  getSortedQueue: () => {
    const { users } = get()
    return sortQueueByPriority(users)
  },

  getPositionMap: () => {
    const { users } = get()
    return calculateQueuePositions(users)
  }
}))
