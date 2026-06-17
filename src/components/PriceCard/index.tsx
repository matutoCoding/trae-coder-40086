import React from 'react'
import { View, Text } from '@tarojs/components'
import { PricePeriod, PricePeriodLabel } from '@/types'
import { getPeriodColor } from '@/utils/billing'
import styles from './index.module.scss'
import classnames from 'classnames'

interface PriceCardProps {
  period: PricePeriod
  isCurrent?: boolean
}

const PriceCard: React.FC<PriceCardProps> = ({ period, isCurrent = false }) => {
  const periodColor = getPeriodColor(period.type)
  const totalPrice = (period.pricePerKwh + period.serviceFee).toFixed(2)

  return (
    <View className={classnames(styles.card, { [styles.isCurrent]: isCurrent })}>
      <View className={styles.header} style={{ background: periodColor }}>
        <Text className={styles.periodLabel}>{PricePeriodLabel[period.type]}</Text>
        {isCurrent && (
          <View className={styles.currentTag}>
            <Text className={styles.currentText}>当前</Text>
          </View>
        )}
      </View>

      <View className={styles.body}>
        <View className={styles.timeRow}>
          <Text className={styles.timeText}>{period.startTime} - {period.endTime}</Text>
        </View>

        <View className={styles.priceRows}>
          <View className={styles.priceItem}>
            <Text className={styles.priceLabel}>电费</Text>
            <Text className={styles.priceValue}>¥{period.pricePerKwh.toFixed(2)}</Text>
          </View>
          <View className={styles.priceItem}>
            <Text className={styles.priceLabel}>服务费</Text>
            <Text className={styles.priceValue}>¥{period.serviceFee.toFixed(2)}</Text>
          </View>
        </View>

        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>¥{totalPrice}/度</Text>
        </View>
      </View>
    </View>
  )
}

export default PriceCard
