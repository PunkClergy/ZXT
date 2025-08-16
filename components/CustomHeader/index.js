Component({
  properties: {
    title: {
      type: String,
      value: {}
    },
    state:{
      type:String,
      value:0
    }
  },


  data: {
    navBarHeight: 44, // 默认导航栏高度
    statusBarHeight: 20, // 默认状态栏高度
    menuRight: 87, // 胶囊默认右侧间距
    menuHeight: 32, // 胶囊默认高度
    safeRight: 0 // 安全边距
  },
  attached() {
    try {
      const {
        SDKVersion,
        statusBarHeight
      } = wx.getSystemInfoSync()
      const isNewAPI = this.compareVersion(SDKVersion, '2.11.0') >= 0
      const menuButton = isNewAPI ? wx.getMenuButtonBoundingClientRect() : null
      const calcData = {
        statusBarHeight: statusBarHeight || this.data.statusBarHeight,
        menuRight: menuButton ? menuButton.right : this.data.menuRight,
        menuHeight: menuButton ? menuButton.height : this.data.menuHeight,
        safeRight: menuButton ? wx.getSystemInfoSync().windowWidth - menuButton.right + 10 : this.data.safeRight
      }
      const navBarHeight = menuButton ?
        (menuButton.top - statusBarHeight) * 2 + menuButton.height :
        this.data.navBarHeight

      this.setData({
        ...calcData,
        navBarHeight,
        isNewAPI
      })
    } catch (e) {
      console.error('导航栏初始化失败:', e)
    }
  },
  methods: {
    compareVersion(v1, v2) {
      v1 = v1.split('.')
      v2 = v2.split('.')
      const len = Math.max(v1.length, v2.length)
      while (v1.length < len) v1.push('0')
      while (v2.length < len) v2.push('0')
      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i], 10)
        const num2 = parseInt(v2[i], 10)
        if (num1 !== num2) return num1 - num2
      }
      return 0
    },

    handleBack(e) {
      const pages = getCurrentPages();
      if (pages.length >= 2) {
        wx.navigateBack({
          delta: 1,
          success: () => {},
          fail: (err) => {
            wx.switchTab({
              url: '/pages/desk/desk'
            });
          }
        });
      } else {
        wx.reLaunch({
          url: '/pages/desk/desk'
        });
      }
    },

    handleGoHome() {
      wx.reLaunch({
        url: '/pages/desk/desk'
      })
    }
  }
})