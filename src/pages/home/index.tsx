import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockChargingPiles, mockQueueUsers, mockCallRecords } from '@/data/mockQueue'
import { sortQueueByPriority, calculateQueuePositions } from '@/utils/queue'
import { formatDuration, getRelativeTime } from '@/utils/time'
import ChargingPileComponent from '@/components/ChargingPile'
import PriorityBadge from '@/components/PriorityBadge'
import { PriorityLevel } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

const HomePage: React.FC = () => {
  const [sortedQueue, setSortedQueue] = useState(sortQueueByPriority(mockQueueUsers))
  const [positionMap, setPositionMap] = useState<Map<string, number>>(new Map())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const sorted = sortQueueByPriority(mockQueueUsers)
    setSortedQueue(sorted)
    setPositionMap(calculateQueuePositions(sorted))
    console.log('[Home] 初始化队列数据，队列长度:', sorted.length)
  }, [])

  const myUser = sortedQueue.find(u => u.isCurrentUser)
  const myPosition = myUser ? positionMap.get(myUser.id) : 0

  const idleCount = mockChargingPiles.filter(p => p.status === 'idle').length
  const chargingCount = mockChargingPiles.filter(p => p.status === 'charging').length
  const waitingCount = sortedQueue.filter(u => u.status === 'waiting').length

  const latestCall = mockCallRecords[0]

  const handlePullDownRefresh = () => {
    console.log('[Home] 下拉刷新')
    setRefreshing(true)
    setTimeout(() => {
      const sorted = sortQueueByPriority(mockQueueUsers)
      setSortedQueue(sorted)
      setPositionMap(calculateQueuePositions(sorted))
      setRefreshing(false)
      Taro.stopPullDownRefresh()
      Taro.showToast({ title: '刷新成功', icon: 'success' })
    }, 800)
  }

  useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handlePullDownRefresh)
    return () => Taro.eventCenter.off('__taroPullDownRefresh', handlePullDownRefresh)
  }, [])

  const handleGetNumber = (priority: PriorityLevel) => {
    console.log('[Home] 取号请求，优先级:', priority)
    const priorityName = {
      [PriorityLevel.NORMAL]: '普通',
      [PriorityLevel.VIP]: 'VIP',
      [PriorityLevel.EMERGENCY]: '应急'
    }[priority]

    Taro.showModal({
      title: '确认取号',
      content: `确定要取${priorityName}排队号吗？${priority === PriorityLevel.EMERGENCY ? '应急通道仅限救援车辆使用。' : ''}`,
      confirmText: '确认取号',
      confirmColor: '#00c853',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '取号成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/queue/index' })
          }, 1500)
        }
      }
    })
  }

  return (
    <ScrollView
      scrollY
      className={styles.page}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handlePullDownRefresh}
    >
      <View className={styles.heroSection}>
        <View className={styles.heroCard}>
          <Text className={styles.heroTitle}>绿能充电站</Text>
          <Text className={styles.heroSubtitle}>智能排队 · 分段计费 · 公平透明</Text>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{idleCount}</Text>
              <Text className={styles.statLabel}>空闲桩位</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{chargingCount}</Text>
              <Text className={styles.statLabel}>充电中</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{waitingCount}</Text>
              <Text className={styles.statLabel}>等待中</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快速取号</Text>
        </View>

        <View className={styles.actionGrid}>
          <View
            className={classnames(styles.actionCard, styles.actionEmergency)}
            onClick={() => handleGetNumber(PriorityLevel.EMERGENCY)}
          >
            <Text className={styles.actionIcon}>🚨</Text>
            <Text className={styles.actionTitle}>应急通道</Text>
            <Text className={styles.actionDesc}>救援车辆优先排队\n立即插入队列最前</Text>
          </View>

          <View
            className={classnames(styles.actionCard, styles.actionVip)}
            onClick={() => handleGetNumber(PriorityLevel.VIP)}
          >
            <Text className={styles.actionIcon}>⭐</Text>
            <Text className={styles.actionTitle}>VIP 专属</Text>
            <Text className={styles.actionDesc}>会员用户优享排队\n插队在普通用户前</Text>
          </View>

          <View
            className={classnames(styles.actionCard, styles.actionNormal)}
            onClick={() => handleGetNumber(PriorityLevel.NORMAL)}
            style={{ gridColumn: 'span 2' }}
          >
            <Text className={styles.actionIcon}>🔋</Text>
            <Text className={styles.actionTitle}>普通取号</Text>
            <Text className={styles.actionDesc}>标准排队通道，按优先级与先来后到顺序叫号</Text>
          </View>
        </View>
      </View>

      {latestCall && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>最新叫号</Text>
            <Text className={styles.sectionAction} onClick={() => Taro.switchTab({ url: '/pages/queue/index' })}>查看全部</Text>
          </View>
          <View className={styles.currentCallCard}>
            <Text className={styles.callLabel}>📢 刚刚叫号</Text>
            <View className={styles.callInfo}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <Text className={styles.callUser}>{latestCall.userName}</Text>
                <PriorityBadge priority={latestCall.priority} size='sm' />
              </View>
              <Text className={styles.callPile}>{latestCall.pileName}</Text>
            </View>
            <Text className={styles.callTime}>票号 {latestCall.ticketNumber} · {getRelativeTime(latestCall.calledAt)}</Text>
          </View>
        </View>
      )}

      {myUser && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的排队</Text>
          </View>
          <View className={styles.myQueueCard}>
            <View className={styles.myQueueHeader}>
              <Text className={styles.myQueueTitle}>{myUser.nickname} · {myUser.ticketNumber}</Text>
              <PriorityBadge priority={myUser.priority} />
            </View>
            <View className={styles.myQueueBody}>
              <View className={styles.myQueueInfo}>
                <Text className={styles.myQueuePos}>#{myPosition}</Text>
                <Text className={styles.myQueuePosLabel}>当前位置</Text>
              </View>
              <View className={styles.myQueueDetail}>
                <View className={styles.myQueueRow}>
                  <Text className={styles.myQueueLabel}>车牌</Text>
                  <Text className={styles.myQueueValue}>{myUser.plateNumber}</Text>
                </View>
                <View className={styles.myQueueRow}>
                  <Text className={styles.myQueueLabel}>预计等待</Text>
                  <Text className={styles.myQueueValue} style={{ color: '#00c853' }}>{formatDuration(myUser.estimatedWaitTime)}</Text>
                </View>
                <View className={styles.myQueueRow}>
                  <Text className={styles.myQueueLabel}>前面还有</Text>
                  <Text className={styles.myQueueValue}>{(myPosition || 1) - 1} 人</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>充电桩状态</Text>
        </View>
        <View className={styles.pilesGrid}>
          {mockChargingPiles.map(pile => (
            <ChargingPileComponent key={pile.id} pile={pile} />
          ))}
        </View>
        <View className={styles.sectionTip}>
          <Text className={styles.sectionTipText}>💡 桩位空闲后将按队列优先级自动叫号，应急车辆和VIP用户享有优先插队权，同级内按先来后到顺序。</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage
