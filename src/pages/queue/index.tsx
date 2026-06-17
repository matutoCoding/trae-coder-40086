import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useQueueStore } from '@/store'
import { formatTimestamp, getRelativeTime } from '@/utils/time'
import QueueCard from '@/components/QueueCard'
import PriorityBadge from '@/components/PriorityBadge'
import EmptyState from '@/components/EmptyState'
import { PriorityLevel } from '@/types'
import styles from './index.module.scss'
import classnames from 'classnames'

type TabType = 'queue' | 'records' | 'calls'

const QueuePage: React.FC = () => {
  const { users, insertionRecords, callRecords, getSortedQueue, getPositionMap } = useQueueStore()
  const [activeTab, setActiveTab] = useState<TabType>('queue')
  const [refreshing, setRefreshing] = useState(false)

  const sortedQueue = useMemo(() => getSortedQueue(), [users])
  const positionMap = useMemo(() => getPositionMap(), [users])

  useEffect(() => {
    console.log('[Queue] 队列已更新，长度:', sortedQueue.length, '插队记录:', insertionRecords.length)
  }, [sortedQueue, insertionRecords])

  const waitingUsers = sortedQueue.filter(u => u.status === 'waiting')
  const vipCount = waitingUsers.filter(u => u.priority === PriorityLevel.VIP).length
  const emergencyCount = waitingUsers.filter(u => u.priority === PriorityLevel.EMERGENCY).length

  const handleRefresh = () => {
    console.log('[Queue] 刷新队列')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.showToast({ title: '刷新成功', icon: 'success' })
    }, 800)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    console.log('[Queue] 切换Tab:', tab)
  }

  return (
    <ScrollView
      scrollY
      className={styles.page}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>实时队列状态</Text>
        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>{waitingUsers.length}</Text>
            <Text className={styles.headerStatLabel}>等待人数</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>{vipCount}</Text>
            <Text className={styles.headerStatLabel}>VIP用户</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>{emergencyCount}</Text>
            <Text className={styles.headerStatLabel}>应急车辆</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'queue' })}
          onClick={() => handleTabChange('queue')}
        >
          <Text className={styles.tabText}>排队列表</Text>
        </View>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'records' })}
          onClick={() => handleTabChange('records')}
        >
          <Text className={styles.tabText}>插队记录</Text>
        </View>
        <View
          className={classnames(styles.tabItem, { [styles.active]: activeTab === 'calls' })}
          onClick={() => handleTabChange('calls')}
        >
          <Text className={styles.tabText}>叫号历史</Text>
        </View>
      </View>

      {activeTab === 'queue' && (
        <>
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>
                📋 排队中
                <Text className={styles.sectionCount}>{waitingUsers.length}人</Text>
              </Text>
            </View>
            {waitingUsers.length > 0 ? (
              waitingUsers.map(user => (
                <QueueCard
                  key={user.id}
                  user={user}
                  position={positionMap.get(user.id) || 0}
                />
              ))
            ) : (
              <EmptyState
                icon='🎉'
                title='暂无排队用户'
                description='当前无需等待，可直接前往空闲充电桩充电'
              />
            )}
          </View>
        </>
      )}

      {activeTab === 'records' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              📝 插队公平性记录
              <Text className={styles.sectionCount}>{insertionRecords.length}条</Text>
            </Text>
          </View>
          {insertionRecords.length > 0 ? (
            insertionRecords.map(record => (
              <View key={record.id} className={styles.insertionRecord}>
                <View className={styles.insertionHeader}>
                  <View className={styles.insertionWho}>
                    <Text className={styles.insertionName}>{record.insertedUserName}</Text>
                    <PriorityBadge priority={record.insertedPriority} size='sm' />
                    <Text className={styles.insertionTime}>插队加入</Text>
                  </View>
                </View>
                <Text className={styles.insertionTime} style={{ marginBottom: '16rpx' }}>
                  发生时间：{formatTimestamp(record.timestamp)}
                </Text>
                <View className={styles.insertionBody}>
                  <Text className={styles.insertionTitle}>影响用户位置变动（共{record.affectedUserIds.length}人）：</Text>
                  <View className={styles.insertionList}>
                    {record.affectedUserNames.slice(0, 5).map((name, idx) => {
                      const userId = record.affectedUserIds[idx]
                      return (
                        <View key={idx} className={styles.insertionItem}>
                          <Text className={styles.insertionItemName}>{name}</Text>
                          <View className={styles.positionChange}>
                            <Text className={styles.oldPos}>#{(record.previousPositions[userId] || 0) + 1}</Text>
                            <Text className={styles.arrowIcon}>→</Text>
                            <Text className={styles.newPos}>#{(record.newPositions[userId] || 0) + 1}</Text>
                          </View>
                        </View>
                      )
                    })}
                    {record.affectedUserIds.length > 5 && (
                      <Text className={styles.insertionItemName} style={{ textAlign: 'center', color: '#86909C' }}>
                        ... 另有 {record.affectedUserIds.length - 5} 人受影响
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon='✅'
              title='暂无插队记录'
              description='当前队列为纯先到先得，无高优先级用户插队'
            />
          )}
        </View>
      )}

      {activeTab === 'calls' && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              🔔 叫号历史
              <Text className={styles.sectionCount}>{callRecords.length}条</Text>
            </Text>
          </View>
          {callRecords.length > 0 ? (
            callRecords.map(record => (
              <View key={record.id} className={styles.callRecordCard}>
                <View className={styles.callPile}>
                  <Text className={styles.callPileText}>{record.pileName.replace('桩', '')}</Text>
                </View>
                <View className={styles.callInfo}>
                  <View className={styles.callRow1}>
                    <Text className={styles.callUserName}>{record.userName}</Text>
                    <PriorityBadge priority={record.priority} size='sm' />
                  </View>
                  <Text className={styles.callTicket}>票号 {record.ticketNumber} · {record.pileName}</Text>
                  <Text className={styles.callTimeText}>{getRelativeTime(record.calledAt)} · {formatTimestamp(record.calledAt, 'HH:mm')}</Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon='⏰'
              title='暂无叫号记录'
              description='有桩位空闲后会按队列优先级自动叫号'
            />
          )}
        </View>
      )}
    </ScrollView>
  )
}

export default QueuePage
