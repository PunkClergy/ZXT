const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_zxtInvoicelnfo
} = require('../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景大图
    allRes: {}, //提交参数
  },
  // 初始化背景图
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
    // 请求区域数据
    initGetRoles(evt) {
      byGet(`${getApp().data.k1swUrl}${u_zxtInvoicelnfo.URL}`, {}).then(allRes => {
        console.log(allRes)
        this.setData({
          allRes: allRes?.data?.content
        })
  
      })
    },
  onLoad(options) {
  },

  onReady() {
  },

  onShow() {
    this.initialiImageBaseConversion()
    this.initGetRoles()
  },


})