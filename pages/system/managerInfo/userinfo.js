//工具
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showModal: false,
    newPassword: '',
    confirNewPassword: '',

    showModalUser: false,
    newUsername: '',
    confirNewUsername: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      userInfo: getApp().data.userInfo
    })
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4 //当前页面索引，取值 0、1、2、3...
      })
    }
    that.getUser();
  },

  newPasswordInput: function (e) {
    that.setData({
      newPassword: e.detail.value
    })
  },

  confirNewPasswordInput: function (e) {
    that.setData({
      confirNewPassword: e.detail.value
    })
  },

  newUsernameInput: function (e) {
    that.setData({
      newUsername: e.detail.value
    })
  },

  confirNewUsernameInput: function (e) {
    that.setData({
      confirNewUsername: e.detail.value
    })
  },
  /**
   * 获取用户信息
   */
  getUser: function () {

  },

  updatePasswrodTap: function () {
    wx.showActionSheet({
      itemList: ['修改用户名', '修改密码'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {

          that.setData({
            showModalUser: true,
          })
        } else if (res.tapIndex == 1) {
          that.setData({
            showModal: true,
          })
        }

      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  sureButtonTap: function () {
    if (appUtil.isEmpty(that.data.newPassword) || appUtil.isEmpty(that.data.confirNewPassword) || that.data.newPassword.length < 6) {
      appUtil.showModal("新密码长度不能小于6位！", false, function () {});
    } else if (that.data.newPassword != that.data.confirNewPassword) {
      appUtil.showModal("两次密码不一样，请重新输入！", false, function () {});
    } else {
      that.updatePassword();
    }
  },

  updatePassword: function () {
    var param = {};
    param[urlUtil.updatePassword.newPassword] = that.data.newPassword;
    param[urlUtil.updatePassword.userId] = getApp().data.userInfo.id;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.updatePassword.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        appUtil.showModal(data.msg, false, function () {});
        if (data.code == 1000) {
          that.setData({
            newPassword: '',
            confirNewPassword: '',
            showModal: false,
          })

        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },


  sureButtonUserTap: function () {
    console.log(that.data.newUsername)
    console.log(that.data.confirNewUsername)
    if (appUtil.isEmpty(that.data.newUsername) || appUtil.isEmpty(that.data.confirNewUsername) || that.data.newUsername.length < 6) {
      appUtil.showModal("新用户名长度不能小于6位！", false, function () {});
    } else if (that.data.newUsername != that.data.confirNewUsername) {
      appUtil.showModal("两次用户名不一样，请重新输入！", false, function () {});
    } else {
      that.updateUsername();
    }
  },

  updateUsername: function () {
    var param = {};
    param[urlUtil.updateUserName.newUserName] = that.data.newUsername;
    param[urlUtil.updateUserName.userId] = getApp().data.userInfo.id;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.updateUserName.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        appUtil.showModal(data.msg, false, function () {});
        if (data.code == 1000) {
          that.setData({
            newUsername: '',
            confirNewUsername: '',
            'userInfo.username': that.data.newUsername,
            showModalUser: false,
          })

        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  unLoginBtnTap: function () {
    getApp().data.userInfo = '';
    try {
      wx.clearStorageSync();
    } catch (e) {
      wx.clearStorage();
    }

    wx.switchTab({
      url: '/pages/desk/desk'
    })
    //  console.log("exiit");
    //   wx.navigateBack({
    //     delta: 1 // 返回上一级页面。
    //   })
  },

  cancelButttonTap: function () {
    that.setData({
      showModal: false,
    })
  },

  cancelButttonUserTap: function () {
    that.setData({
      showModalUser: false,
    })
  },
  balanceTap: function (e) {
    wx.navigateTo({
      url: '/pages/system/balance/balance',
    })
  }

})