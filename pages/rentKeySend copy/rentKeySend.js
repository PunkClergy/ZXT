// pages/order/orderList.js
const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');

var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPopup: false,
    showInput: true, // 可选输入框
    formItems: [{
        label: '车牌号',
        placeholder: '请输入车牌号',
        value: '',
        name: 'platenumber'
      },
      {
        label: '设备号',
        placeholder: '请输入设备号',
        value: '',
        name: 'sn'
      },
      {
        label: '姓名',
        placeholder: '请输入姓名',
        value: '',
        name: 'name'
      },
      {
        label: '手机号',
        placeholder: '请输入手机号',
        value: '',
        name: 'phone'
      },
      {
        label: '开始日期',
        placeholder: '请输入开始日期',
        value: '',
        name: 'startDate'
      },
      {
        label: '',
        placeholder: '开始时间',
        value: '',
        name: 'startTime'
      },
      {
        label: '结束时间',
        placeholder: '请输人结束时间',
        value: '',
        name: 'endDate'
      },
      {
        label: '',
        placeholder: '输入时间',
        value: '',
        name: 'endTime'
      }
    ],
    items: [], // 数据列表

    page: 1,
    triggered: false,
    searchText: '',
    winWidth: '',
    winHeight: '',
    scrollHihgt: '',
    isShowAddType: true,
    source: null
  },

  // 输入框变化事件
  handleInputChange(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const value = e.detail.value;
    const formItems = this.data.formItems;
    formItems[index].value = value;
    this.setData({
      formItems
    });
  },
  // 显示弹窗
  showPopup(e) {
    const items = e.currentTarget.dataset.item
    const formItems = this.data.formItems;
    formItems[0].value = items.platenumber;
    formItems[1].value = items.sn || '';
    this.setData({
      showPopup: true,
      formItems
    })
  },
  // 确认按钮事件
  handleConfirm() {
    const {
      formItems
    } = this.data;
    console.log('提交数据：', formItems);
    // 根据需求处理提交逻辑
    this.hidePopup();
  },

  // 取消按钮事件
  hidePopup() {
    this.setData({
      showPopup: false
    });
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

  bindTimeChange:function(e) {
    console.log(e)
    const {
      index
    } = e.currentTarget.dataset;
    console.log(index)
    const value = e.detail.value;
    const formItems = this.data.formItems;
    formItems[index].value = value;
    this.setData({
      formItems
    });
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
      source: fromPage
    })
  },
  handleSelectVehicle(e) {
    if (this.data.source == 'oneClickOrdering') {
      const key = 'vehicleInfo';
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
  regCarBtnTap: function () {
    //appUtil.navigateTo('../regDevice/regDevice');

    wx.showActionSheet({
      itemList: ['单个新增', '批量新增'],
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          appUtil.navigateTo('../regCar/regCar');
        } else {
          appUtil.navigateTo('../batchRegCar/batchRegCar');
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  editTap: function (e) {
    var index = e.currentTarget.id;
    var items = that.data.items
    var item = items[index];
    // var param = "?sn="+item.sn+"&code="+item.code+"&vehicleSerialCode="+item.vehicleSerialCode+"&faultType="+item.faultType+"&vehicleModeCode="+item.vehicleModeCode+"&carModelCode="+item.carModelCode+"&platenumber="+item.platenumber+"&vin="+item.vin+"&id="+item.id;
    // appUtil.navigateTo('../regDevice/regDevice'+param);

    var param = "?sn=" + item.sn + "&vehicleSerialName=" + item.vehicleSerialName + "&vehicleModeName=" + item.vehicleModeName + "&vin=" + item.vin + "&platenumber=" + item.platenumber + "&xsgw=" + item.xsgw + "&id=" + item.id;
    appUtil.navigateTo('../regCar/regCar' + param);
  },

  delTap: function (e) {
    appUtil.showModal("确定删除车辆吗？", true, function (res) {
      if (res) {
        var param = {};
        var id = e.currentTarget.id;
        param[urlUtil.delVehicle.vehicleId] = id;
        appUtil.showLoading("处理中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.delVehicle.URL, param, function (res) {
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