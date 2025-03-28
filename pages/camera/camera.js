var that;
//工具
const appUtil = require('../../utils/app-util.js');
const tips1 = '请确保身份证正面边缘在拍摄框内';
const tips2 = '请确保身份证反面边缘在拍摄框内';
const tips3 = '请确保行驶证正面边缘在拍摄框内';
Page({
  data: {
    viewType: 0,
    cardType: 0,
    // showPhoneHeight: 603,
    // showPhoneWidth: 0,
    // coverTop: 60,
    // cameraShowHeight: 0,
    // cameraShowWidth: 0,
    // coverBottomTop: 0,
    // hiddenCoverInner: true,
    tips: '请确保身份证正面边缘在拍摄框内',
    // tempImagePath: '../../assets/images/default_image.png',
    leftGap: 40, //单位rpx
    topGap: 100, //单位rpx
  },

  onLoad: function(options) {
    that = this;
    that.ctx = wx.createCameraContext();
    that.setData({
      viewType: options.view,
      cardType: options.card,
      // showPhoneHeight: options.showPhoneHeight,
      // showPhoneWidth: options.showPhoneWidth,
      // cameraShowHeight: options.cameraShowHeight,
      // cameraShowWidth: options.showPhoneWidth - options.showPhoneWidth / 750 * 2 * 40,
      // coverBottomTop: parseInt(options.cameraShowHeight) + that.data.coverTop - options.showPhoneWidth / 750 * 3,
      // hiddenCoverInner: options.card != 3,
      tips: that.parseTips(options.card),
    });

  },

  onShow: function() {
    appUtil.getAuthState(appUtil.SCOPE_TYPE.SCOPE_CAMERA, function(auth) {
      if (auth) {
        console.log('--------------相机已授权----------');
      } else {
        //去授权
        appUtil.authorize(appUtil.SCOPE_TYPE.SCOPE_CAMERA, function(success) {
          if (success) {} else {
            //授权失败
            console.log('----------------相机未授权-------------------');
            let pages = getCurrentPages();
            let prePage = pages[pages.length - 2];
            prePage.setData({
              authCamera: true
            });
            wx.navigateBack({
              delta: 1
            })
          }
        });
      }
    });
  },


  parseTips: function(carType) {
    if (carType == 1) {
      return tips1;
    } else if (carType == 2) {
      return tips2;
    } else if (carType == 3) {
      return tips3;
    }
  },

  takePhoto: function() {
    appUtil.takePhoto(that.ctx, function(res) {
      if (res) {
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[pages.length - 2];
        var pathUrl = [];
        pathUrl.push(res.tempImagePath);
        console.log('-------camera:' + res.tempImagePath + ',view:' + that.data.viewType + ",type:" + that.data.cardType);
        if (that.data.cardType == 1) {
          prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            firstTempFilePaths: pathUrl,
            currentViewType: that.data.viewType,
            currentCardType: that.data.cardType
          });
        } else if (that.data.cardType == 2) {
          prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            secondTempFilePaths: pathUrl,
            currentViewType: that.data.viewType,
            currentCardType: that.data.cardType
          });
        } else if (that.data.cardType == 3) {
          prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            thirdTempFilePaths: pathUrl,
            currentViewType: that.data.viewType,
            currentCardType: that.data.cardType
          });
        }else if (that.data.cardType == 4) {
          prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            fourthTempFilePaths: pathUrl,
            currentViewType: that.data.viewType,
            currentCardType: that.data.cardType
          });
        }
        else if (that.data.cardType == 5) {
          prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            fifthTempFilePaths: pathUrl,
            currentViewType: that.data.viewType,
            currentCardType: that.data.cardType
          });
        }
        wx.navigateBack({
          delta: 1 // 返回上一级页面。
        })

        // setTimeout(function() {
        //   wx.navigateTo({
        //     url: '../t/t?path=' + res.tempImagePath
        //   })
        // }, 1000);
      } else {
        appUtil.showToast('出错啦...');
      }
    });
  },

  /**
   * 裁剪图片
   */
  cutImage: function(src) {
    appUtil.getImageInfo(src, function(res) {
      if (res) {
        that.canvas = wx.createCanvasContext("image-canvas", that);
        //过渡页面中，图片的路径坐标和大小
        that.canvas.drawImage(src, 0, 0, that.data.showPhoneWidth, that.data.showPhoneHeight);
        that.canvas.setStrokeStyle('transparent')
        that.canvas.strokeRect(that.data.showPhoneWidth / 750 * 40, that.data.coverTop, that.data.showPhoneWidth - that.data.showPhoneWidth / 750 * 40 * 2, that.data.cameraShowHeight)
        that.canvas.draw()
        setTimeout(function() {
          wx.canvasToTempFilePath({ //裁剪对参数
            canvasId: "image-canvas",
            x: that.data.showPhoneWidth / 750 * 40, //画布x轴起点
            y: that.data.coverTop, //画布y轴起点
            width: that.data.showPhoneWidth - that.data.showPhoneWidth / 750 * 40 * 2, //画布宽度
            height: that.data.cameraShowHeight, //画布高度
            destWidth: that.data.showPhoneWidth - that.data.showPhoneWidth / 750 * 40 * 2, //输出图片宽度
            destHeight: that.data.cameraShowHeight, //输出图片高度
            canvasId: 'image-canvas',
            success: function(res1) {
              //清除画布上在该矩形区域内的内容。
              that.canvas.clearRect(0, 0, that.data.showPhoneWidth, that.data.showPhoneHeight)
              // that.canvas.drawImage(res1.tempFilePath, that.data.showPhoneWidth / 750 * 40, that.data.coverTop, that.data.showPhoneWidth - that.data.showPhoneWidth / 750 * 40 * 2, that.data.cameraShowHeight)
              that.canvas.draw();


              let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              let prevPage = pages[pages.length - 2];
              var pathUrl = [];
              pathUrl.push(res1.tempFilePath);
              if (that.data.viewType == 1) {
                prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                  firstTempFilePaths: pathUrl
                });
              } else if (that.data.viewType == 2) {
                prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                  secondTempFilePaths: pathUrl
                });
              } else if (that.data.viewType == 3) {
                prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                  thirdTempFilePaths: pathUrl
                });
              }
              wx.navigateBack({
                delta: 1 // 返回上一级页面。
              })

            },
            fail: function(e) {
              appUtil.hideLoading()
              appUtil.showToast('出错啦...');
            }
          });
        }, 1000);
      }
    })
  }



})