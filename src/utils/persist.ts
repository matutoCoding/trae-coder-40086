import Taro from '@tarojs/taro'

const STORAGE_PREFIX = 'ev_charging_'

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const fullKey = STORAGE_PREFIX + key
    Taro.setStorageSync(fullKey, JSON.stringify(data))
    console.log('[Persist] 已保存:', fullKey)
  } catch (e) {
    console.error('[Persist] 保存失败:', key, e)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const fullKey = STORAGE_PREFIX + key
    const data = Taro.getStorageSync(fullKey)
    if (data !== '' && data !== null && data !== undefined) {
      const parsed = JSON.parse(data)
      console.log('[Persist] 已加载:', fullKey, '数据长度:', Array.isArray(parsed) ? parsed.length : 'object')
      return parsed
    }
  } catch (e) {
    console.error('[Persist] 加载失败:', key, e)
  }
  return defaultValue
}

export function clearStorage(key: string): void {
  try {
    const fullKey = STORAGE_PREFIX + key
    Taro.removeStorageSync(fullKey)
    console.log('[Persist] 已清除:', fullKey)
  } catch (e) {
    console.error('[Persist] 清除失败:', key, e)
  }
}

export function clearAllStorage(): void {
  try {
    const info = Taro.getStorageInfoSync()
    info.keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        Taro.removeStorageSync(key)
      }
    })
    console.log('[Persist] 已清除所有持久化数据')
  } catch (e) {
    console.error('[Persist] 清除全部失败:', e)
  }
}
