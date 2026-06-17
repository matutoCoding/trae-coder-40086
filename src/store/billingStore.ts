import { create } from 'zustand'
import { Bill } from '@/types'
import { mockBills } from '@/data/mockBills'

interface BillingState {
  bills: Bill[]
  payBill: (billId: string) => boolean
  getBillById: (billId: string) => Bill | undefined
  getBillsByStatus: (status?: Bill['status']) => Bill[]
  getPendingCount: () => number
  getTotalStats: () => {
    totalAmount: number
    totalCount: number
    totalEnergyKwh: number
    pendingCount: number
  }
}

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: [...mockBills],

  payBill: (billId) => {
    const { bills } = get()
    const bill = bills.find(b => b.id === billId)

    if (!bill) {
      console.error('[BillingStore] 找不到账单:', billId)
      return false
    }

    if (bill.status !== 'pending') {
      console.log('[BillingStore] 账单状态不是待支付:', bill.status)
      return false
    }

    set(state => ({
      bills: state.bills.map(b =>
        b.id === billId
          ? { ...b, status: 'paid' as const, paidAt: Date.now(), paymentMethod: '微信支付' }
          : b
      )
    }))

    console.log('[BillingStore] 支付成功:', billId, '金额:', bill.totalAmount.toFixed(2), '元')
    return true
  },

  getBillById: (billId) => {
    return get().bills.find(b => b.id === billId)
  },

  getBillsByStatus: (status) => {
    const { bills } = get()
    if (!status) return bills
    return bills.filter(b => b.status === status)
  },

  getPendingCount: () => {
    return get().bills.filter(b => b.status === 'pending').length
  },

  getTotalStats: () => {
    const { bills } = get()
    const paidBills = bills.filter(b => b.status === 'paid' || b.status === 'completed')

    return {
      totalAmount: paidBills.reduce((sum, b) => sum + b.totalAmount, 0),
      totalCount: paidBills.length,
      totalEnergyKwh: paidBills.reduce((sum, b) => sum + b.totalEnergyKwh, 0),
      pendingCount: bills.filter(b => b.status === 'pending').length
    }
  }
}))
