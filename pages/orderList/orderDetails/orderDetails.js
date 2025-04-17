const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byGet
} = require('../../../utils/request/http')
const {
  u_buyRecord,
  u_serviceList,
  u_getServiceFiled
} = require('../../../utils/request/data_info')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  orderListStatus,
  orderStatus
} = require('../../../utils/Inspect/filterColl').default
Page({

  /**
   * 页面的初始数据
   */
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
  // 车辆切换
  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      scrollLeft: (index - 2) * 120,
      scrollTop: 0,
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