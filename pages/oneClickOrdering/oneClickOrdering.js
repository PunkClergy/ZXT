// pages/oneClickOrdering/oneClickOrdering.js
const appUtil = require('../../utils/app-util');
const urlUtil = require('../../utils/url-util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collItems: [],
    sendSingleOptions: [{
      id: 1,
      name: '内部车务'
    }, {
      id: 2,
      name: '车务宝服务'
    }],
    checkedService: 2,
    checkeSendSing: 1,
    tabs: [],
    activeTab: 0,
    carTitle: '车辆信息',
    carInfo: {},
    staffInfo: {},
    dispatchInfo: {},
    serviceList: [],
    serviceInfo: {},
    selfHelpInfo: {},
    serviceHeight: 50
  },
  /**
   * 服务信息勾选
   */
  handleCheckboxChange(e) {
    const collItems = this.data.collItems
    const values = e.detail.value
    for (let i = 0, lenI = collItems.length; i < lenI; ++i) {
      collItems[i].checked = false
      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (collItems[i].id == values[j]) {
          collItems[i].checked = true
          break
        }
      }
    }
    const tabs = collItems
      .filter(ele => ele.checked)
      .map(ele => ({
        name: ele.name,
        id: ele.id,
      }));
    if (Object.keys(this.data.serviceInfo).length === 0 && this.data.serviceInfo.constructor === Object) {
      this.handleSwitchTab(tabs[0].id)
    }
    this.setData({
      collItems,
      tabs
    })
  },
  /**
   * 切换订单Tabs
   */
  handleSwitchTab(e) {
    const id = e?.currentTarget?.dataset?.item?.id || e
    const index = e?.currentTarget?.dataset?.index || 0
    const list = this.data.serviceList;
    const service = list.find(ele => Object.keys(ele)[0] == id);
    const displayCount = (service?.[id] || []).filter(ele => ele.display == 1).length;
    const serviceHeight = displayCount * 60;
    this.setData({
      activeTab: index,
      serviceInfo: service?.[id] || [],
      serviceHeight: serviceHeight || 50
    });
  },
  /**
   * 提交
   */
  handleOnSubmit() {
    const {
      tabs,
      checkeSendSing
    } = this.data;
    const allFormData = tabs.map(tab => {
      const child = this.selectComponent(`#child${tab.id}`);
      const formData = child.getFormData();
      return {
        tabId: tab.id,
        formData
      };
    }).filter(Boolean);

    const allCaches = {};
    try {
      const storageInfo = wx.getStorageInfoSync();
      storageInfo.keys.forEach(key => {
        try {
          allCaches[key] = wx.getStorageSync(key);
        } catch (e) {}
      });
    } catch (e) {}
    const serviceList = allFormData.map(ele => ({
      type: ele.tabId,
      ...ele.formData
    }));
    const submitData = {
      cost: 0,
      dispatchtype: checkeSendSing,
      linkperson: allCaches.staffInfo?.name || '',
      linkmobile: allCaches.staffInfo?.mobile || '',
      platenumber: allCaches.vehicleInfo?.platenumber || '',
      vehid: allCaches.vehicleInfo?.id || '',
      // 此处还需自助取还信息
      serviceList
    };
    appUtil.byPostJson(getApp().data.k1swUrl + urlUtil.orderSubmit.URL, submitData, function (res) {
      appUtil.hideLoading();
      if (res) {
        if (res.data.code == 1000) {
          const cache = ['vehicleInfo', 'staffInfo', 'dispatchInfo', 'selfHelpInfo']
          cache.forEach(ele => {
            wx.removeStorage({
              key: ele,
            });
          })
          wx.redirectTo({
            url: '/pages/workOrderList/workOrderList',
          });
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
    console.log('最终提交数据:', submitData);
  },
  /**
   * 切换派单方式
   */
  handleRadioSendSing: function (e) {
    const {
      value: id
    } = e.detail;
    this.setData({
      checkeSendSing: id
    })
  },
  /**
   * 跳转车辆列表选择车辆-车辆管理
   */
  handleCarList() {
    const _this = this
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=oneClickOrdering',
      success: function (res) {
        wx.removeStorage({
          key: 'selfHelpInfo',
        });
        _this.setData({
          selfHelpInfo: {}
        })
      },
    })

  },
  /**
   * 跳转人员列表选择人员-通讯信息
   */
  handleStaffInfo() {
    wx.navigateTo({
      url: '/pages/system/carManager/carManager?source=oneClickOrdering&type=1'
    })
  },
  /**
   * 跳转人员列表选择人员-派单信息
   */
  handleDispatchInfo() {
    wx.navigateTo({
      url: '/pages/system/carManager/carManager?source=oneClickOrdering&type=2'
    })
  },
  /**
   * 获取全部换成内容
   */
  initialiReadAllCaches: function () {
    const _this = this
    try {
      const storageInfo = wx.getStorageInfoSync();
      const keys = storageInfo.keys;
      const allCaches = {};
      keys.forEach((key) => {
        try {
          const value = wx.getStorageSync(key);
          allCaches[key] = value;
        } catch (e) {}
      });
      // 操作
      _this.initializeCarInfo(allCaches?.vehicleInfo)
      _this.initializeStaffInfo(allCaches?.staffInfo)
      _this.initializeDispatchInfo(allCaches?.dispatchInfo)
      _this.initializeSelfHelpInfo(allCaches?.selfHelpInfo)
    } catch (e) {}
  },
  initializeSelfHelpInfo(ele) {
    this.setData({
      selfHelpInfo: ele
    });
  },
  /**
   * 获取车辆初始化信息
   */
  initializeCarInfo(ele) {
    this.setData({
      carTitle: ele?.platenumber,
      carInfo: ele || {}
    });
  },

  /**
   * 获取员工初始化信息
   */
  initializeStaffInfo(ele) {
    this.setData({
      staffInfo: ele || {}
    });
  },
  /**
   * 获取员工信息-内务人员
   */
  initializeDispatchInfo(ele) {
    this.setData({
      dispatchInfo: ele || {}
    });
  },
  /**
   * 获取服务信息多选字段
   */
  initialiServiceCollection: function (e) {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.serviceList.URL, {}, function (res) {
      _this.setData({
        collItems: res?.data.content
      })
    })
  },
  /**
   *  获取服务信息详情字段
   */
  initialiServiceFiled() {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.getServiceFiled.URL, {}, function (res) {
      console.log(res)
      _this.setData({
        serviceList: res?.data.content
      })
    })
  },
  handleSelfHelp(e) {
    wx.navigateTo({
      url: "/pages/selfServicePickUpAndReturn/selfServicePickUpAndReturn?source=oneClickOrdering",
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initialiServiceCollection()
    this.initialiServiceFiled()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(e) {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    this.initialiReadAllCaches();
    const activeTabData = this.data.tabs[this.data.activeTab];
    if (!activeTabData || !activeTabData.id) {
      return;
    }
    const selector = `#child${activeTabData.id}`;
    const childComponent = this.selectComponent(selector);
    if (!childComponent) {
      return;
    }
    childComponent.refresh();

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})