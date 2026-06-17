export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/queue/index',
    'pages/pricing/index',
    'pages/bills/index',
    'pages/profile/index',
    'pages/bill-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00c853',
    navigationBarTitleText: '绿能充电站',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f0f9f4'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00c853',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/queue/index',
        text: '排队'
      },
      {
        pagePath: 'pages/pricing/index',
        text: '费率'
      },
      {
        pagePath: 'pages/bills/index',
        text: '账单'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
