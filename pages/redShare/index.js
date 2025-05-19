const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {
    s_background_picture_of_the_front_page: '', //背景
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    imageUrl: '/assets/images/1.jpeg' // 你的图片路径
  },

  // 保存图片
  onSaveImage() {
    const that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.saveImage()
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '需要授权相册权限才能保存图片',
                showCancel: false
              })
            }
          })
        } else {
          that.saveImage()
        }
      }
    })
  },

  saveImage() {
    wx.showLoading({
      title: '保存中...'
    })
    wx.downloadFile({
      url: this.data.imageUrl,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success() {
            wx.showToast({
              title: '保存成功'
            })
          },
          fail() {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          },
          complete() {
            wx.hideLoading()
          }
        })
      },
      fail() {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
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
  onShow() {
    this.initialiImageBaseConversion()
  },
  // 分享功能
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/desk/desk',
      imageUrl: this.data.imageUrl
    }
  }
})