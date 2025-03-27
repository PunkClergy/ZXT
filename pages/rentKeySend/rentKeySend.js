// pages/order/orderList.js
const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [], // 数据列表
    page: 1,
    triggered: false,
    searchText: '',
    winWidth: '',
    winHeight: '',
    scrollHihgt: '',
  },

  clearInput: function () {
    console.log("clear")
    that.setData({
      searchText: ''
    })
  },
  restResult: function () {
    that.setData({
      page: 1,
      items: []
    })
  },
  cancel: function (e) {
    that.restResult();
    that.getCarList();

  },
  inputChange: function (e) {
    var t = e.target
    console.log(e.detail.value)
    that.setData({
      searchText: e.detail.value
    })
  },
  handlegSendKey: function (e) {
    console.log(e.target)
    wx.navigateTo({
      url: '/pages/rentKeySend/sending/sending?id=' + e.target.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.getCarList();
  },

  


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          scrollHihgt: res.windowHeight - getApp().data.tabBarHeight - 6
        });
      }
    });

  },


 





  getCarList: function () {
    var param = {};
    param[urlUtil.getCarList.companyId] = getApp().data.userInfo.fin3CompanyId;
    if (!appUtil.isEmpty(that.data.searchText)) {
      param[urlUtil.getCarList.comParam] = that.data.searchText;
    }

    param[urlUtil.getCarList.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getCarList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          if (that.data.page > 1 && data.content.length == 0) {
            appUtil.showToast("已加载全部数据：共" + that.data.items.length + "条")
          }
          that.setData({
            items: that.data.items.concat(data.content)
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },


  lower(e) {
    that.setData({
      page: that.data.page + 1

    });
    that.getCarList();
  },

  refresh(e) {
    that.setData({
      triggered: false,
    })
    that.restResult();
    that.getCarList();
  },

})