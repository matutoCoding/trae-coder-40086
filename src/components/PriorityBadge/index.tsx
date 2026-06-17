import React from 'react'
import { View, Text } from '@tarojs/components'
import { PriorityLevel, PriorityLabel } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

interface PriorityBadgeProps {
  priority: PriorityLevel
  size?: 'sm' | 'md' | 'lg'
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const label = PriorityLabel[priority]

  const badgeClass = classnames(styles.badge, {
    [styles.emergency]: priority === PriorityLevel.EMERGENCY,
    [styles.vip]: priority === PriorityLevel.VIP,
    [styles.normal]: priority === PriorityLevel.NORMAL,
    [styles.sizeSm]: size === 'sm',
    [styles.sizeMd]: size === 'md',
    [styles.sizeLg]: size === 'lg'
  })

  return (
    <View className={badgeClass}>
      <Text className={styles.text}>{label}</Text>
    </View>
  )
}

export default PriorityBadge
