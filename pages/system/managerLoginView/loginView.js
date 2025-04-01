const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const md5 = require('../../../utils/md5.js');
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
var that;
var currentTime = 60;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account_value: "",
    password_value: "",
    getverbtnstatus: false,
    getverbtntitle: "获取验证码",
    clickClose: false,
    openId: '',
    type: 1,
    invit_code: '无',
    c_link: 'https://k1swtest.wiselink.net.cn/', //域名
    // c_link: 'http://192.168.43.23:8689/'
  },

  onGetPhoneNumber(e) {
    if (e.detail.code) {
      byPost(this.data.c_link + 'userapi/wxLogin', {
          code: e.detail.code
        },
        (response) => {

          appUtil.setStorage(getApp().data.userKey, response.data.content, function (success) {
            if (success) {
              getApp().data.userInfo = response.data.content;
              wx.navigateBack({
                delta: 1 // 返回上一级页面。
              })

            } else {
              appUtil.showModal("本地数据处理失败，请重新登录！", false, function () {});
            }
          });
        });
    } else {
      console.log('用户拒绝了授权');
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否需要隐私授权
    wx.requirePrivacyAuthorize({
      success: () => {
        console.log('用户已同意隐私协议');
      },
      fail: (err) => {
        console.log('用户拒绝隐私协议', err);
      }
    });
    that = this;
    that.setData({
      openId: options.openId
    });
    console.log("openID=" + that.data.openId);
  },




  onShow: function () {
    const _this = this
    wx.getStorage({
      key: 'scene',
      success(res) {
        _this.setData({
          invit_code: res.data
        })
      },
    })
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
  accountInput: function (e) {
    that.setData({
      account_value: e.detail.value
    })
  },

  /**
   * 验证码输入
   */
  vericodeInput: function (e) {
    that.setData({
      password_value: e.detail.value
    })
  },

  /**
   * 获取验证码
   */
  getVeriCode: function () {

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
  getvercode: function () {

    appUtil.showLoading("正在获取验证码…");
    var param = {};
    param[urlUtil.SendValidateCodePar.PHONE] = that.data.account_value;
    param[urlUtil.SendValidateCodePar.TYPE] = urlUtil.TYPE;
    param[urlUtil.SendValidateCodePar.IS_SEND] = urlUtil.IS_SEND;
    param[urlUtil.SendValidateCodePar.INVITA_CODE] = urlUtil.DEFAULT_INVITATION_CODE;
    param[urlUtil.SendValidateCodePar.openId] = that.data.openId;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.SendValidateCodePar.SEND_VALIDATE_API, param, function (res) {
      appUtil.hideLoading();
      if (res.data.code == 1000) {
        appUtil.showToast('验证码已发送，请注意查收!');
        that.startCountDown();
      } else {
        appUtil.showToast(res.data.msg);
      }
    });
  },

  startCountDown: function () {
    that.dealCountDownData();
    interval = setInterval(function () {
      that.dealCountDownData();
    }, 1000);
  },

  dealCountDownData: function () {
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
  loginBtnTap: function () {
    // that.setData({
    //   account_value:'dzdemo',
    //   password_value:'123456'
    // })

    if (!that.data.account_value) {
      appUtil.showToast('请输入账号');
      return;
    }

    if (!that.data.password_value) {
      appUtil.showToast('请输入密码');
      return;
    }

    that.loginPre();
  },

  loginPre() {
    wx.login({
      success(res) {
        if (res.code) {
          console.log("code=" + res.code);
          that.loginRequest(res.code)
        }
      },
      complete(res) {
        appUtil.hideLoading();
      }
    })
  },
  /**
   * 登录
   */
  loginRequest: function (code) {


    var k1swUrl = "https://k3a.wiselink.net.cn/";
    // var k1swUrl = "http://localhost:8689/";
    var fin3Url = "https://fin3.wiselink.net.cn/fin/";
    if (that.data.account_value == 'dzdemotest') {
      k1swUrl = "https://k1swtest.wiselink.net.cn/"
      fin3Url = "https://fin3.wiselink.net.cn/fin/";
    }

    appUtil.setStorage(getApp().data.k1swUrlKey, k1swUrl, function (success) {
      if (success) {
        getApp().data.k1swUrl = k1swUrl;
      } else {
        appUtil.showModal("本地数据处理失败，请重新登录！", false, function () {});
      }
    });

    appUtil.setStorage(getApp().data.fin3UrlKey, fin3Url, function (success) {
      if (success) {
        getApp().data.fin3Url = fin3Url;
      } else {
        appUtil.showModal("本地数据处理失败，请重新登录！", false, function () {});
      }
    });

    appUtil.showLoading('正在加载中…');
    var param = {};
    param[urlUtil.UserLogin.USERNAME] = that.data.account_value;
    param[urlUtil.UserLogin.PASSWORD] = that.data.password_value;
    param[urlUtil.UserLogin.CODE] = code;
    param[urlUtil.UserLogin.TYPE] = that.data.type;
    // param[urlUtil.CarManagerLogoinPar.COMPANYID] =  getApp().data.companyId;
    appUtil.byPost(k1swUrl + urlUtil.UserLogin.LOGIN_API, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        if (res.data.code == 1000) {
          appUtil.setStorage(getApp().data.userKey, res.data.content, function (success) {
            if (success) {
              getApp().data.userInfo = res.data.content;
              wx.navigateBack({
                delta: 1 // 返回上一级页面。
              })

            } else {
              appUtil.showModal("本地数据处理失败，请重新登录！", false, function () {});
            }
          });
        } else {
          appUtil.showModal(res.data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  onHide: function () {
    clearInterval(interval);
  },

  onUnload: function () {
    if (!that.data.clickClose) {
      getApp().data.operationSn = ''
    }
  },

  reg: function () {
    appUtil.navigateTo('../registView/registView');
  },
  forgetPassword: function () {
    appUtil.navigateTo('../forgetPasswordView/forgetPasswordView');
  },
  getPhoneNumber(e) {
    console.log(e.detail.code)
  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      type: e.detail.value
    })
  },

  regBtnTap: function () {

    // wx.navigateTo({
    //   url: '../registView2/registView2',
    // })
    const scene = wx.getStorageSync('scene');
    wx.navigateTo({
      url: '/pages/agreementWebView/agreementWebView?url=https://k3a.wiselink.net.cn/m/t%3Fc%3D' + scene,
    })

  },

  findBtnTap: function () {
    wx.navigateTo({
      url: '../loginView/loginView',
    })
  }

})