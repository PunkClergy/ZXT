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
  u_carManagerapi_addOrUpdate
} = require('../../../utils/request/car')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    brakingType: '1', //自助取还 1 ：自助取还 2 非自助取还
    batterylift: '一键启动', //启动方式
    carOwnerName: '智信通', //所属平台
    carOwnerNameValue: '',
    page_nature: '', //页面性质
  },
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
  // 内容输入回调
  handleBindinput(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    })
  },
  // 点击内容回调
  handleBrakingType(evt) {
    const brakingType = evt.currentTarget.dataset.item
    this.setData({
      brakingType
    })
  },
  // 点击内容回调
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  // 点击内容回调
  handleCarOwnerName(evt) {
    const carOwnerName = evt.currentTarget.dataset.item
    this.setData({
      carOwnerName
    })
  },
  handleCarOwnerNameBindinput(evt) {
    this.setData({
      carOwnerNameValue: evt.detail.value
    })
  },
  // 提交参数
  handleSubmit() {
    const apiUrls = {
      getCarStatus: getApp().data.k1swUrl + u_carManagerapi_addOrUpdate.URL
    };
    const param = {
      ...this.data.params,
    };



    byPost(apiUrls.getCarStatus, param,
      (response) => {
        hideLoading();
        wx.navigateTo({
          url: '/pages/carManager/corpel/index',
        });
      });
  },

  onLoad(options) {
    if (options.item) {
      const info = JSON.parse(options.item)
      const params = {
        id: info?.id,
        name: info?.name,
        mobile: info?.mobile,
        idcard: info?.idcard,
        address: info?.address,
      }
      this.setData({
        params,

      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.initialiImageBaseConversion()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
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