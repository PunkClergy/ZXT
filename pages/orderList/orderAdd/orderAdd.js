const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  u_getDeviceType,
  u_getCountry,
  u_getDeviceVersion,
} = require('../../../utils/request/data_info')
Page({

  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    g_category_list: [], //类别
    g_category_index: null, //当前选择类别index
    g_country_list: [], //国家
    g_country_index: null, //当前选中国家
    g_device_version_list: [], //硬件版本号
    g_device_version_index: null, //当前硬件版本号
    c_entry_method: 1
  },
  handleCategory(evt) {
    console.log(evt)
  },
  // 全图背景
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
  // 请求类别数据
  initialiCategory() {
    byPost(getApp().data.k1swUrl + u_getDeviceType.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_category_list: resp
        })
      });
  },
  // 类别发生变化
  handleCategory(evt) {
    this.setData({
      g_category_index: evt.detail.value
    })
  },
  // 请求国家数据
  initialiCountry() {
    byPost(getApp().data.k1swUrl + u_getCountry.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_country_list: resp
        })
      });
  },
  // 国家数据发生变化
  handleCountry(evt) {
    this.setData({
      g_country_index: evt.detail.value
    })
  },
  // 硬件版本数据
  initialiDeviceVersion() {
    byPost(getApp().data.k1swUrl + u_getDeviceVersion.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_device_version_list: resp
        })
      });
  },
  // 硬件数据发生变化
  handleDeviceVersion(evt) {
    this.setData({
      g_device_version_index: evt.detail.value
    })
  },
  handleBatterylift(evt) {
    const flag = evt?.currentTarget?.dataset?.item
    this.setData({
      c_entry_method: flag
    })
  },
  // 提交参数
  handleSubmit() {

  },

  onLoad(options) {

  },


  onReady() {
    this.initialiImageBaseConversion()
    this.initialiCategory()
    this.initialiCountry()
    this.initialiDeviceVersion()
  },

  onShow() {

  },
})