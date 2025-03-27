// pages/system/registView/registView.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var currentTime = 60;
var interval;
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username:"",
    phonenum:"",
    vericode:"",
    password:"",
    seeimg_url:"../../../assets/images/viewoff.png",
    seepwd:true,
    getverbtnstatus: false,
    getverbtntitle: "获取验证码"
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
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
      getverbtnstatus: false,
      getverbtntitle: "获取验证码"
    });
    currentTime = 60;
    clearInterval(interval);
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
    clearInterval(interval);
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
  
  },
  /**
   * 改变眼睛的状态
   */
  changeSeeState: function () {

    that.setData({
      seepwd: !that.data.seepwd,
      password: that.data.password
    })

    
    if (that.data.seepwd)
    {
      that.setData({
        seeimg_url: "../../../assets/images/viewoff.png"
      })
       
    }
    else
    {
      that.setData({
        seeimg_url: "../../../assets/images/view.png"
      })
    }
  },
  usernameInput: function (e) {
    that.setData({
      username: e.detail.value
    })
  },
  phoneNumInput: function (e) {
    that.setData({
      phonenum: e.detail.value
    })
  },
  vericodeInput: function (e) {
    that.setData({
      vericode: e.detail.value
    })
  },
  passwordInput: function (e) {
    that.setData({
      password: e.detail.value
    })
  },
  getVeriCode: function () {

    console.log(that.data.phonenum)
    if (!that.data.phonenum)
    {
      wx.showToast({
        title: '请输入手机号',
        icon:"none"
      })
      return;
    }
    that.getvercode();

    
  },
  submitBtnTap: function () {

      if (!that.data.username) {
      wx.showToast({
        title: '请输入姓名',
        icon: "none"
      })
      return;
    }
    if (!that.data.phonenum) {
      wx.showToast({
        title: '请输入手机号',
        icon: "none"
      })
      return;
    }
    if (!that.data.vericode) {
      wx.showToast({
        title: '请输入验证码',
        icon: "none"
      })
      return;
    }
    if (!that.data.password) {
      wx.showToast({
        title: '请输入密码',
        icon: "none"
      })
      return;
    }
    wx.showLoading({
      title: '正在加载中……',
    });
    var param = {};
    param[urlUtil.CarOwnerReg.NAME] = that.data.username;
    param[urlUtil.CarOwnerReg.YZCODE] = that.data.vericode;
    param[urlUtil.CarOwnerReg.MOBILE] = that.data.phonenum;
    param[urlUtil.CarOwnerReg.PASSWORD] = that.data.password;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.CarOwnerReg.URL, param, function(res) {
      wx.hideLoading();
      if (res.data.code == 1000) {
          appUtil.setStorage(getApp().data.managerKey, res.data.content, function(success) {
            if (success) {
              getApp().data.managerInfo = res.data.content;
              appUtil.showModal('恭喜你注册成功!', false, function(res) {
                wx.navigateBack({
                  delta: 2
              })
              });
              
            } else {
              appUtil.showModal("本地数据处理失败，请重新登录！", false, function() {});
            }
          });

          wx.showToast({
            title: res.data.msg,
          })
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
    })
  },

  getvercode: function(){
    console.log(that.data.phonenum)
    wx.showLoading({
      title: '正在获取验证码……',
    });

    var param = {};
    param[urlUtil.SendRegValidateCode.PHONE] = that.data.phonenum;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.SendRegValidateCode.SEND_VALIDATE_API, param, function(res) {
        wx.hideLoading();
        // console.log(res.data);
        if (res.data.code == '10000') {
          wx.showToast({
            title: res.data.message,
          })
          
          interval = setInterval(function () {

            currentTime--;
            if (currentTime < 0) {
              that.setData({
                getverbtnstatus: false,
                getverbtntitle: "获取验证码"
              });
              currentTime = 60;
              clearInterval(interval);
            }
            else {

              that.setData({
                getverbtnstatus: true,
                getverbtntitle: currentTime + "s后获取"
              });
            }

          }, 1000);

        }
        else {
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
        }
      
    })
  }
  
})