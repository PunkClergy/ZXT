const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const FormData = require('../../../utils/formData.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHihgt: '',
    claimGuid: '',
    type: '',
    reportRecordCertificateFiles: [],  //身份证
    carAgreementFiles: [],  //网约车合同
    carRentalContractFiles: [],  //事故对应的订单
    accidentVerificationFiles: [],  //事故认定书
    sesameCreditCertificateFiles: [], //保险公司定损单
    carInvoiceFiles: [],  //驾驶证
    carOwnershipCertificateFiles: [],  //行驶证
    loanAgreementFiles: [],  //事故现场照片
    insurancePolicyFiles: [],  //网络预约出租汽车驾驶员证
    netDrivingLicenseFiles: [],  //网络预约出租汽车运输证
    businessLicenseFiles: [],  //原车商业险保险公司赔付的证明
    sizeType: ['compressed'], //压缩上传,可以是['original', 'compressed']
    sourceType: ['album', 'camera'], //相册,或拍照

    async uploadFn(e) {

      let urls = [];
      for (let i = 0; i < e.tempFilePaths.length; i++) {
        urls.push(e.tempFilePaths[i]);
      }
      return { urls };
    },
  },

  uploadDelete(e) {
    let id = e.currentTarget.id;
    console.log(id)
    this.data.files.splice(this.data.files.findIndex(item => item == e.detail.item), 1)
  },
  uploadSuccess(e) {

    let id = e.currentTarget.id;
    console.log(id)
    if (id == 1) {
      let files = that.data.carInvoiceFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ carInvoiceFiles: files });
    }
    else if (id == 2) {
      let files = that.data.carOwnershipCertificateFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ carOwnershipCertificateFiles: files });
    }
    else if (id == 3) {
      let files = that.data.reportRecordCertificateFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ reportRecordCertificateFiles: files });
    }
    else if (id == 4) {
      let files = that.data.carRentalContractFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ carRentalContractFiles: files });
    }
    else if (id == 5) {
      let files = that.data.loanAgreementFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ loanAgreementFiles: files });
    }
    else if (id == 6) {
      let files = that.data.accidentVerificationFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ accidentVerificationFiles: files });
    }
    else if (id == 7) {
      let files = that.data.sesameCreditCertificateFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ sesameCreditCertificateFiles: files });
    }
    else if (id == 8) {
      let files = that.data.businessLicenseFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ businessLicenseFiles: files });
    }
    else if (id == 9) {
      let files = that.data.insurancePolicyFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ insurancePolicyFiles: files });
    }
    else if (id == 10) {
      let files = that.data.netDrivingLicenseFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ netDrivingLicenseFiles: files });
    }
    else if (id == 11) {
      let files = that.data.carAgreementFiles;
      e.detail.urls.forEach((url) => {
        files.push({ url, });
      });
      that.setData({ carAgreementFiles: files });
    }
  },


  insuranceSubmitTwo: function () {

    if (that.data.type == 1 && that.data.carInvoiceFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 2 && that.data.carOwnershipCertificateFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 3 && that.data.reportRecordCertificateFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 4 && that.data.carRentalContractFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 5 && that.data.loanAgreementFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 6 && that.data.accidentVerificationFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 7 && that.data.sesameCreditCertificateFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 8 && that.data.businessLicenseFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 9 && that.data.insurancePolicyFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 10 && that.data.netDrivingLicenseFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    else if (that.data.type == 11 && that.data.carAgreementFiles.length == 0) {
      appUtil.showToast('请选择要上传的图片');
      return;
    }
    let formData = new FormData();
    formData.append("claimGuid", that.data.claimGuid);
    for (var i = 0; i < that.data.reportRecordCertificateFiles.length; i++) {
      formData.appendFile("reportRecordCertificateFiles", that.data.reportRecordCertificateFiles[i].url);
    }
    for (var i = 0; i < that.data.carAgreementFiles.length; i++) {
      formData.appendFile("carAgreementFiles", that.data.carAgreementFiles[i].url);
    }
    for (var i = 0; i < that.data.carRentalContractFiles.length; i++) {
      formData.appendFile("carRentalContractFiles", that.data.carRentalContractFiles[i].url);
    }
    for (var i = 0; i < that.data.accidentVerificationFiles.length; i++) {
      formData.appendFile("accidentVerificationFiles", that.data.accidentVerificationFiles[i].url);
    }
    for (var i = 0; i < that.data.sesameCreditCertificateFiles.length; i++) {
      formData.appendFile("sesameCreditCertificateFiles", that.data.sesameCreditCertificateFiles[i].url);
    }
    for (var i = 0; i < that.data.carInvoiceFiles.length; i++) {
      formData.appendFile("carInvoiceFiles", that.data.carInvoiceFiles[i].url);
    }
    for (var i = 0; i < that.data.carOwnershipCertificateFiles.length; i++) {
      formData.appendFile("carOwnershipCertificateFiles", that.data.carOwnershipCertificateFiles[i].url);
    }
    for (var i = 0; i < that.data.loanAgreementFiles.length; i++) {
      formData.appendFile("loanAgreementFiles", that.data.loanAgreementFiles[i].url);
    }
    for (var i = 0; i < that.data.insurancePolicyFiles.length; i++) {
      formData.appendFile("insurancePolicyFiles", that.data.insurancePolicyFiles[i].url);
    }
    for (var i = 0; i < that.data.netDrivingLicenseFiles.length; i++) {
      formData.appendFile("netDrivingLicenseFiles", that.data.netDrivingLicenseFiles[i].url);
    }
    for (var i = 0; i < that.data.businessLicenseFiles.length; i++) {
      formData.appendFile("businessLicenseFiles", that.data.businessLicenseFiles[i].url);
    }

    let data = formData.getData();
    console.log(data, '11111')
    appUtil.showLoading("上传中…");
    appUtil.byPostFormData(getApp().data.k1swUrl + urlUtil.improveLoseClaimFile.URL, data.contentType, data.buffer, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          appUtil.showModal(data.msg, false, function () {
            wx.navigateBack({
              delta: 1 // 返回上一级页面。
            })

          });
        } else {
          appUtil.showModal(data.msg, false, function () { });
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () { });
      }

    });

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    console.log(options.claimGuid);
    that.setData({
      claimGuid: options.claimGuid,
      type: options.type,
    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHihgt: res.windowHeight - 60
        });

        console.log("scrollHihgt=" + that.data.scrollHihgt);
      }
    });
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