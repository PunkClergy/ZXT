Page({
  data: {
    g_screenTotalHeight: '',//屏幕总高度
    g_tabBarHeight: 80,    // 底部tabbar高度
    g_height_from_head: '',//手机状态栏高度
    g_head_height: '',//自定义导航高度
    g_capsule_distance_to_the_right: '',//胶囊按钮右侧边缘的距离
    topHeight: '',          // 核心内容区域上部固定高度（可自定义）
    bottomHeight: 90,       // 核心内容区域下部固定高度（可自定义）

    // 核心数值
    unlockRange: 50,   // 开锁范围（0-100）
    myPosition: 60,    // 人物位置

    // 样式变量
    unlockThumbStyle: '',//开锁范围位置
    myPositionStyle: '',//我的位置
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

    // 初始化样式
    this.updateSliderStyles();
    this.updateMyPositionStyles();
  },
  onShow: function () {
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onReady() {
  },
  // 更新滑块和填充层样式（核心）
  updateSliderStyles() {
    const val = this.data.unlockRange;
    this.setData({
      // 滑块位置：与填充层宽度同步
      unlockThumbStyle: `left: ${val - 6}%;`
    });
  },

  // 更新人物位置样式
  updateMyPositionStyles() {
    this.setData({
      myPositionStyle: `left: 30%;`
    });
  },

  // 获取轨道尺寸（用于计算滑动位置）
  getTrackInfo(trackId) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${trackId}`).boundingClientRect();
      query.exec((res) => {
        resolve(res?.[0] ? { width: res[0].width, left: res[0].left } : null);
      });
    });
  },

  // 滑块拖动事件
  async onUnlockSlide(e) {
    const trackInfo = await this.getTrackInfo('unlockTrack');
    if (!trackInfo) return;
    // 计算触摸点相对轨道的百分比
    const touchX = e.touches[0].clientX;
    const relativeX = touchX - trackInfo.left;
    let val = Math.round((relativeX / trackInfo.width) * 100);

    // 限制范围 0-100
    val = Math.max(0, Math.min(100, val));

    // 更新数值并刷新样式
    this.setData({ unlockRange: val }, () => {
      this.updateSliderStyles();
    });
  },

});