import { PricePeriod, PricePeriodType } from '@/types'

export const pricePeriods: PricePeriod[] = [
  {
    type: PricePeriodType.VALLEY,
    startTime: '00:00',
    endTime: '06:00',
    pricePerKwh: 0.6,
    serviceFee: 0.3
  },
  {
    type: PricePeriodType.FLAT,
    startTime: '06:00',
    endTime: '10:00',
    pricePerKwh: 1.0,
    serviceFee: 0.4
  },
  {
    type: PricePeriodType.PEAK,
    startTime: '10:00',
    endTime: '14:00',
    pricePerKwh: 1.5,
    serviceFee: 0.5
  },
  {
    type: PricePeriodType.PEAK_TOP,
    startTime: '14:00',
    endTime: '16:00',
    pricePerKwh: 1.8,
    serviceFee: 0.5
  },
  {
    type: PricePeriodType.PEAK,
    startTime: '16:00',
    endTime: '19:00',
    pricePerKwh: 1.5,
    serviceFee: 0.5
  },
  {
    type: PricePeriodType.FLAT,
    startTime: '19:00',
    endTime: '22:00',
    pricePerKwh: 1.0,
    serviceFee: 0.4
  },
  {
    type: PricePeriodType.VALLEY,
    startTime: '22:00',
    endTime: '00:00',
    pricePerKwh: 0.6,
    serviceFee: 0.3
  }
]
