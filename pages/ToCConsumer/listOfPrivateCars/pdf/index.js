const {
  _handleWindowInfo,
} = require('../../../../utils/public').default

Page({
  data: {
    imageWidth: '加载中...',
    imageHeight: '加载中...',
    isBottomReached: false,
    c_screen_height: _handleWindowInfo.windowHeight || 0, // 全高度
    flag: 0
  },

  // 当滚动到 scroll-view 底部时触发
  onScrollToLower() {
    this.setData({ isBottomReached: true });
  },

  // “开始使用”按钮点击事件
  startUsing() {
    wx.redirectTo({
      url: '/pages/ToCConsumer/privateCar/index',
    })
  },
  hadleImage() {
    wx.showLoading({
      title: '加载中...',
    })
    const imgUrl = 'https://k3a.wiselink.net.cn/img/video/blueinstall.png';
    // 使用 wx.getImageInfo 获取图片信息
    wx.getImageInfo({
      src: imgUrl,
      success: (res) => {
        const proportion = res?.width / 750;
        this.setData({
          imageWidth: res.width,
          imageHeight: res.height / proportion
        }, () => {
          wx.hideLoading()
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败', err);
        this.setData({
          imageWidth: '加载失败',
          imageHeight: '加载失败'
        });
      }
    });
  },
  onLoad(options) {
    this.setData({
      flag: options?.flag || 0
    }, () => {
      this.hadleImage()
    })


  }
});