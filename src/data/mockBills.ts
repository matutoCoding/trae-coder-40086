import { Bill, PricePeriodType, BillingSegment, PricePeriod } from '@/types'
import { calculateBillingSegments, summarizeBill, generateOrderNo } from '@/utils/billing'
import { pricePeriods } from './mockPricing'

const now = Date.now()

function createBill(startHoursAgo: number, durationHours: number, pileName: string): Bill {
  const startTime = now - startHoursAgo * 3600000
  const endTime = startTime + durationHours * 3600000
  const segments = calculateBillingSegments(pricePeriods, startTime, endTime, 7)
  const summary = summarizeBill(segments)

  return {
    id: `bill_${startHoursAgo}_${durationHours}`,
    orderNo: generateOrderNo(),
    pileName,
    userName: '我',
    plateNumber: '京D·99999',
    startTime,
    endTime,
    ...summary,
    segments,
    status: startHoursAgo < 2 ? 'pending' : startHoursAgo < 48 ? 'paid' : 'completed',
    paidAt: startHoursAgo < 2 ? undefined : startTime + durationHours * 3600000 + 120000
  }
}

export const mockBills: Bill[] = [
  createBill(1, 0.5, 'A03桩'),
  createBill(26, 1.2, 'A01桩'),
  createBill(72, 2.0, 'B02桩'),
  createBill(120, 0.8, 'B01桩'),
  createBill(168, 1.5, 'A02桩'),
  createBill(240, 3.0, 'B03桩'),
  createBill(336, 1.8, 'A01桩'),
  createBill(504, 2.5, 'A03桩')
]

export function getBillById(id: string): Bill | undefined {
  return mockBills.find(b => b.id === id)
}
