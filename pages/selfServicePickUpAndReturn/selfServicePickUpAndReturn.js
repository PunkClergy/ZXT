// pages/order/orderList.js
const urlUtil = require('../../utils/url-util.js');
const appUtil = require('../../utils/app-util')

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
    // 卡片组件需要数据 start
    dataCollection: [{
      name: '发送方式',
      value: 'sendmethod'
    }, {
      name: '自助取还APP/链接',
      value: 'applinkname'
    }, {
      name: '自助取还账号',
      value: 'username'
    }, {
      name: '自助取还密码',
      value: 'password'
    }],
    listType: 3,
    headDataSet: [{
      name: '工单类型',
      img: '/assets/images/home/orderTypeIcon.png',
      value: 'platename'
    }],
    stateCollection: [],
    // 卡片组件需要数据 end
  },


  clearInput: function () {
    console.log("clear")
    that.setData({
      searchText: ''
    })
  },

  // 查询条件状态筛选
  handleStatePicker(e) {
    const index = e.detail.value;
    const {
      objectStateArray
    } = this.data;
    const selectedStateItem = objectStateArray[index]
    if (selectedStateItem) {
      this.setData({
        selectedStateItem,
      });
    }
    this.getOrderList()
  },
  // 查询条件类型筛选
  handleTypePicker(e) {
    const index = e.detail.value;
    const {
      objectTypeArray
    } = this.data;
    const selectedTypeItem = objectTypeArray[index];
    if (selectedTypeItem) {
      this.setData({
        selectedTypeItem,
      });
    }
    this.getOrderList()
  },
  // 查询条件时间筛选
  handleTimePicker(e) {
    const index = e.detail.value;
    const {
      objectTimeArray
    } = this.data;
    const selectedTimeItem = objectTimeArray[index];
    if (selectedTimeItem) {
      this.setData({
        selectedTimeItem,
      });
    }
    this.getOrderList()
  },
  // 传递给子组件的方法
  inputChange: function (e) {
    var t = e.target
    console.log(e.detail.value)
    that.setData({
      searchText: e.detail.value
    })
  },
  // 子组件调用方法
  handleByCall(e) {
    if (this.data.source == 'oneClickOrdering') {
      const key = 'selfHelpInfo';
      const value = e.detail.info.currentTarget.dataset.items;
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
  // 跳转一键下单
  handleOneClickOrdering() {
    wx.navigateTo({
      url: '/pages/oneClickOrdering/oneClickOrdering',
    })
  },
  initialiServiceCollection: function (e) {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.serviceList.URL, {}, function (res) {
      let temp = {
        id: '',
        name: '全部'
      }
      let collItems = res.data.content
      collItems.unshift(temp)
      _this.setData({
        objectTypeArray: collItems
      })
    })
  },
  initialiSource(options) {
    const _this = this
    const fromPage = options.source;
    _this.setData({
      source: fromPage
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.getOrderList();
    that.initialiServiceCollection()
    that.initialiSource(options)
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
          scrollHihgt: res.windowHeight - getApp().data.tabBarHeight - 90
        });
      }
    });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2 //当前页面索引，取值 0、1、2、3...
      })
    }

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

  getOrderList: function () {
    const that = this
    var param = {};

    param[urlUtil.selfservicePlatformLis.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.selfservicePlatformLis.URL, param, function (res) {
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
    that.getOrderList();
  },

  refresh(e) {

    that.setData({
      triggered: false,
    })

    that.restResult();
    that.getOrderList();
  },


})