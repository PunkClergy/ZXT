const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
const {
  u_payRecord
} = require('../../../../utils/request/eqpmnt')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.windowHeight || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    source: 0,
    page: 1,
    items: []
  },

  onLoad: function (options) {
    this.initCarryParams(options)
    this.getPayList()
  },
  onShow: function () {

  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },
  initCarryParams(evt) {
    const {
      source
    } = evt
    this.setData({
      source
    })
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
  getPayList: function () {
    const _this = this
    const param = {};
    param[u_payRecord.companyId] = getApp().data.userInfo.fin3CompanyId;
    param[u_payRecord.page] = _this.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.k1swUrl + u_payRecord.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          if (_this.data.page > 1 && data.content.length == 0) {
            appUtil.showToast("已加载全部数据：共" + that.data.items.length + "条")
          }
          _this.setData({
            items: _this.data.items.concat(data.content)
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },
  handleSelectJump(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    wx.navigateTo({
      url: `${this.data.source}?datails=${JSON.stringify(item)}`
    })
  },
  handleJumpBack() {
    wx.navigateBack({
      delta: 1,
    });
  },

})