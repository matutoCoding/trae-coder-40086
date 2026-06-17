import React from 'react'
import { View, Text } from '@tarojs/components'
import { QueueUser } from '@/types'
import PriorityBadge from '@/components/PriorityBadge'
import { formatTimestamp, formatDuration } from '@/utils/time'
import styles from './index.module.scss'
import classnames from 'classnames'

interface QueueCardProps {
  user: QueueUser
  position: number
}

const QueueCard: React.FC<QueueCardProps> = ({ user, position }) => {
  const isTopThree = position <= 3

  return (
    <View className={classnames(styles.card, {
      [styles.isMe]: user.isCurrentUser,
      [styles.topThree]: isTopThree
    })}>
      <View className={classnames(styles.position, {
        [styles.posEmergency]: position === 1,
        [styles.posVip]: position === 2,
        [styles.posTop]: position === 3
      })}>
        <Text className={styles.posText}>#{position}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.row1}>
          <View className={styles.nameRow}>
            <Text className={styles.nickname}>{user.nickname}</Text>
            <PriorityBadge priority={user.priority} size='sm' />
          </View>
          <Text className={styles.ticketNo}>{user.ticketNumber}</Text>
        </View>

        <View className={styles.row2}>
          <Text className={styles.plate}>{user.plateNumber}</Text>
          {user.isCurrentUser && (
            <View className={styles.meTag}>
              <Text className={styles.meText}>我</Text>
            </View>
          )}
        </View>

        <View className={styles.row3}>
          <Text className={styles.joinTime}>
            取号于 {formatTimestamp(user.joinTime, 'HH:mm')}
          </Text>
          {user.estimatedWaitTime > 0 && (
            <Text className={styles.waitTime}>
              预计等待 {formatDuration(user.estimatedWaitTime)}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default QueueCard
