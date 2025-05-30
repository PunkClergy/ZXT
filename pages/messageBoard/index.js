const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default

const {
  u_addMessage
} = require('../../utils/request/data_info')
const {
  byPost
} = require('../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
Page({
  data: {
    s_background_picture_of_the_front_page: '', //背景
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    value: ''
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
  handleInput(evt) {
    this.setData({
      value: evt.detail.value
    })
  },
  // 提交
  handleSubmit() {
    if (this.data.value) {
      byPost(`${getApp().data.k1swUrl}${u_addMessage.URL}`, {
        message: this.data.value
      }, (response) => {
        if (response?.data?.code != 1000) {
          showToast(response?.data?.msg);
          hideLoading();
          return
        }
        showToast(response?.data?.msg);
      }, (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
      });
    } else {
      showToast('请输入内容');
    }

  },
  onShow() {
    this.initialiImageBaseConversion()
  },
  // 分享功能
  onShareAppMessage() {}
})