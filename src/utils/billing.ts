import { PricePeriod, PricePeriodType, BillingSegment, Bill } from '@/types'

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

export function getCurrentPeriod(
  periods: PricePeriod[],
  timestamp: number = Date.now()
): PricePeriod | undefined {
  const date = new Date(timestamp)
  const currentMinutes = date.getHours() * 60 + date.getMinutes()

  for (const period of periods) {
    const startMin = parseTimeToMinutes(period.startTime)
    const endMin = parseTimeToMinutes(period.endTime)

    if (startMin < endMin) {
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        return period
      }
    } else {
      if (currentMinutes >= startMin || currentMinutes < endMin) {
        return period
      }
    }
  }

  return undefined
}

export function generatePeriodTransitions(
  periods: PricePeriod[],
  startTime: number,
  endTime: number
): number[] {
  const transitions: number[] = [startTime]
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  const startDay = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  ).getTime()
  const endDay = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  ).getTime()

  for (let day = startDay; day <= endDay; day += 86400000) {
    for (const period of periods) {
      const [sh, sm] = period.startTime.split(':').map(Number)
      const periodTransition = day + sh * 3600000 + sm * 60000
      if (periodTransition > startTime && periodTransition < endTime) {
        transitions.push(periodTransition)
      }
    }
  }

  transitions.push(endTime)
  return transitions.sort((a, b) => a - b)
}

export function calculateBillingSegments(
  periods: PricePeriod[],
  startTime: number,
  endTime: number,
  powerKw: number = 7
): BillingSegment[] {
  const transitions = generatePeriodTransitions(periods, startTime, endTime)
  const segments: BillingSegment[] = []

  for (let i = 0; i < transitions.length - 1; i++) {
    const segStart = transitions[i]
    const segEnd = transitions[i + 1]
    const durationMs = segEnd - segStart
    const durationMinutes = durationMs / 60000

    if (durationMinutes < 0.01) continue

    const period = getCurrentPeriod(periods, segStart + 1)
    if (!period) continue

    const energyKwh = (powerKw * durationMinutes) / 60
    const unitPrice = period.pricePerKwh
    const serviceFeeUnit = period.serviceFee
    const energyCost = parseFloat((energyKwh * unitPrice).toFixed(2))
    const serviceFee = parseFloat((energyKwh * serviceFeeUnit).toFixed(2))
    const subtotal = parseFloat((energyCost + serviceFee).toFixed(2))

    segments.push({
      periodType: period.type,
      startTime: segStart,
      endTime: segEnd,
      durationMinutes: parseFloat(durationMinutes.toFixed(2)),
      powerKw,
      energyKwh: parseFloat(energyKwh.toFixed(2)),
      unitPrice,
      serviceFeeUnit,
      energyCost,
      serviceFee,
      subtotal
    })
  }

  return segments
}

export function summarizeBill(segments: BillingSegment[]): {
  totalDurationMinutes: number
  totalEnergyKwh: number
  totalEnergyCost: number
  totalServiceFee: number
  totalAmount: number
} {
  return segments.reduce(
    (acc, seg) => ({
      totalDurationMinutes: acc.totalDurationMinutes + seg.durationMinutes,
      totalEnergyKwh: parseFloat((acc.totalEnergyKwh + seg.energyKwh).toFixed(2)),
      totalEnergyCost: parseFloat((acc.totalEnergyCost + seg.energyCost).toFixed(2)),
      totalServiceFee: parseFloat((acc.totalServiceFee + seg.serviceFee).toFixed(2)),
      totalAmount: parseFloat((acc.totalAmount + seg.subtotal).toFixed(2))
    }),
    {
      totalDurationMinutes: 0,
      totalEnergyKwh: 0,
      totalEnergyCost: 0,
      totalServiceFee: 0,
      totalAmount: 0
    }
  )
}

export function generateOrderNo(): string {
  const now = new Date()
  const dateStr =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  const timeStr =
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `EV${dateStr}${timeStr}${random}`
}

export function getPeriodColor(type: PricePeriodType): string {
  const colorMap: Record<PricePeriodType, string> = {
    [PricePeriodType.VALLEY]: '#00b42a',
    [PricePeriodType.FLAT]: '#ffc300',
    [PricePeriodType.PEAK]: '#ff7d00',
    [PricePeriodType.PEAK_TOP]: '#f53f3f'
  }
  return colorMap[type]
}
