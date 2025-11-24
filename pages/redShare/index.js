const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  byGet
} = require('../../utils/request/http')
const {
  u_getInviteCodeImg,
  u_getSharelinkTitleImg
} = require('../../utils/request/dispatch')
Page({
  data: {
    s_background_picture_of_the_front_page: '', //背景
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    imageUrl: '	https://5b0988e595225.cdn.sohucs.com/images/20180705/535f002edfe345d9a9e12e55f8b32013.jpeg',
    share_image: '/assets/images/login/logo.png',
    scene: getApp().data.userInfo.personInviteCode,
    personal_qr_code: 'https://k3a.wiselink.net.cn/deskapi/getPosterImg?userId='+getApp().data.userInfo.id, //海报
    share_img: '', //分享出去的图片
    share_title: '', //f分享出去的文案

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
      url: this.data.personal_qr_code, // 下载文件的地址,
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
  // 海报
  initQrCode() {
    byGet(getApp().data.k1swUrl + u_getInviteCodeImg.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          personal_qr_code: response.data.content
        })
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  // 分享内容
  initShareQrCode() {
    byGet(getApp().data.k1swUrl + u_getSharelinkTitleImg.URL, {}).then(response => {
      if (response.statusCode == 200) {
        const resp = response?.data.content
        this.setData({
          share_img: resp?.linkimg, //分享出去的图片
          share_title: resp?.linktitle, //f分享出去的文案
        })
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  onShow() {
    this.initialiImageBaseConversion()
    // this.initQrCode()
    this.initShareQrCode()
  },
  // 分享功能
  onShareAppMessage() {
    return {
      title: this.data.share_title,
      path: '/pages/index/index?scene=' + this.data.scene,
      // imageUrl: this.data.share_img
    }
  }
})