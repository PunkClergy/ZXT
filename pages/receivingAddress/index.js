const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_addressapiList,
  u_addOrUpdate
} = require('../../utils/request/data_info')
const {
  byPost,
} = require('../../utils/request/http')

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    g_items: null,
    is_choice: false,
    c_send_key_show_momal: false,
    c_province_city: null,
    c_province_city_code: null
  },

  onLoad(options) {
    if (options?.souce) {
      this.setData({
        is_choice: true
      })
    }
  },
  onReady() {
    this.initialiImageBaseConversion()
  },
  onShow() {
    this.initialiAddress()
  },

  // 新增地址弹窗
  handleJumpInfo() {
    this.setData({
      c_send_key_show_momal: true
    })
  },
  // 取消新增
  handleHideSengKeyModal() {
    this.setData({
      c_send_key_show_momal: false
    })
  },
  // 地址选择变更
  bindTimeChange(e) {
    const value = e.detail.value
    const code = e.detail.code
    this.setData({
      c_province_city: value.join(''),
      c_province_city_code: code.join(',')
    })
  },
  // 地址新增提交
  handleFormSubmit(evt) {
    const info = evt.detail.value
    const pamars = {
      linkperson: info?.linkperson,
      linkmobile: info?.linkmobile,
      address: this.data.c_province_city + info?.address
    }
    byPost(getApp().data.k1swUrl + u_addOrUpdate.URL, pamars,
      (response) => {
        const resp = response.data.code
        if (resp == 1000) {
          this.setData({
            c_send_key_show_momal: false
          }, () => {
            this.initialiAddress()
          })
        }
      });
  },
  // 点击选择地址
  handleChoice(evt) {
    if (this.data.is_choice) {
      // 存入缓存
      wx.setStorage({
        key: 'choice', // 缓存的键
        data: evt.currentTarget.dataset.item, // 缓存的值
        success() {
          wx.navigateBack({
            delta: 1
          })
        },
      });
    }
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
  // 查询所有地址
  initialiAddress() {
    byPost(getApp().data.k1swUrl + u_addressapiList.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_items: resp
        })
      });
  },
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})