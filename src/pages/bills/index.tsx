import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockBills } from '@/data/mockBills'
import { Bill } from '@/types'
import { formatTimestamp } from '@/utils/time'
import BillCard from '@/components/BillCard'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'
import classnames from 'classnames'

type FilterType = 'all' | 'pending' | 'paid' | 'completed'

const BillsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredBills = useMemo(() => {
    if (filter === 'all') return mockBills
    return mockBills.filter(b => b.status === filter)
  }, [filter])

  const totalAmount = mockBills.reduce((acc, b) => acc + b.totalAmount, 0)
  const totalKwh = mockBills.reduce((acc, b) => acc + b.totalEnergyKwh, 0)
  const pendingCount = mockBills.filter(b => b.status === 'pending').length

  const groupedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {}
    filteredBills.forEach(bill => {
      const month = formatTimestamp(bill.startTime, 'YYYY年MM月')
      if (!groups[month]) groups[month] = []
      groups[month].push(bill)
    })
    return groups
  }, [filteredBills])

  const handleFilterChange = (f: FilterType) => {
    setFilter(f)
    console.log('[Bills] 筛选变更:', f)
  }

  const handleBillClick = (bill: Bill) => {
    console.log('[Bills] 查看账单详情:', bill.id)
    Taro.navigateTo({ url: `/pages/bill-detail/index?id=${bill.id}` })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>累计充电消费</Text>
        <Text className={styles.summaryAmount}>¥{totalAmount.toFixed(2)}</Text>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>{mockBills.length}</Text>
            <Text className={styles.summaryItemLabel}>充电次数</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>{totalKwh.toFixed(1)}</Text>
            <Text className={styles.summaryItemLabel}>总电量(度)</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>{pendingCount}</Text>
            <Text className={styles.summaryItemLabel}>待支付</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        <View
          className={classnames(styles.filterItem, { [styles.active]: filter === 'all' })}
          onClick={() => handleFilterChange('all')}
        >
          <Text className={styles.filterText}>全部</Text>
        </View>
        <View
          className={classnames(styles.filterItem, { [styles.active]: filter === 'pending' })}
          onClick={() => handleFilterChange('pending')}
        >
          <Text className={styles.filterText}>待支付{pendingCount > 0 ? `(${pendingCount})` : ''}</Text>
        </View>
        <View
          className={classnames(styles.filterItem, { [styles.active]: filter === 'paid' })}
          onClick={() => handleFilterChange('paid')}
        >
          <Text className={styles.filterText}>已支付</Text>
        </View>
        <View
          className={classnames(styles.filterItem, { [styles.active]: filter === 'completed' })}
          onClick={() => handleFilterChange('completed')}
        >
          <Text className={styles.filterText}>已完成</Text>
        </View>
      </View>

      <View className={styles.billsList}>
        {Object.keys(groupedBills).length > 0 ? (
          Object.entries(groupedBills).map(([month, bills]) => {
            const monthTotal = bills.reduce((a, b) => a + b.totalAmount, 0)
            const monthKwh = bills.reduce((a, b) => a + b.totalEnergyKwh, 0)
            return (
              <View key={month}>
                <View className={styles.groupHeader}>
                  <Text className={styles.groupMonth}>{month}</Text>
                  <Text className={styles.groupStats}>
                    {bills.length}笔 · ¥{monthTotal.toFixed(2)} · {monthKwh.toFixed(1)}度
                  </Text>
                </View>
                {bills.map(bill => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onClick={() => handleBillClick(bill)}
                  />
                ))}
              </View>
            )
          })
        ) : (
          <EmptyState
            icon='📄'
            title='暂无账单记录'
            description='完成充电后会在这里生成您的账单'
          />
        )}
      </View>
    </ScrollView>
  )
}

export default BillsPage
