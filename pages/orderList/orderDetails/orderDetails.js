const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_orderConfirm
} = require('../../../utils/request/data_info')
const {
  byPost
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    all_data: null,
    currentIndex: 0,
    scrollLeft: 0,
    scrollTop: 0,
    items:[],
  },

  // 全屏背景
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
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
  // 处理详情数据
  initDetails(evt) {
    console.log(evt)
    this.setData({
      all_data: evt
    })
  },
  handleRadioChange() {
    console.log('radio发生change事件，携带value值为：', e.detail.value)

    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }

    this.setData({
      items
    })
  },
  // 车辆切换
  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      scrollLeft: (index - 2) * 120,
      scrollTop: 0,
    });
  },
  // 去支付
  handleOneClickOrdering() {
    wx.navigateTo({
      url: '/pages/pay/index?info=' + JSON.stringify(this.data.all_data),
    })
  },
  // 确认
  handleConfirm() {
    const {
      all_data
    } = this.data
    const params = {
      [u_orderConfirm.orderNum]: all_data.num
    }
    byPost(getApp().data.k1swUrl + u_orderConfirm.URL, params,
      (response) => {
        const resp = response.data.content
        all_data.status = resp
        this.setData({
          all_data
        })
      });
  },
  onLoad(options) {
    if (options.item) {
      this.initDetails(JSON.parse(options.item))
    }
  },


  onReady() {
    this.initialiImageBaseConversion()
  },


  onShow() {

  },

})