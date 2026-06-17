import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { pricePeriods } from '@/data/mockPricing'
import { getCurrentPeriod, getPeriodColor } from '@/utils/billing'
import { calculateBillingSegments, summarizeBill } from '@/utils/billing'
import { PricePeriodLabel, PricePeriodType } from '@/types'
import PriceCard from '@/components/PriceCard'
import styles from './index.module.scss'
import classnames from 'classnames'

const PricingPage: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod(pricePeriods))
  const [nowTime, setNowTime] = useState(Date.now())
  const [chargeHours, setChargeHours] = useState(2)
  const [chargePower, setChargePower] = useState(7)

  useEffect(() => {
    console.log('[Pricing] 初始化费率页面，当前时段:', currentPeriod?.type)
    const timer = setInterval(() => {
      const now = Date.now()
      setNowTime(now)
      setCurrentPeriod(getCurrentPeriod(pricePeriods, now))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const startTime = Date.now()
  const endTime = startTime + chargeHours * 3600000
  const segments = calculateBillingSegments(pricePeriods, startTime, endTime, chargePower)
  const summary = summarizeBill(segments)

  const formatNowTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const handleHoursChange = (delta: number) => {
    setChargeHours(prev => Math.max(0.5, Math.min(12, parseFloat((prev + delta).toFixed(1)))))
  }

  const handlePowerChange = (delta: number) => {
    setChargePower(prev => Math.max(3, Math.min(120, prev + delta)))
  }

  return (
    <View className={styles.page}>
      <View className={styles.timelineSection}>
        {currentPeriod && (
          <View className={styles.currentPeriodCard}>
            <Text className={styles.currentLabel}>⚡ 当前时段 · {formatNowTime(nowTime)}</Text>
            <Text className={styles.currentType}>{PricePeriodLabel[currentPeriod.type]}</Text>
            <Text className={styles.currentTime}>{currentPeriod.startTime} - {currentPeriod.endTime}</Text>
            <View className={styles.currentPrices}>
              <View className={styles.currentPriceItem}>
                <Text className={styles.currentPriceValue}>¥{currentPeriod.pricePerKwh.toFixed(2)}</Text>
                <Text className={styles.currentPriceLabel}>电费/度</Text>
              </View>
              <View className={styles.currentPriceItem}>
                <Text className={styles.currentPriceValue}>¥{currentPeriod.serviceFee.toFixed(2)}</Text>
                <Text className={styles.currentPriceLabel}>服务费/度</Text>
              </View>
              <View className={styles.currentPriceItem}>
                <Text className={styles.currentPriceValue}>¥{(currentPeriod.pricePerKwh + currentPeriod.serviceFee).toFixed(2)}</Text>
                <Text className={styles.currentPriceLabel}>合计/度</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🕐 今日时段费率表</Text>
        </View>

        <View className={styles.timeline}>
          <Text className={styles.timelineTitle}>24小时费率时间轴</Text>
          {pricePeriods.map((period, index) => (
            <View key={index} className={styles.timelineItem}>
              <View
                className={styles.timelineDot}
                style={{ background: getPeriodColor(period.type) }}
              ></View>
              <View className={styles.timelineContent}>
                <View className={styles.timelineRow}>
                  <View className={styles.timelinePeriod}>
                    <Text className={styles.periodName}>{PricePeriodLabel[period.type]}</Text>
                  </View>
                  <Text className={styles.periodPrice}>¥{(period.pricePerKwh + period.serviceFee).toFixed(2)}/度</Text>
                </View>
                <Text className={styles.periodTime}>{period.startTime} - {period.endTime}</Text>
                <View className={styles.periodDetail}>
                  <Text className={styles.periodDetailItem}>电费 ¥{period.pricePerKwh.toFixed(2)}</Text>
                  <Text className={styles.periodDetailItem}>服务费 ¥{period.serviceFee.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.priceListSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>💰 费率详情卡片</Text>
        </View>
        {pricePeriods.map((period, index) => (
          <PriceCard
            key={index}
            period={period}
            isCurrent={currentPeriod?.startTime === period.startTime && currentPeriod?.endTime === period.endTime}
          />
        ))}
      </View>

      <View className={styles.calcSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🧮 分段计费计算器</Text>
        </View>
        <View className={styles.calcCard}>
          <Text className={styles.calcTitle}>模拟计费（跨时段自动拆分）</Text>

          <View className={styles.calcInputs}>
            <View className={styles.calcRow}>
              <Text className={styles.calcLabel}>充电时长</Text>
              <View className={styles.calcValue}>
                <View className={styles.calcBtn} onClick={() => handleHoursChange(-0.5)}>
                  <Text className={styles.calcBtnText}>-</Text>
                </View>
                <Text className={styles.calcInput}>{chargeHours}</Text>
                <View className={styles.calcBtn} onClick={() => handleHoursChange(0.5)}>
                  <Text className={styles.calcBtnText}>+</Text>
                </View>
                <Text className={styles.calcUnit}>小时</Text>
              </View>
            </View>

            <View className={styles.calcRow}>
              <Text className={styles.calcLabel}>充电功率</Text>
              <View className={styles.calcValue}>
                <View className={styles.calcBtn} onClick={() => handlePowerChange(-1)}>
                  <Text className={styles.calcBtnText}>-</Text>
                </View>
                <Text className={styles.calcInput}>{chargePower}</Text>
                <View className={styles.calcBtn} onClick={() => handlePowerChange(1)}>
                  <Text className={styles.calcBtnText}>+</Text>
                </View>
                <Text className={styles.calcUnit}>kW</Text>
              </View>
            </View>

            <View className={styles.calcRow}>
              <Text className={styles.calcLabel}>分段数</Text>
              <Text className={styles.calcValue} style={{ fontWeight: 600 }}>{segments.length} 段</Text>
            </View>
          </View>

          <View className={styles.calcResult}>
            {segments.map((seg, idx) => (
              <View key={idx} className={classnames(styles.resultItem)}>
                <Text className={styles.resultLabel}>
                  {PricePeriodLabel[seg.periodType]} {seg.durationMinutes.toFixed(0)}分钟
                  ({seg.energyKwh.toFixed(2)}度)
                </Text>
                <Text
                  className={styles.resultValue}
                  style={{ color: getPeriodColor(seg.periodType) }}
                >
                  ¥{seg.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}

            <View className={classnames(styles.resultItem, styles.total)}>
              <Text className={styles.resultLabel}>预计总费用</Text>
              <Text className={styles.resultValue}>¥{summary.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.rulesSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📖 计费规则说明</Text>
        </View>
        <View className={styles.rulesCard}>
          <Text className={styles.rulesTitle}>分段计费算法</Text>
          <View className={styles.rulesList}>
            <View className={styles.ruleItem}>
              <View className={styles.ruleIndex}>1</View>
              <Text className={styles.ruleText}>充电跨越多个费率时段时，系统会自动在费率切换点精确拆分各时段的充电时长和电量。</Text>
            </View>
            <View className={styles.ruleItem}>
              <View className={styles.ruleIndex}>2</View>
              <Text className={styles.ruleText}>每个时段独立计费：时段费用 = 时段电量 × (费率电价 + 服务费率)，各时段费用累加后得到总费用。</Text>
            </View>
            <View className={styles.ruleItem}>
              <View className={styles.ruleIndex}>3</View>
              <Text className={styles.ruleText}>尖峰时段(14:00-16:00)费率最高，建议错峰充电可节省约60%电费支出。</Text>
            </View>
            <View className={styles.ruleItem}>
              <View className={styles.ruleIndex}>4</View>
              <Text className={styles.ruleText}>谷峰时段(22:00-次日06:00)费率最低，适合夜间慢充，性价比最高。</Text>
            </View>
            <View className={styles.ruleItem}>
              <View className={styles.ruleIndex}>5</View>
              <Text className={styles.ruleText}>账单中会明确列出每个时段的时长、电量、单价和费用，确保透明可查。</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PricingPage
