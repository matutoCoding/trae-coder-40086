import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useQueueStore, useBillingStore } from '@/store';
// 全局样式
import './app.scss';

function App(props) {
  const hydrateQueue = useQueueStore(state => state.hydrate)
  const hydrateBilling = useBillingStore(state => state.hydrate)

  useEffect(() => {
    console.log('[App] 应用启动，开始从本地存储恢复数据...')
    hydrateQueue()
    hydrateBilling()
  }, [hydrateQueue, hydrateBilling]);

  useDidShow(() => {
    console.log('[App] 应用显示，重新同步本地存储...')
    hydrateQueue()
    hydrateBilling()
  });

  useDidHide(() => {
    console.log('[App] 应用隐藏')
  });

  return props.children;
}

export default App;
