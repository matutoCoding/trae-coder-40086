import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useBillingStore } from '@/store'
import { Bill } from '@/types'
import { formatTimestamp, formatDuration } from '@/utils/time'
import { PricePeriodLabel } from '@/types'
import { getPeriodColor } from '@/utils/billing'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'
import classnames from 'classnames'

const BillDetailPage: React.FC = () => {
  const router = useRouter()
  const { bills, payBill, getBillById } = useBillingStore()
  const billId = router.params.id

  const bill = useMemo(() => {
    if (!billId) return null
    return getBillById(billId) || null
  }, [billId, bills, getBillById])

  useEffect(() => {
    console.log('[BillDetail] 账单状态已更新:', bill?.id, bill?.status)
  }, [bill])

  const handlePay = () => {
    if (!bill) return
    console.log('[BillDetail] 发起支付:', bill.id, '金额:', bill.totalAmount)
    Taro.showModal({
      title: '确认支付',
      content: `确定支付 ¥${bill.totalAmount.toFixed(2)} 吗？`,
      confirmText: '立即支付',
      confirmColor: '#00c853',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '支付中...', mask: true })
          setTimeout(() => {
            Taro.hideLoading()
            const success = payBill(bill.id)
            if (success) {
              Taro.showToast({ title: '支付成功', icon: 'success' })
              setTimeout(() => Taro.navigateBack(), 1500)
            } else {
              Taro.showToast({ title: '支付失败，请重试', icon: 'error' })
            }
          }, 1200)
        }
      }
    })
  }

  const handleShare = () => {
    Taro.showToast({ title: '账单已复制', icon: 'success' })
  }

  if (!bill) {
    return (
      <View className={styles.page}>
        <EmptyState
          icon='❓'
          title='账单不存在'
          description='未找到对应的账单记录，请返回重试'
        />
      </View>
    )
  }

  const statusLabel: Record<Bill['status'], { label: string; isPending: boolean }> = {
    pending: { label: '⏳ 待支付', isPending: true },
    paid: { label: '✅ 已支付', isPending: false },
    completed: { label: '📋 已完成', isPending: false },
    refunded: { label: '↩️ 已退款', isPending: false }
  }

  const statusInfo = statusLabel[bill.status]

  return (
    <>
      <ScrollView scrollY className={styles.page}>
        <View className={classnames(styles.statusBanner, { [styles.pending]: statusInfo.isPending })}>
          <Text className={styles.statusLabel}>{statusInfo.label}</Text>
          <Text className={styles.statusAmount}>¥{bill.totalAmount.toFixed(2)}</Text>
          <View className={styles.statusRow}>
            <View className={styles.statusItem}>
              <Text className={styles.statusItemValue}>{bill.segments.length}</Text>
              <Text className={styles.statusItemLabel}>计费分段</Text>
            </View>
            <View className={styles.statusItem}>
              <Text className={styles.statusItemValue}>{formatDuration(bill.totalDurationMinutes)}</Text>
              <Text className={styles.statusItemLabel}>充电时长</Text>
            </View>
            <View className={styles.statusItem}>
              <Text className={styles.statusItemValue}>{bill.totalEnergyKwh.toFixed(2)}</Text>
              <Text className={styles.statusItemLabel}>充电度数</Text>
            </View>
          </View>
        </View>

        <View className={styles.orderInfoCard}>
          <Text className={styles.cardTitle}>📋 订单信息</Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>订单号</Text>
              <Text className={styles.infoValue}>{bill.orderNo}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>充电桩</Text>
              <Text className={styles.infoValue}>{bill.pileName}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>用户</Text>
              <Text className={styles.infoValue}>{bill.userName}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>车牌号</Text>
              <Text className={styles.infoValue}>{bill.plateNumber}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>开始时间</Text>
              <Text className={styles.infoValue}>{formatTimestamp(bill.startTime)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>结束时间</Text>
              <Text className={styles.infoValue}>{formatTimestamp(bill.endTime)}</Text>
            </View>
            {bill.paidAt && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>支付时间</Text>
                <Text className={styles.infoValue}>{formatTimestamp(bill.paidAt)}</Text>
              </View>
            )}
            {bill.paymentMethod && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>支付方式</Text>
                <Text className={styles.infoValue}>{bill.paymentMethod}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.segmentsCard}>
          <Text className={styles.cardTitle}>⚡ 分段计费明细</Text>
          <View className={styles.segmentList}>
            {bill.segments.map((seg, idx) => (
              <View key={idx} className={styles.segmentItem}>
                <View className={styles.segmentHeader}>
                  <View className={styles.segmentPeriod}>
                    <View
                      className={styles.segmentBadge}
                      style={{ background: getPeriodColor(seg.periodType) }}
                    >
                      {PricePeriodLabel[seg.periodType]}
                    </View>
                    <Text className={styles.segmentTime}>
                      {formatTimestamp(seg.startTime, 'HH:mm')} - {formatTimestamp(seg.endTime, 'HH:mm')}
                    </Text>
                  </View>
                  <Text
                    className={styles.segmentAmount}
                    style={{ color: getPeriodColor(seg.periodType) }}
                  >
                    ¥{seg.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View className={styles.segmentDetails}>
                  <View className={styles.segmentDetail}>
                    <Text className={styles.segmentDetailLabel}>时长</Text>
                    <Text className={styles.segmentDetailValue}>{seg.durationMinutes.toFixed(0)}分钟</Text>
                  </View>
                  <View className={styles.segmentDetail}>
                    <Text className={styles.segmentDetailLabel}>电量</Text>
                    <Text className={styles.segmentDetailValue}>{seg.energyKwh.toFixed(2)}度</Text>
                  </View>
                  <View className={styles.segmentDetail}>
                    <Text className={styles.segmentDetailLabel}>电价</Text>
                    <Text className={styles.segmentDetailValue}>¥{seg.unitPrice}/度</Text>
                  </View>
                  <View className={styles.segmentDetail}>
                    <Text className={styles.segmentDetailLabel}>服务费</Text>
                    <Text className={styles.segmentDetailValue}>¥{seg.serviceFeeUnit}/度</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.summaryCard}>
          <Text className={styles.cardTitle}>💰 费用汇总</Text>
          {bill.segments.map((seg, idx) => (
            <View key={idx} className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                {PricePeriodLabel[seg.periodType]}电费({seg.energyKwh.toFixed(2)}度×¥{seg.unitPrice})
              </Text>
              <Text className={styles.summaryValue}>¥{seg.energyCost.toFixed(2)}</Text>
            </View>
          ))}
          {bill.segments.map((seg, idx) => (
            <View key={`svc-${idx}`} className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                {PricePeriodLabel[seg.periodType]}服务费({seg.energyKwh.toFixed(2)}度×¥{seg.serviceFeeUnit})
              </Text>
              <Text className={styles.summaryValue}>¥{seg.serviceFee.toFixed(2)}</Text>
            </View>
          ))}
          <View className={classnames(styles.summaryRow)}>
            <Text className={styles.summaryLabel}>电费合计</Text>
            <Text className={styles.summaryValue}>¥{bill.totalEnergyCost.toFixed(2)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>服务费合计</Text>
            <Text className={styles.summaryValue}>¥{bill.totalServiceFee.toFixed(2)}</Text>
          </View>
          <View className={classnames(styles.summaryRow, styles.total)}>
            <Text className={styles.summaryLabel}>应付总额</Text>
            <Text className={styles.summaryValue}>¥{bill.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {statusInfo.isPending && (
        <View className={styles.footerBar}>
          <View className={styles.secondaryBtn} onClick={handleShare}>
            <Text className={styles.secondaryBtnText}>复制订单</Text>
          </View>
          <View className={styles.primaryBtn} onClick={handlePay}>
            <Text className={styles.primaryBtnText}>立即支付 ¥{bill.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </>
  )
}

export default BillDetailPage
