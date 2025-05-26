const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  byGet
} = require('../../utils/request/http')
const {
  u_getInviteCodeImg
} = require('../../utils/request/dispatch')
const {
  u_getQrcodeImg
} = require('../../utils/request/home')
Page({
  data: {
    s_background_picture_of_the_front_page: '', //背景
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    scene: getApp().data.userInfo.personInviteCode,
    personal_qr_code: ''
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
     // 预览图片
  handlePreviewImage(evt) {
      wx.previewMedia({
        sources: [{
          url: '/assets/images/1.jpg', // 图片路径
          type: 'image',
        }, ],
      });
  },
  initQrCode() {
    byGet(getApp().data.k1swUrl + u_getQrcodeImg.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          personal_qr_code: response.data.content.img
        })
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.initQrCode()
  },
  // 分享功能
  onShareAppMessage() {
  }
})