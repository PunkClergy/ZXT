const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_qrcode
} = require('../../../utils/request/dispatch')
const {
  byGet
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_bottom_seed: 80, //底部按钮高度
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    imageUrl: '/assets/qd.jpg',
    c_link: 'https://k1sw.wiselink.net.cn/'
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
  // 预览图片
  handleDownloadImage() {
    if (!this.data.imageUrl) return;
    wx.previewMedia({
      sources: [{
        url: `${this.data.c_link}img/${this.data.imageUrl}`, // 图片路径
        type: 'image',
      }, ],
    });
  },
  // 请求二维码
  initQrcode() {
    showLoading()
    byGet(getApp().data.k1swUrl + u_qrcode.URL, {}).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        this.setData({
          imageUrl: response.data.content
        })
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  onLoad(options) {
    this.initQrcode()
  },


  onReady() {

  },

  onShow() {
    this.initialiImageBaseConversion()
  },


})