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
    linkman: "",
    linkmobile: "",
    linkaddress: '',
    deviceCount: '',
    fwCount: '',
    cost: '',
    yjPrice: '',
    fwPrice: '',
    checkboxState: '',
  },
  handleCheckboxChange(e) {
    const isCheckedString = e.currentTarget.dataset.item === 'checked' ? '' : 'checked';
    this.setData({
      checkboxState: isCheckedString
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.getPrice(1);
    that.getPrice(2);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3 //当前页面索引，取值 0、1、2、3...
      })
    }
  },

  dataClean: function () {
    that.setData({
      linkman: "",
      linkmobile: "",
      linkaddress: '',
      deviceCount: '',
      fwCount: '',
      cost: ''
    })
  },


  linkmanInput: function (e) {
    that.setData({
      linkman: e.detail.value
    })
  },

  linkmobileInput: function (e) {
    that.setData({
      linkmobile: e.detail.value
    })
  },
  linkaddressInput: function (e) {
    that.setData({
      linkaddress: e.detail.value
    })
  },
  deviceCountInput: function (e) {
    that.setData({
      deviceCount: e.detail.value,
      fwCount: e.detail.value * 1000 * that.data.fwPrice,
      cost: e.detail.value * that.data.yjPrice + e.detail.value * 1000 * that.data.fwPrice
    })
  },

  getPrice: function (type) {

    var param = {};
    param[urlUtil.getJ23Price.type] = type;
    param[urlUtil.getJ23Price.companyId] = getApp().data.userInfo.companyId;

    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getJ23Price.URL, param, function (res) {
      appUtil.hideLoading();
      var data = res.data;
      if (data.code == 1000) {
        var content = data.content;
        if (type == 1) {
          that.setData({
            yjPrice: content.price
          })
        } else if (type == 2) {
          that.setData({
            fwPrice: content.price
          })
        }
      } else {
        appUtil.showModal(data.msg, false, function (res) {});
      }
    });
  },

  regBtnTap: function () {
    if (appUtil.isEmpty(that.data.linkman)) {
      appUtil.showToast('请输入收货人');
      return;
    }
    if (appUtil.isEmpty(that.data.linkmobile)) {
      appUtil.showToast('请输入联系电话');
      return;
    }
    if (appUtil.isEmpty(that.data.linkaddress)) {
      appUtil.showToast('请输入地址');
      return;
    }
    if (appUtil.isEmpty(that.data.deviceCount)) {
      appUtil.showToast('请输入购买数量');
      return;
    }


    var param = {};
    param[urlUtil.updateOrInsertOrder.linkman] = that.data.linkman;
    param[urlUtil.updateOrInsertOrder.linkmobile] = that.data.linkmobile;
    param[urlUtil.updateOrInsertOrder.linkaddress] = that.data.linkaddress;
    param[urlUtil.updateOrInsertOrder.deviceCount] = that.data.deviceCount;
    param[urlUtil.updateOrInsertOrder.cost] = that.data.cost;
    param[urlUtil.updateOrInsertOrder.companyId] = getApp().data.userInfo.companyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.updateOrInsertOrder.URL, param, function (res) {
      appUtil.hideLoading();
      var data = res.data;
      if (data.code == 1000) {
        appUtil.showModal(data.msg, false, function (res) {
          that.dataClean();
        });

      } else if (data.code == 6000) {
        appUtil.showModal(data.msg, false, function (res) {
          wx.navigateTo({
            url: '/pages/system/balance/balance',
          })
        });

      } else {
        appUtil.showModal(data.msg, false, function (res) {

        });

      }

    });
  },

  serviceTap: function (e) {
    wx.navigateTo({
      url: '/pages/agreementWebView/agreementWebView?url=https://k3a.wiselink.net.cn/img/service.html',
    })
  },

  privateTap: function (e) {
    wx.navigateTo({
      url: '/pages/agreementWebView/agreementWebView?url=https://k3a.wiselink.net.cn/img/private.html',
    })
  }
})