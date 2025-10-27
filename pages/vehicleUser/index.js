const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {
    s_background_picture_of_the_front_page: '', // 背景图片
    s_client_bg: '',
    s_channel_bg: '',
    s_service_bg: '', //客户端tabs底图
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    sn_specific_value: null,
    sn_state: false, //显示地图状态
    
  },
  // 转换背景图base64
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/t_bg.png',
      key: 's_t_bg'
    },
    {
      path: '/assets/images/home/client_bg.png',
      key: 's_client_bg'
    },
    {
      path: '/assets/images/home/channel_bg.png',
      key: 's_channel_bg'
    },
    {
      path: '/assets/images/home/service_bg.png',
      key: 's_service_bg'
    }, {
      path: '/assets/images/index/bg.png',
      key: 's_background_picture_of_the_front_page'
    },
    {
      path: '/assets/images/index/tree_bg.png',
      key: 's_background_image_of_the_tree'
    },
    {
      path: '/assets/images/index/banner-bg.png',
      key: 's_background_image_of_the_banner'
    }
    ];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );

    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },

  onLoad: function (options) {
    if (options?.scene || options?.query) {
      if ((options?.scene || options?.query).startsWith('blue_')) {
        console.log(options)
        wx.navigateTo({
          url: `/pages/privateCar/index?scene=${options?.scene || options?.query}`,
        })
        return
      }
      this.setData({
        sn_state: true,
        sn_specific_value: options?.scene || options?.query
      }, () => {
        wx.setStorageSync('scene', options?.scene || options?.query);
      })
    }
  },

  onReady: function () {
    this.initialiImageBaseConversion()
  },

  onShow: function (e) {
    const scene = wx.getStorageSync('scene');
    this.setData({
      sn_specific_value: this.data.sn_specific_value || scene
    })
  },


})