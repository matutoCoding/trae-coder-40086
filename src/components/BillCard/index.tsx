import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Bill } from '@/types'
import { formatTimestamp, formatDuration } from '@/utils/time'
import styles from './index.module.scss'
import classnames from 'classnames'

interface BillCardProps {
  bill: Bill
  onClick?: () => void
}

const statusLabel: Record<Bill['status'], string> = {
  pending: '待支付',
  paid: '已支付',
  completed: '已完成',
  refunded: '已退款'
}

const BillCard: React.FC<BillCardProps> = ({ bill, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({ url: `/pages/bill-detail/index?id=${bill.id}` })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.orderInfo}>
          <Text className={styles.pileName}>{bill.pileName}</Text>
          <Text className={styles.orderNo}>订单号 {bill.orderNo}</Text>
        </View>
        <View className={classnames(styles.statusTag, {
          [styles.statusPending]: bill.status === 'pending',
          [styles.statusPaid]: bill.status === 'paid',
          [styles.statusCompleted]: bill.status === 'completed'
        })}>
          <Text className={styles.statusText}>{statusLabel[bill.status]}</Text>
        </View>
      </View>

      <View className={styles.body}>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>充电时段</Text>
            <Text className={styles.infoValue}>
              {formatTimestamp(bill.startTime, 'MM-DD HH:mm')} ~ {formatTimestamp(bill.endTime, 'HH:mm')}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>充电时长</Text>
            <Text className={styles.infoValue}>{formatDuration(bill.totalDurationMinutes)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>充电量</Text>
            <Text className={styles.infoValue}>{bill.totalEnergyKwh.toFixed(2)} 度</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>分段数</Text>
            <Text className={styles.infoValue}>{bill.segments.length} 段</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.segPreview}>
          {bill.segments.slice(0, 3).map((seg, idx) => (
            <View key={idx} className={styles.segDot}></View>
          ))}
        </View>
        <View className={styles.amountWrap}>
          <Text className={styles.amountLabel}>实付金额</Text>
          <Text className={styles.amountValue}>¥{bill.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )
}

export default BillCard
