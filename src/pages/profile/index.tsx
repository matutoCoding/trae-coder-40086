import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useQueueStore, useBillingStore } from '@/store'
import { formatTimestamp } from '@/utils/time'
import PriorityBadge from '@/components/PriorityBadge'
import { PriorityLevel } from '@/types'
import styles from './index.module.scss'

const ProfilePage: React.FC = () => {
  const { users, insertionRecords } = useQueueStore()
  const { getTotalStats } = useBillingStore()
  const stats = getTotalStats()

  const currentUserId = useMemo(() => {
    const me = users.find(u => u.isCurrentUser)
    return me?.id || 'me'
  }, [users])

  const myAffectedRecords = useMemo(() =>
    insertionRecords.filter(r => r.affectedUserIds.includes(currentUserId)),
    [insertionRecords, currentUserId]
  )

  const myInsertions = useMemo(() =>
    insertionRecords.filter(r =>
      r.insertedUserId === currentUserId || r.affectedUserIds.includes(currentUserId)
    ),
    [insertionRecords, currentUserId]
  )

  const totalCharges = stats.totalCount
  const totalKwh = stats.totalEnergyKwh
  const totalSaved = 682.3

  const handleMenuClick = (menu: string) => {
    console.log('[Profile] 点击菜单:', menu)
    Taro.showToast({ title: `${menu}功能开发中`, icon: 'none' })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerSection}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>我</Text>
          </View>
          <View className={styles.userInfo}>
            <View className={styles.userNameRow}>
              <Text className={styles.userName}>绿能用户</Text>
            </View>
            <Text className={styles.userPhone}>138****9999</Text>
            <View className={styles.userVipRow}>
              <View className={styles.vipTag}>
                <Text className={styles.vipText}>⭐ VIP会员</Text>
              </View>
              <Text className={styles.vipExpire}>有效期至 2026-12-31</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statsGrid}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{totalCharges}</Text>
            <Text className={styles.statsLabel}>充电次数</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{totalKwh.toFixed(0)}</Text>
            <Text className={styles.statsLabel}>累计度数</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>¥{totalSaved.toFixed(0)}</Text>
            <Text className={styles.statsLabel}>累计节省</Text>
          </View>
        </View>
      </View>

      <View className={styles.balanceCard}>
        <View className={styles.balanceInfo}>
          <Text className={styles.balanceLabel}>账户余额</Text>
          <Text className={styles.balanceValue}>¥ 888.50</Text>
        </View>
        <View className={styles.topupBtn} onClick={() => handleMenuClick('充值')}>
          <Text className={styles.topupText}>充值</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>车辆管理</View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('我的车辆')}>
          <View className={styles.menuIcon}>🚗</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>我的车辆</Text>
              <View style={{ marginTop: '8rpx' }} className={styles.plateList}>
                <View className={styles.plateTag}>
                  <Text className={styles.plateText}>京D·99999</Text>
                </View>
              </View>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>公平透明</View>
        <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/queue/index' })}>
          <View className={styles.menuIcon}>📝</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>插队公平性记录</Text>
              <Text style={{ marginTop: '8rpx' }} className={styles.menuHint}>
                您被插队 {myAffectedRecords.length} 次，影响 {myInsertions.length} 条记录
              </Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('VIP权益')}>
          <View className={styles.menuIcon}>⭐</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>VIP 插队权益</Text>
              <Text style={{ marginTop: '8rpx' }} className={styles.menuHint}>
                优先级1级，自动排在普通用户之前
              </Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>账单与支付</View>
        <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/bills/index' })}>
          <View className={styles.menuIcon}>📋</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>我的账单</Text>
              <Text style={{ marginTop: '8rpx' }} className={styles.menuHint}>分段计费明细 · 透明可查</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.switchTab({ url: '/pages/pricing/index' })}>
          <View className={styles.menuIcon}>💰</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>时段费率表</Text>
              <Text style={{ marginTop: '8rpx' }} className={styles.menuHint}>尖峰/高峰/平峰/谷峰 四档</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('支付设置')}>
          <View className={styles.menuIcon}>💳</View>
          <View className={styles.menuContent}>
            <View>
              <Text className={styles.menuTitle}>支付方式</Text>
              <Text style={{ marginTop: '8rpx' }} className={styles.menuHint}>余额优先 · 微信/支付宝</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuHeader}>其他</View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('消息通知')}>
          <View className={styles.menuIcon}>🔔</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>消息通知</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('帮助中心')}>
          <View className={styles.menuIcon}>❓</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>帮助中心</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('联系客服')}>
          <View className={styles.menuIcon}>🎧</View>
          <View className={styles.menuContent}>
            <Text className={styles.menuTitle}>联系客服</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ProfilePage
