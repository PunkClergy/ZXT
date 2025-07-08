const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: 'https://k3a.wiselink.net.cn/' + 'img/',
    claimGuid: '',
    edit: '',
    item: {},
    personLicenseFiles: [],  //身份证
    carAgreementFiles: [],  //网约车合同
    accidentOrderFiles: [],  //事故对应的订单
    accidentVerificationFiles: [],  //事故对应的订单
    lossAssessmentFormFiles: [], //保险公司定损单
    driverLicenseFiles: [],  //驾驶证
    drivingLicenseFiles: [],  //行驶证
    accidentSceneFiles: [],  //事故现场照片
    netDriverLicenseFiles: [],  //网络预约出租汽车驾驶员证
    netDrivingLicenseFiles: [],  //网络预约出租汽车运输证
    compensationProofFiles: [],  //原车商业险保险公司赔付的证明
    scrollHihgt: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      claimGuid: options.claimGuid,
      edit: options.edit,
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHihgt: res.windowHeight - 100
        });
      }
    });
  },
  getShutdownClaim: function (e) {
    var param = {};
    appUtil.showLoading("加载中...")
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.getShutdownClaim.URL, { claimGuid: that.data.claimGuid }, function (res) {
      console.log(res, '222222')
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          that.setData({
            item: data.content,
          })

          for (var i = 0; i < that.data.item.fileList.length; i++) {
            var file = that.data.item.fileList[i];
            file.filePath = file.filePath.replace(/\\/g, "/");
            if (file.type == 1) {
              that.setData({
                driverLicenseFiles: that.data.driverLicenseFiles.concat(file)
              })
            }
            else if (file.type == 2) {
              that.setData({
                drivingLicenseFiles: that.data.drivingLicenseFiles.concat(file)
              })
            }
            else if (file.type == 3) {
              that.setData({
                personLicenseFiles: that.data.personLicenseFiles.concat(file)
              })
            }
            else if (file.type == 4) {
              that.setData({
                accidentOrderFiles: that.data.accidentOrderFiles.concat(file)
              })
            }
            else if (file.type == 5) {
              that.setData({
                accidentSceneFiles: that.data.accidentSceneFiles.concat(file)
              })
            }
            else if (file.type == 6) {
              that.setData({
                accidentVerificationFiles: that.data.accidentVerificationFiles.concat(file)
              })
            }
            else if (file.type == 7) {
              that.setData({
                lossAssessmentFormFiles: that.data.lossAssessmentFormFiles.concat(file)
              })
            }
            else if (file.type == 8) {
              that.setData({
                compensationProofFiles: that.data.compensationProofFiles.concat(file)
              })
            }
            else if (file.type == 9) {
              that.setData({
                netDriverLicenseFiles: that.data.netDriverLicenseFiles.concat(file)
              })
            }
            else if (file.type == 10) {
              that.setData({
                netDrivingLicenseFiles: that.data.netDrivingLicenseFiles.concat(file)
              })
            }
            else if (file.type == 11) {
              that.setData({
                carAgreementFiles: that.data.carAgreementFiles.concat(file)
              })
            }

          }
        }
        else {
          appUtil.showModal(data.msg, false, function () { });
        }
      }
      else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () { });
      }

    });
  },

  toEditBase: function (e) {
    appUtil.navigateTo('/pages/wycclaimDetail/claimBaseEdit/claimBaseEdit?claimGuid=' + that.data.claimGuid);
  },

  toEditFile: function (e) {
    let id = e.currentTarget.id;
    appUtil.navigateTo('/pages/wycclaimDetail/claimFileEdit/claimFileEdit?claimGuid=' + that.data.claimGuid + "&type=" + id);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that.setData({
      item: {},
      personLicenseFiles: [],  //身份证
      carAgreementFiles: [],  //网约车合同
      accidentOrderFiles: [],  //事故对应的订单
      accidentVerificationFiles: [],  //事故对应的订单
      lossAssessmentFormFiles: [], //保险公司定损单
      driverLicenseFiles: [],  //驾驶证
      drivingLicenseFiles: [],  //行驶证
      accidentSceneFiles: [],  //事故现场照片
      netDriverLicenseFiles: [],  //网络预约出租汽车驾驶员证
      netDrivingLicenseFiles: [],  //网络预约出租汽车运输证
      compensationProofFiles: [],  //网络预约出租汽车运输证
    })
    that.getShutdownClaim();
  },

  skanImage(e) {
    // let imgList = this.data.sgrdImgArr // 修正这里的变量名，确保与 data 中的属性一致
    //  let index = e.currentTarget.dataset.index // 正确获取 index
    console.log(e.currentTarget.dataset.src)
    let imgArr = [];
    imgArr.push(e.currentTarget.dataset.src);
    wx.previewImage({
      urls: imgArr,
      //  current: imgList[index]
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})