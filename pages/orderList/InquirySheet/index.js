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
  u_getIndustry,
  u_getIntroduction,
  u_saleCode
} = require('../../../utils/request/data_info')

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    g_industry: [], //所属行业
    g_industry_index: null, //当前行业
    g_core_functions: [], //所属功能
    g_core_functions_index: null, //当前功能
    g_device_type_list: [], //销售代号
    g_device_type_index: null, //当前销售代号
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
  initialiIndustry() {
    byGet(getApp().data.k1swUrl + u_getIndustry.URL, {}).then(response => {
      const list = response.data.content
      const info = list.map(ele => {
        let temp = {
          id: ele,
          name: ele
        }
        return temp
      })
      this.setData({
        g_industry: info
      })
    })
  },
  initialgetIntroduction() {
    byGet(getApp().data.k1swUrl + u_getIntroduction.URL, {}).then(response => {
      const list = response.data.content
      const info = list.map(ele => {
        let temp = {
          id: ele,
          name: ele
        }
        return temp
      })
      this.setData({
        g_core_functions: info
      })
    })
  },
  handleIndustryType(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  handleCoreType(evt) {
    this.setData({
      g_core_functions_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  handleCalculate() {
    const {
      g_core_functions_index,
      g_industry_index,
      g_industry,
      g_core_functions
    } = this.data
    if (g_industry_index == null || g_core_functions_index == null) return
    const parmas = {
      introduction: g_core_functions[g_core_functions_index]?.name,
      industry: g_industry[g_industry_index]?.name
    }
    byGet(getApp().data.k1swUrl + u_saleCode.URL, parmas).then(response => {
      const list = response.data.content
      console.log(list)
    })

  },

  onLoad(options) {
    this.initialiIndustry()
    this.initialgetIntroduction()
  },
  onReady() {},
  onShow() {
    this.initialiImageBaseConversion()
  },










})