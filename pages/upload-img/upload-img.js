//工具
const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
var uploadTask;
var that;
const idcardFrontTip = '点击上传身份证头像面';
const idcardBackgroundTip = '点击上传身份证国徽面';
const drivingcardTip = '点击上传驾驶证主页';


Page({
  /**
   * 页面的初始数据
   */
  data: {
    showHeight: 0, //(showPhoneHeight  - 70rpx - 130rpx)
    cardWidth: 0, //卡片宽度
    showPhoneHeight: 0,
    showPhoneWidth: 0,
    canScroll: true, //是否可以滑动
    firstHidden: true,
    secondHidden: true,
    thirdHidden: true,
    firstDefaultTip: '',
    secondDefaultTip: '',
    thirdDefaultTip: '',
    firstCardHeight: 0, //卡片高度
    secondCardHeight: 0, //卡片高度
    thirdCardHeight: 0, //卡片高度
    idcardHeight: 0,
    drivingcardHeight: 0,
    firstTempFilePaths: [],
    secondTempFilePaths: [],
    thirdTempFilePaths: [],
    fourthTempFilePaths: [],
    fifthTempFilePaths: [],
    progressTip: '',
    showType: 0,
    currentViewType: 0,
    currentCardType: 0,
    driverLicenseImg: '', //驾照主页图片url
    idCardImg: '', // 身份证正面图片url
    idCardImgSecond: '', // 身份证背面图片url
    leftGap: 40, //单位rpx
    authCamera: false,
    uploadUrl: '', //上传图片地址
    code:'',
  },

  onReady: function() {
    appUtil.getSystemInfoComplete(function(res) {
      that.setData({
        showPhoneHeight: res.windowHeight,
        showPhoneWidth: res.windowWidth,
        showHeight: res.windowHeight - res.windowWidth / 750 * (70 + 130),
        cardWidth: res.windowWidth - res.windowWidth / 750 * (750 - 80),
        idcardHeight: (res.windowWidth / 750 * (750 - 80)) / 1.6,
        drivingcardHeight: (res.windowWidth / 750 * (750 - 80)) / 1.6
      });
    }, function() {

      if (that.data.showType == appUtil.SHOW_TYPE.IDCARD_TYPE) {
        //上传身份证

        that.setData({

          firstDefaultTip: idcardFrontTip,
          firstCardHeight: that.data.idcardHeight,
          firstHidden: false,

          secondDefaultTip: idcardBackgroundTip,
          secondCardHeight: that.data.idcardHeight,
          secondHidden: false,


          thirdHidden: true,

        });

      } else if (that.data.showType == appUtil.SHOW_TYPE.DRIVINGCARD_TYPE) {
        //上传驾驶证

        that.setData({

          firstDefaultTip: drivingcardTip,
          firstCardHeight: that.data.drivingcardHeight,
          firstHidden: false,

          secondHidden: true,


          thirdHidden: true,

        });
      } else if (that.data.showType == appUtil.SHOW_TYPE.ALL_TYPE) {
        //全部上传

        that.setData({

          firstDefaultTip: idcardFrontTip,
          firstCardHeight: that.data.idcardHeight,
          firstHidden: false,

          secondDefaultTip: idcardBackgroundTip,
          secondCardHeight: that.data.idcardHeight,
          secondHidden: false,


          thirdDefaultTip: drivingcardTip,
          thirdCardHeight: that.data.drivingcardHeight,
          thirdHidden: false,

        });

      }

      // that.getUserInfo(getApp().data.userInfo);

    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      showType: options.type,
      code:options.code,
    });
  },

  /**
   * 上传图片
   */
  inputCardBtnTap: function(e) {
    that.chooseImage(1, e.currentTarget.id);
    return;
    if (e.currentTarget.id == '1') {
      if (that.data.firstDefaultTip == idcardFrontTip) {
        //上传身份证正面
        that.chooseImage(1, 1);
      } else if (that.data.firstDefaultTip == idcardBackgroundTip) {
        //上传身份证反面
        that.chooseImage(1, 2);
      } else if (that.data.firstDefaultTip == drivingcardTip) {
        //上传驾驶证主页
        that.chooseImage(1, 3);
      }
    } else if (e.currentTarget.id == '2') {
      if (that.data.secondDefaultTip == idcardFrontTip) {
        //上传身份证正面
        that.chooseImage(2, 1);
      } else if (that.data.secondDefaultTip == idcardBackgroundTip) {
        //上传身份证反面
        that.chooseImage(2, 2);
      } else if (that.data.secondDefaultTip == drivingcardTip) {
        //上传驾驶证主页
        that.chooseImage(2, 3);
      }
    } else if (e.currentTarget.id == '3') {
      if (that.data.thirdDefaultTip == idcardFrontTip) {
        //上传身份证正面
        that.chooseImage(3, 1);
      } else if (that.data.thirdDefaultTip == idcardBackgroundTip) {
        //上传身份证反面
        that.chooseImage(3, 2);
      } else if (that.data.thirdDefaultTip == drivingcardTip) {
        //上传驾驶证主页
        that.chooseImage(3, 3);
      }
    }
  },

  /**
   * 选择照片
   * viewType:第几个view
   * cardType:1身份证正面、2身份证反面、3驾驶证正面
   */
  chooseImage: function(viewType, cardType) {

    // appUtil.chooseImageDefault(function(res) {
    //   if (res) {
    //     if (viewType == 1) {
    //       that.setData({
    //         firstTempFilePaths: res.tempFilePaths
    //       });
    //     } else if (viewType == 2) {
    //       that.setData({
    //         secondTempFilePaths: res.tempFilePaths
    //       });
    //     } else if (viewType == 3) {
    //       that.setData({
    //         thirdTempFilePaths: res.tempFilePaths
    //       });
    //     }
    //     // var tempFilePaths = res.tempFilePaths[0];
    //     // var tempFilesSize = res.tempFiles[0].size;
    //     that.uploadImg();
    //   }
    // });

    //自定义相机
    // appUtil.navigateTo('../camera/camera?view=' + viewType + "&card=" + cardType + "&showPhoneHeight=" + that.data.showPhoneHeight + "&showPhoneWidth=" + that.data.showPhoneWidth + '&cameraShowHeight=' + (that.parseCameraShowHeight(cardType)));
    appUtil.navigateTo('../camera/camera?view=' + viewType + "&card=" + cardType);
  },

  parseCameraShowHeight: function(cameraType) {
    if (cameraType == 1) {
      return that.data.firstCardHeight;
    } else if (cameraType == 2) {
      return that.data.secondCardHeight;
    } else if (cameraType == 3) {
      return that.data.thirdCardHeight;
    }
  },

  onShow: function() {
    if (that.data.authCamera) {
      that.setData({
        authCamera: false
      });
      appUtil.showModal('请打开相机权限!', true, function(res) {
        if (res) {
          wx.openSetting({
            success(res) {}
          })
        }
      });
      return;
    }


    var cardType = that.data.currentCardType;
    console.log('-----------upload:--view:' + that.data.currentViewType + ',type:' + that.data.currentCardType);
    if (that.data.currentViewType == 1) {
      if (that.data.firstTempFilePaths.length != 0) {
        // that.uploadImg(that.data.firstTempFilePaths[0], cardType);
      }
    } else if (that.data.currentViewType == 2) {
      if (that.data.secondTempFilePaths.length != 0) {
        // that.uploadImg(that.data.secondTempFilePaths[0], cardType);
      }
    } else if (that.data.currentViewType == 3) {
      if (that.data.thirdTempFilePaths.length != 0) {
        // that.uploadImg(that.data.thirdTempFilePaths[0], cardType);
      }
    }

    that.setData({
      currentViewType: 0,
      currentCardType: 0
    });
  },

  /**
   * 上传照片
   */
  uploadImg: function(temPath, cardType) {
    appUtil.showLoading('请稍后...');
    var param = {};
    param[urlUtil.UploadImageUrl.CODE] = that.data.code;
    uploadTask = appUtil.uploadFile2(urlUtil.UploadImageUrl.UPLOAD_API,"img1Arr", temPath, param, function(res) {
      appUtil.hideLoading(); 
      if (res && res.statusCode == 200) {
        var data = JSON.parse(res.data);
        if (data.code == 1000) {
          appUtil.showToast('上传成功！');
          if (cardType == 1) {
            that.setData({
              idCardImg: data.data.relativePath
            });
          } else if (cardType == 2) {
            that.setData({
              idCardImgSecond: data.data.relativePath
            });
          } else if (cardType == 3) {
            that.setData({
              driverLicenseImg: data.data.relativePath
            });
          }
        } else {
          appUtil.showModal(data.data.message, false, function() {});
        }
      } else {
        appUtil.showModal('网络异常，图片上传失败！', false, function() {});
      }

    });
  },

  uploadImg2 : function (url,code,fileNmae,filePath)
  {
    appUtil.showLoading('请稍后...');
    uploadTask = appUtil.uploadFile2(url,fileNmae,filePath, {'code':code}, function(res) {
      appUtil.hideLoading(); 
      if (res && res.statusCode == 200) {
        var data = JSON.parse(res.data);
        if (data.code == 1000) {
          // appUtil.showToast('上传成功！');
        } else {
          appUtil.showModal(data.msg, false, function() {});
        }
      } else {
        appUtil.showModal('网络异常，图片上传失败！', false, function() {});
      }

    });
  },

  /**
   * 提交
   */
  submitBtnTap: function() { 
    
    // var url = "https://fin3.wiselink.net.cn/fin/h5Car/saveImg";
    var url = 'https://fin3.wiselink.net.cn/fin/' + "h5Car/saveImg";
    var code = that.data.code;
    if(that.data.firstTempFilePaths.length == 0 || that.data.firstTempFilePaths[0].length == 0)
    {
      appUtil.showToast('请上传车头照片！');
      return;
    }
    else if(that.data.secondTempFilePaths.length == 0 || that.data.secondTempFilePaths[0].length == 0)
    {
      appUtil.showToast('请上传车尾照片！');
      return;
    }
    else if(that.data.thirdTempFilePaths.length == 0 || that.data.thirdTempFilePaths[0].length ==  0)
    {
      appUtil.showToast('请上传车身左侧照片！');
      return;
    }
    else if(that.data.fourthTempFilePaths.length == 0 || that.data.fourthTempFilePaths[0].length ==  0)
    {
      appUtil.showToast('请上传车身右侧照片！');
      return;
    }
    else if(that.data.fifthTempFilePaths.length == 0 || that.data.fifthTempFilePaths[0].length ==  0)
    {
      appUtil.showToast('请上传车钥匙位置照片！');
      return;
    }
    else
    {
      that.uploadImg2(url,code,"img1Arr",that.data.firstTempFilePaths[0]);
      that.uploadImg2(url,code,"img2Arr",that.data.secondTempFilePaths[0]);
      that.uploadImg2(url,code,"img3Arr",that.data.thirdTempFilePaths[0]);
      that.uploadImg2(url,code,"img4Arr",that.data.fourthTempFilePaths[0]);
      that.uploadImg2(url,code,"img5Arr",that.data.fifthTempFilePaths[0]);
    }
    

    
    // let pages = getCurrentPages();
    // let prePage = pages[pages.length - 2];
    // prePage.setData({
    //  reLunch:false,
    // })
    this.carManagerFinish()
    // wx.navigateBack({
    //   delta: 1
    // })
  },
  carManagerFinish : function(){
    var param = {};
    param[urlUtil.returnCar.CONTROLCODE] = that.data.code;
    appUtil.byPost('https://fin3.wiselink.net.cn/fin/' + urlUtil.returnCar.URL, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          wx.removeStorage({
            key: 'scene',
          })
          wx.redirectTo({
            url: '/pages/index/index',
          })

          
          appUtil.showModal(data.msg, false, function() {});
        } else {
          appUtil.showModal(data.msg, false, function() {});
        }
      } else {
        appUtil.showToast('网络异常！');
      }
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function(user) {
    var param = {};
    param[urlUtil.MemberManagementInfoPar.ID] = user.id;
    appUtil.byPost(urlUtil.MemberManagementInfoPar.MEMBER_MANAGERMENT_API, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == '10000') {
          if (appUtil.isEmpty(data.data.fileInterfaceAddress)) {
            that.goBack();
            return;
          } else {
            that.setData({
              uploadUrl: data.data.fileInterfaceAddress
            });
          }
          //请求成功
          if (that.data.showType == appUtil.SHOW_TYPE.IDCARD_TYPE) {
            var firstTempFilePaths = [];
            firstTempFilePaths.push(data.data.identityCardUrl)
            var secondTempFilePaths = [];
            secondTempFilePaths.push(data.data.identityCardBackUrl);
            that.setData({
              firstTempFilePaths: firstTempFilePaths,
              secondTempFilePaths: secondTempFilePaths,
            });
          } else if (that.data.showType == appUtil.SHOW_TYPE.DRIVINGCARD_TYPE) {
            var firstTempFilePaths = [];
            firstTempFilePaths.push(data.data.drivinglicenceurl)
            that.setData({
              firstTempFilePaths: firstTempFilePaths,
            });
          } else if (that.data.showType == appUtil.SHOW_TYPE.ALL_TYPE) {
            var firstTempFilePaths = [];
            firstTempFilePaths.push(data.data.identityCardUrl)
            var secondTempFilePaths = [];
            secondTempFilePaths.push(data.data.identityCardBackUrl);
            var thirdTempFilePaths = [];
            thirdTempFilePaths.push(data.data.drivinglicenceurl);
            that.setData({
              firstTempFilePaths: firstTempFilePaths,
              secondTempFilePaths: secondTempFilePaths,
              thirdTempFilePaths: thirdTempFilePaths
            });
          }
        } else {
          that.goBack();
        }
      } else {
        that.goBack();
      }
    });
  },

  goBack: function() {
    appUtil.showModal('用户信息获取失败！', false, function(res) {
      wx.navigateBack({
        delta: 1
      })
    });
  },
  takePhoto: function() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          progressTip: res.tempImagePath
        })
      },
      fail: function() {
        result(false);
      }
    })
  }
})