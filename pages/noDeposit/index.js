// JS
Page({
  data: {
    latitude: 23.099994, // 默认坐标（深圳腾讯大厦）
    longitude: 113.324520,
    markers: [],
    scale: 18
  },

  // 获取定位按钮点击事件
  getLocation() {
    const that = this
    // 检查权限
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          // 未授权时请求权限
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.getActualLocation()
            },
            fail() {
              that.showAuthTips()
            }
          })
        } else {
          that.getActualLocation()
        }
      }
    })
  },

  // 实际获取定位方法
  getActualLocation() {
    wx.getLocation({
      type: 'gcj02', // 坐标系类型
      altitude: true, // 获取高度信息
      isHighAccuracy: true, // 高精度定位
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [{
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude,
            iconPath: '/images/location.png', // 自定义图标
            width: 30,
            height: 30
          }]
        })

        // 自动调整地图视野
        this.mapCtx = wx.createMapContext('myMap')
        this.mapCtx.moveToLocation()
      },
      fail: (err) => {
        console.error('定位失败', err)
        wx.showToast({
          title: '定位失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 显示权限提示
  showAuthTips() {
    wx.showModal({
      title: '权限提示',
      content: '需要您授权地理位置权限',
      confirmText: '去设置',
      success(res) {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  },
  onLoad() {
    this.getLocation()
  }
})