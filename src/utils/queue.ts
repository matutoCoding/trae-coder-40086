import { PriorityLevel, QueueUser, InsertionRecord } from '@/types'

export function sortQueueByPriority(users: QueueUser[]): QueueUser[] {
  return [...users].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority
    }
    return a.joinTime - b.joinTime
  })
}

export function findInsertPosition(
  queue: QueueUser[],
  newUser: QueueUser
): { position: number; affectedUsers: QueueUser[] } {
  const sortedQueue = sortQueueByPriority(queue)

  let insertIndex = sortedQueue.length
  const affected: QueueUser[] = []

  for (let i = 0; i < sortedQueue.length; i++) {
    const current = sortedQueue[i]
    if (newUser.priority > current.priority) {
      insertIndex = i
      for (let j = i; j < sortedQueue.length; j++) {
        if (sortedQueue[j].priority < newUser.priority) {
          affected.push(sortedQueue[j])
        }
      }
      break
    }
  }

  return { position: insertIndex, affectedUsers: affected }
}

export function insertIntoQueue(
  queue: QueueUser[],
  newUser: QueueUser
): { newQueue: QueueUser[]; record?: InsertionRecord } {
  const { position, affectedUsers } = findInsertPosition(queue, newUser)

  const sortedQueue = sortQueueByPriority(queue)
  const previousPositions: Record<string, number> = {}
  const newPositions: Record<string, number> = {}

  if (affectedUsers.length > 0 && newUser.priority !== PriorityLevel.NORMAL) {
    const currentQueue = [...sortedQueue]
    currentQueue.forEach((u, idx) => {
      if (affectedUsers.some(au => au.id === u.id)) {
        previousPositions[u.id] = idx
      }
    })

    const newQueue = [
      ...currentQueue.slice(0, position),
      newUser,
      ...currentQueue.slice(position)
    ]

    newQueue.forEach((u, idx) => {
      if (affectedUsers.some(au => au.id === u.id)) {
        newPositions[u.id] = idx
      }
    })

    const record: InsertionRecord = {
      id: `ins_${Date.now()}`,
      insertedUserId: newUser.id,
      insertedUserName: newUser.nickname,
      insertedPriority: newUser.priority,
      affectedUserIds: affectedUsers.map(u => u.id),
      affectedUserNames: affectedUsers.map(u => u.nickname),
      previousPositions,
      newPositions,
      timestamp: Date.now()
    }

    return { newQueue, record }
  }

  const newQueue = [
    ...sortedQueue.slice(0, position),
    newUser,
    ...sortedQueue.slice(position)
  ]

  return { newQueue }
}

export function generateTicketNumber(priority: PriorityLevel): string {
  const now = new Date()
  const dateStr = `${now.getMonth() + 1}${now.getDate()}`
  const random = Math.floor(Math.random() * 9000 + 1000)

  const prefix = {
    [PriorityLevel.NORMAL]: 'A',
    [PriorityLevel.VIP]: 'V',
    [PriorityLevel.EMERGENCY]: 'E'
  }[priority]

  return `${prefix}${dateStr}${random}`
}

export function estimateWaitTime(
  queue: QueueUser[],
  position: number,
  avgChargeMinutes: number = 45,
  totalPiles: number = 6
): number {
  const aheadCount = position
  const concurrentCycles = Math.ceil(aheadCount / totalPiles)
  return concurrentCycles * avgChargeMinutes
}

export function calculateQueuePositions(queue: QueueUser[]): Map<string, number> {
  const sorted = sortQueueByPriority(queue)
  const positionMap = new Map<string, number>()
  sorted.forEach((user, index) => {
    positionMap.set(user.id, index + 1)
  })
  return positionMap
}
