const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const md5 = require('../../../utils/md5.js');
var that;
var currentTime = 60;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    k3aUrl : "https://k3a.wiselink.net.cn/",
    // k3aUrl : "http://localhost:8689/",
    account_value: "",
    password_value: "",
    getverbtnstatus: false,
    getverbtntitle: "获取验证码",
    clickClose: false,
    openId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      openId:options.openId
    });
    console.log("openID=" + that.data.openId);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    that.setData({
      getverbtnstatus: false,
      getverbtntitle: "获取验证码"
    });
    currentTime = 60;
    clearInterval(interval);
  },

  /**
   * 手机号输入
   */
  accountInput: function(e) {
    that.setData({
      account_value: e.detail.value
    })
  },

  /**
   * 验证码输入
   */
  vericodeInput: function(e) {
    that.setData({
      password_value: e.detail.value
    })
  },

  /**
   * 获取验证码
   */
  getVeriCode: function() {

    if (!that.data.account_value) {
      appUtil.showToast('请输入手机号');
      return;
    }

    if (that.data.account_value.length != 11) {
      appUtil.showToast('手机号不正确');
      return;
    }

    that.getvercode();
  },

  /**
   * 获取验证码
   */
  getvercode: function() {

    appUtil.showLoading("正在获取验证码…");
    var param = {};
    param[urlUtil.SendValidateCodePar.PHONE] = that.data.account_value;
    // param[urlUtil.SendValidateCodePar.TYPE] = urlUtil.TYPE;
    // param[urlUtil.SendValidateCodePar.IS_SEND] = urlUtil.IS_SEND;
    // param[urlUtil.SendValidateCodePar.INVITA_CODE] = urlUtil.DEFAULT_INVITATION_CODE;
    // param[urlUtil.SendValidateCodePar.openId] = that.data.openId;
    appUtil.byPost(that.data.k3aUrl + urlUtil.SendValidateCodePar.SEND_VALIDATE_API, param, function(res) {
      appUtil.hideLoading();
      if (res.data.code == 1000) {
        appUtil.showToast('验证码已发送，请注意查收!');
        that.startCountDown();
      } else {
        appUtil.showToast(res.data.msg);
      }
    });
  },

  startCountDown: function() {
    that.dealCountDownData();
    interval = setInterval(function() {
      that.dealCountDownData();
    }, 1000);
  },

  dealCountDownData: function() {
    currentTime--;
    if (currentTime < 0) {
      that.setData({
        getverbtnstatus: false,
        getverbtntitle: "获取验证码"
      });
      currentTime = 60;
      clearInterval(interval);
    } else {
      that.setData({
        getverbtnstatus: true,
        getverbtntitle: currentTime + "s后获取"
      });
    }
  },

  /**
   * 登录
   */
  loginBtnTap: function() {

    if (!that.data.account_value) {
      appUtil.showToast('请输入手机号');
      return;
    }

    if (!that.data.password_value) {
      appUtil.showToast('请输入验证码');
      return;
    }

    that.loginRequest();
  },

  /**
   * 登录
   */
  loginRequest: function() {

    appUtil.showLoading('正在加载中…');
    var param = {};
    param[urlUtil.LogoinPar.MOBILE] = that.data.account_value;
    // param[urlUtil.LogoinPar.YZCODE] = md5.hex_md5(that.data.password_value);
    param[urlUtil.LogoinPar.YZCODE] = that.data.password_value;
    // param[urlUtil.LogoinPar.OPEN_ID] = that.data.openId;
    // param[urlUtil.LogoinPar.COMPANYID] =  getApp().data.companyId;
    appUtil.byPost(that.data.k3aUrl + urlUtil.LogoinPar.LOGIN_API, param, function(res) {
      appUtil.hideLoading();
      if (res.data.code == 1000) {
        var content = res.data.content;
        appUtil.showModal("您的账号:"+content.username+" 密码:"+content.password, false, function() {});
      } else {
        appUtil.showModal(res.data.msg, false, function() {});
      }
    });
  },

  onHide: function() {
    clearInterval(interval);
  },

  onUnload: function() {
    if (!that.data.clickClose) {
      getApp().data.operationSn = ''
    }
  }

})