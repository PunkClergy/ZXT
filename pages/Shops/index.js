const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_inquirySheet
} = require('../../utils/request/data_info')
const {
  byPost
} = require('../../utils/request/http')
const {
  u_addMessage
} = require('../../utils/request/data_info')
const {
  FIELD_CONFIG
} = require('../../utils/Inspect/filterColl').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    isShowInputModal: false,
    inputValue: '',
    imageUrl: '/assets/images/qr.png', // 替换为你自己的图片 URL
    tempFilePath: '' // 用于存储下载后的临时路径
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
  // 打开弹窗
  showInputDialog() {
    this.setData({
      isShowInputModal: true,
      inputValue: '' // 清空输入框
    });
  },

  // 输入事件
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  submitInput() {
    if (this.data.inputValue) {
      byPost(`${getApp().data.k1swUrl}${u_addMessage.URL}`, {
        message: this.data.inputValue
      }, (response) => {
        if (response?.data?.code != 1000) {
          showToast(response?.data?.msg);

          hideLoading();
          return
        }
        // 在页面JS中触发确认款弹窗
        wx.showModal({
          title: '提示',
          content: response?.data?.msg,
          confirmText: '确认',
          success: (res) => {
            // wx.switchTab({
            //   url: '/pages/desk/desk'
            // })
            this.setData({
              isShowInputModal: false
            })
          }
        })

        showToast(response?.data?.msg);
      }, (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
      });
    } else {
      showToast('请输入内容');
    }

  },
  // 下载图片
  downloadImage() {
    const that = this;
    const imageUrl = this.data.imageUrl;

    wx.showLoading({
      title: '下载中...',
    });

    // 1. 下载图片到本地
    wx.downloadFile({
      url: imageUrl,
      success(res) {
        console.log(res)
        if (res.statusCode === 200) {
          const tempPath = res.tempFilePath;
          that.setData({
            tempFilePath: tempPath
          });

          // 2. 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: tempPath,
            success() {
              wx.showToast({
                title: '保存成功'
              });
            },
            fail(err) {
              console.error('保存失败:', err);

              // 如果是权限问题，提示用户打开权限
              if (err.errMsg.includes('auth')) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存图片到相册',
                  success(modalRes) {
                    if (modalRes.confirm) {
                      wx.openSetting({
                        success(settingData) {
                          if (settingData.authSetting['scope.writePhotosAlbum']) {
                            wx.showToast({
                              title: '授权成功'
                            });
                            that.saveImage(tempPath);
                          } else {
                            wx.showToast({
                              title: '授权失败',
                              icon: 'none'
                            });
                          }
                        }
                      });
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail() {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete() {
        wx.hideLoading();
      }
    });
  },
  // 保存图片函数（抽离复用）
  saveImage(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success() {
        wx.showToast({
          title: '保存成功'
        });
      },
      fail(err) {
        console.error('再次保存失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  // 关闭弹窗
  hideModal() {
    this.setData({
      isShowInputModal: false
    });
  },
  onLoad(options) {},


  onReady() {

  },

  onShow() {
    this.initialiImageBaseConversion()

  },


  onHide() {

  },
})