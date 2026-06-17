import React from 'react'
import { View, Text } from '@tarojs/components'
import { ChargingPile as ChargingPileType, PileStatusLabel } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

interface ChargingPileProps {
  pile: ChargingPileType
  onClick?: () => void
}

const ChargingPileComponent: React.FC<ChargingPileProps> = ({ pile, onClick }) => {
  const containerClass = classnames(styles.pileCard, {
    [styles.idle]: pile.status === 'idle',
    [styles.charging]: pile.status === 'charging',
    [styles.maintenance]: pile.status === 'maintenance',
    [styles.reserved]: pile.status === 'reserved'
  })

  const statusDotClass = classnames(styles.statusDot, {
    [styles.dotIdle]: pile.status === 'idle',
    [styles.dotCharging]: pile.status === 'charging',
    [styles.dotMaintenance]: pile.status === 'maintenance'
  })

  return (
    <View className={containerClass} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.pileName}>{pile.name}</Text>
        <View className={styles.statusWrap}>
          <View className={statusDotClass}></View>
          <Text className={styles.statusText}>{PileStatusLabel[pile.status]}</Text>
        </View>
      </View>

      <View className={styles.powerInfo}>
        <Text className={styles.powerLabel}>功率</Text>
        <Text className={styles.powerValue}>{pile.power}kW</Text>
      </View>

      {pile.status === 'charging' && (
        <View className={styles.chargingSection}>
          <View className={styles.progressWrap}>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${pile.progress || 0}%` }}></View>
            </View>
            <Text className={styles.progressText}>{pile.progress}%</Text>
          </View>
          <Text className={styles.userHint}>充电中 · {pile.currentUser}</Text>
        </View>
      )}

      {pile.status === 'idle' && (
        <View className={styles.idleSection}>
          <Text className={styles.idleText}>✓ 立即可用</Text>
        </View>
      )}

      {pile.status === 'maintenance' && (
        <View className={styles.maintSection}>
          <Text className={styles.maintText}>设备维护中</Text>
        </View>
      )}
    </View>
  )
}

export default ChargingPileComponent
