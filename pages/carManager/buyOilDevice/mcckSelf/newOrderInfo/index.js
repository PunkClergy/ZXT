const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../../../utils/Inspect/tips')
const {
  u_buyMcckDevice
} = require('../../../../../utils/request/eqpmnt')
const {
  byPost
} = require('../../../../../utils/request/http')
Page({
  data: {
    listData: Array.from({length: 100}, (_,i) => ({
      id: i+1,
      content: `Item ${i+1}`
    })),
    s_background_picture_of_the_front_page: '', //全图背景
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
  }
});