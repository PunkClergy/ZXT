const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const md5 = require('../../../utils/md5.js');
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  u_logo,
  u_getQrcodeImg,
  u_setBtype,
  u_bindChannelinfo,
  u_channelInfo,
  u_confirmBindChannel,
} = require('../../../utils/request/home')
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
    invit_code: '',
    init_qr_code: '',
    c_link: 'https://k1sw.wiselink.net.cn/', //域名
    logoSrc: '/assets/images/login/logo.png',
    // c_link: 'http://192.168.43.23:8689/'
    btypeM: false,
    selected: ''
  },

  // 预览图片
  handlePreviewImage(evt) {
    wx.previewMedia({
      sources: [{
        url: this.data.init_qr_code, // 图片路径
        type: 'image',
      }, ],
    });
  },
  // 选择选项
  handleSelectOption(e) {
    const value = parseInt(e.currentTarget.dataset.value)
    this.setData({
      selected: value
    })
  },
  handleConfirmSelect() {
    if (!this.data.selected) return
    byPost(this.data.c_link + u_setBtype.URL, {
      btype: this.data.selected
    }, (res) => {
      console.log(res)
      if (res?.data?.code == 1000) {
        this.setData({
          btypeM: false
        }, () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        })
      }
    });
  },
  async onGetPhoneNumber(e) {
    const _this = this
    try {
      // 获取登录凭证
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: (err) => reject(new Error(`登录失败: ${err.errMsg}`))
        });
      });

      if (!loginRes.code) {
        throw new Error('无法获取登录凭证');
      }

      // 检查授权码
      if (!e.detail?.code) {
        console.warn('用户拒绝了授权');
        return;
      }

      // 发送登录请求
      const response = await new Promise((resolve, reject) => {
        byPost(
          `${this.data.c_link}userapi/wxLogin`, {
            code: e.detail.code,
            inviteCode: this.data.invit_code || '',
            wxCode: loginRes.code
          },
          (res) => {
            if (res?.data?.content) {
              resolve(res);
            } else {
              reject(new Error(res?.data?.message || '登录接口响应异常'));
            }
          },
          (err) => reject(new Error(`网络请求失败: ${err.errMsg}`))
        );
      });

      const userInfo = response.data.content;
      if (!userInfo) {
        throw new Error('用户信息获取失败');
      }

      // 配置URL
      const isTestUser = userInfo.username === '13683187039*';
      const urlConfig = {
        k1swUrl: isTestUser ?
          'https://k1swtest.wiselink.net.cn/' : 'https://k3a.wiselink.net.cn/',
        fin3Url: 'https://fin3.wiselink.net.cn/fin/' // 固定地址
      };

      // 批量存储数据
      const app = getApp();
      const storageTasks = [
        [app.data.k1swUrlKey, urlConfig.k1swUrl],
        [app.data.fin3UrlKey, urlConfig.fin3Url],
        [app.data.userKey, userInfo]
      ].map(([key, value]) => new Promise((resolve, reject) => {
        appUtil.setStorage(key, value, (success) =>
          success ? resolve() : reject(`存储失败: ${key}`)
        );
      }));

      await Promise.all(storageTasks);

      // 更新应用数据
      app.data.k1swUrl = urlConfig.k1swUrl;
      app.data.fin3Url = urlConfig.fin3Url;
      app.data.userInfo = userInfo;
      app.data.reflag = 1;
      console.log(response?.data, '3332232323')
      // 1判断此账号是否是否已绑定
      byGet(this.data.c_link + u_bindChannelinfo.URL, {}).then(response => {
        const rspns = response.data.content
        console.log(!rspns)
        if (response?.data?.code != 1000) {
          // 2判断是否有邀请码
          wx.getStorage({
            key: 'invite',
            success: res => {
              // 3搜索此邀请码所属主体
              byGet(_this.data.c_link + u_channelInfo.URL, {
                inviteCode: res?.data
              }).then(response_one => {
                console.log(response_one)
                if (response_one?.data?.code == 1000) {
                  wx.showModal({
                    title: '提示',
                    content: `您是通过【${response_one?.data?.name}-${response_one?.data?.chargename}】邀请使用小程序，是否同意绑定为您的上级渠道？`,
                    success(res_set) {
                      if (res_set.confirm) {
                        console.log('用户点击确定')
                        // 绑定此渠道
                        byPost(_this.data.c_link + u_confirmBindChannel.URL, {
                          inviteCode: res?.data
                        }, (res_bid) => {
                          if (res_bid?.data?.code == 1000) {
                            wx.showToast(res?.data.msg)
                            wx.redirectTo({
                              url: '/pages/index/index',
                            })
                          }

                        });
                      } else if (res_set.cancel) {
                        console.log('用户点击取消')
                        wx.redirectTo({
                          url: '/pages/index/index',
                        })
                      }
                    }
                  })
                } else {
                  wx.redirectTo({
                    url: '/pages/index/index',
                  })
                }
              })
            },
            fail: () => {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      })
      // 1.判断是否有邀请码
      // 2.判断此账号是否是否已绑定
      // 3.搜索此邀请码所属主体
      // 4.绑定此邀请公司

      // wx.navigateBack({ delta: 1 });
      // wx.redirectTo({
      //   url: '/pages/index/index',
      // })

      return
    } catch (error) {
      console.error('处理流程异常:', error);
      const errorMsg = error.message.includes('存储失败') ?
        '本地数据处理失败，请重新登录！' :
        '操作失败，请检查网络后重试';

      appUtil.showModal(errorMsg, false, () => {
        /* 可添加重试逻辑 */
      });
    }
  },
  initQrCode() {
    const _this = this
    byGet(_this.data.c_link + u_getQrcodeImg.URL, {}).then(response => {
      const rspns = response.data.content
      console.log(rspns)
      _this.setData({
        init_qr_code: rspns?.img
      })
    })
  },
  initLogo() {
    const _this = this
    byGet(_this.data.c_link + u_logo.URL, {}).then(response => {
      const rspns = response.data.content
      const {
        c_link
      } = this.data;
      const logoSrc = `${c_link}/img/${rspns.img}`;
      this.setData({
        logoSrc
      });
    })
  },
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
      key: 'invite',
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
    this.initLogo()
    this.initQrCode()
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
    param.inviteCode = that.data.invit_code
    // param[urlUtil.CarManagerLogoinPar.COMPANYID] =  getApp().data.companyId;
    appUtil.byPost(k1swUrl + urlUtil.UserLogin.LOGIN_API, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        if (res.data.code == 1000) {
          appUtil.setStorage(getApp().data.userKey, res.data.content, function (success) {
            if (success) {
              getApp().data.userInfo = res.data.content;

              getApp().data.reflag = 1
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