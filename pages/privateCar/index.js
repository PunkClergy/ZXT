Page({
  data: {
    g_screenTotalHeight: '',//屏幕总高度
    g_tabBarHeight: 80,    // 底部tabbar高度
    g_height_from_head: '',//手机状态栏高度
    g_head_height: '',//自定义导航高度
    g_capsule_distance_to_the_right: '',//胶囊按钮右侧边缘的距离
    topHeight: '',          // 核心内容区域上部固定高度（可自定义）
    bottomHeight: 90        // 核心内容区域下部固定高度（可自定义）
  },


  //  * 初始化屏幕及系统头部相关信息
  initScreenAndSystemInfo() {
    const { screenHeight = 0, statusBarHeight = 0, screenWidth = 0 } = wx.getWindowInfo() || {};
    const { height: h = 0, top: t = 0, right: r = 0 } = wx.getMenuButtonBoundingClientRect() || {};
    if (!screenHeight || !statusBarHeight || !screenWidth || !h || !t || !r) return;
    console.log(statusBarHeight, statusBarHeight + h + (t - statusBarHeight) * 2)
    this.setData({
      g_height_from_head: statusBarHeight,//手机状态栏高度
      g_head_height: statusBarHeight + h + (t - statusBarHeight) * 2,//自定义导航高度
      g_capsule_distance_to_the_right: screenWidth - r,//胶囊按钮右侧边缘的距离
      g_screenTotalHeight: screenHeight,//屏幕总高度
    });
  },
  onLoad: function (options) {
    // 获取屏幕数据
    this.initScreenAndSystemInfo()
  },
  onShow: function () {
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onReady() {
  },

});