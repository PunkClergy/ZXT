// pages/order/orderList.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');

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
    isShowAddType: true,
    tapType: null
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
    // console.log(that.data.searchText)
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;


    let t = this,
      sbar = this.selectComponent("#searchbar"),
      {
        hideInput
      } = sbar
    console.log(this.selectComponent("#searchbar"))

    // 重写
    Object.defineProperties(sbar.__proto__, {
      hideInput: {
        configurable: true,
        enumerable: true,
        writable: true,
        value(...p) {

          this.triggerEvent('cancel', {})
        }
      }
    })
    that.getCarList();
    that.initialiSource(options)
  },
  initialiSource(options) {
    const _this = this
    const fromPage = options.source;
    _this.setData({
      source: options.source,
      tapType: options.type
    })
  },
  handleSelectStaff(e) {
    if (this.data.source == 'oneClickOrdering') {
      const key = this.data.tapType == 1 ? 'staffInfo' : 'dispatchInfo';
      const value = e.currentTarget.dataset.item;
      wx.setStorage({
        key: key,
        data: value,
        success: function () {
          wx.navigateBack({
            delta: 1
          });
        }
      });
    }
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
          scrollHihgt: res.windowHeight - getApp().data.tabBarHeight - 62
        });
      }
    });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1 //当前页面索引，取值 0、1、2、3...
      })
    }
    // that.restResult();
    //that.getCarList();

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

  },

  getCarList: function () {
    var param = {};
    param[urlUtil.carManagerList.companyId] = getApp().data.userInfo.companyId;
    if (!appUtil.isEmpty(that.data.searchText)) {
      param[urlUtil.carManagerList.realname] = that.data.searchText;
    }

    param[urlUtil.carManagerList.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.carManagerList.URL, param, function (res) {
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
  regCarBtnTap: function () {

    appUtil.navigateTo('add/add');

  },
  editTap: function (e) {
    var index = e.currentTarget.id;
    var items = that.data.items
    var item = items[index];
    // var param = "?sn="+item.sn+"&code="+item.code+"&vehicleSerialCode="+item.vehicleSerialCode+"&faultType="+item.faultType+"&vehicleModeCode="+item.vehicleModeCode+"&carModelCode="+item.carModelCode+"&platenumber="+item.platenumber+"&vin="+item.vin+"&id="+item.id;
    // appUtil.navigateTo('../regDevice/regDevice'+param);

    var param = "?userName=" + item.username + "&mobile=" + item.mobile + "&realname=" + item.name + "&id=" + item.id;
    appUtil.navigateTo('add/add' + param);
  },

  delTap: function (e) {
    appUtil.showModal("确定要删除吗？", true, function (res) {
      if (res) {
        var param = {};
        var id = e.currentTarget.id;
        param[urlUtil.delCarManager.id] = id;
        appUtil.showLoading("处理中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.delCarManager.URL, param, function (res) {
          appUtil.hideLoading();
          if (res.statusCode == 200) {
            var data = res.data;
            if (data.code == 1000) {
              that.restResult();
              that.getCarList();
              appUtil.showModal(data.msg, false, function () {});

            }
          }

        });

      }
    });
  },

  resetTap: function (e) {
    appUtil.showModal("确定要重置密码？重置后密码为123456", true, function (res) {
      if (res) {
        var param = {};
        var id = e.currentTarget.id;
        param[urlUtil.carManagerResetPassword.id] = id;
        appUtil.showLoading("处理中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.carManagerResetPassword.URL, param, function (res) {
          appUtil.hideLoading();
          if (res.statusCode == 200) {
            var data = res.data;
            if (data.code == 1000) {
              that.restResult();
              that.getCarList();
              appUtil.showModal(data.msg, false, function () {});

            }
          }

        });

      }
    });
  },
})