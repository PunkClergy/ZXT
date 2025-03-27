// pages/workOrderDetails/workOrderDetails.js
const urlUtil = require('../../utils/url-util.js');
const appUtil = require('../../utils/app-util')
const utils = require('./uitls.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex_1: 0, // 当前选中的标签索引
    currentIndex: 1,
    detailDataCollection: {},
    serviceList: [],
    collItems: [],

    workTabs: [],
    activeTab: 0,
    timelineEvents: [],
    ticketAfterServiceImg: [],
    ticketBeforServiceImg: [],
    serviceInfo: [],
    taskTabs: [],
    orderListType: 3,
    vehicleListType: 2,
  },
  // 切换头部Tabs
  handleClickToSwitchTags(e) {
    const _this = this
    const index = e.target.dataset.index
    _this.setData({
      currentIndex: index
    })
  },
  // 过滤车况出字段值
  filterConvertToObjectArray(data) {
    const result = [];
    for (let i = 1; i <= 6; i++) {
      const nameKey = `name${i}`;
      const imgKey = `img${i}`;
      if (data[nameKey] !== null) { // 忽略 name 为 null 的项
        result.push({
          name: data[nameKey],
          image: data[imgKey]
        });
      }
    }
    return result;
  },
  // 请求工单详情
  initialiWorkOrderDetails: function (e) {
    const _this = this
    const param = {
      [urlUtil.orderDetail.orderId]: e
    };
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.orderDetail.URL, param, function (res) {
      const details = res.data.content
      const ticketAfterServiceImg = _this.filterConvertToObjectArray(details.ticketAfterServiceImg)
      const ticketBeforServiceImg = _this.filterConvertToObjectArray(details.ticketBeforServiceImg)
      const taskTabs = details.serviceList.map(service => ({
        name: service.typename,
        content: service.ticketServiceStandardList
      }));
      _this.setData({
        detailDataCollection: details,
        ticketAfterServiceImg: ticketAfterServiceImg,
        ticketBeforServiceImg: ticketBeforServiceImg,
        taskTabs: taskTabs
      })
      _this.initialiMergeData()
    })
  },
  // 请求服务列表字段
  initialiServiceCollection: function (e) {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.serviceList.URL, {}, function (res) {
      _this.setData({
        collItems: res?.data.content
      })
      _this.initialiMergeData()
    })
  },
  // 请求服务列表
  initialiServiceList() {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.getServiceFiled.URL, {}, function (res) {
      _this.setData({
        serviceList: res?.data.content
      })
      _this.initialiMergeData()
    })
  },
  // 服务信息默认初始值
  initialiMergeData() {
    const {
      detailDataCollection: {
        serviceList = []
      } = {},
      collItems = [],
      serviceList: list = []
    } = this.data;
    if (!serviceList.length || !collItems.length) return;
    let mergeData = collItems.map(ele => {
      const matchedItem = serviceList.find(eve => ele.id == eve.type);
      if (matchedItem) {
        ele.checked = true;
      }
      return ele;
    });
    const temp = serviceList.filter(eve => mergeData.some(item => item.id === eve.type));
    const value = temp[0].type
    const service = list.find(ele => Object.keys(ele)[0] == value)?.[value];
    const displayCount = (service || []).filter(ele => ele.display == 1).length;
    const serviceHeight = displayCount * 35;

    const contentDisplay = service.map(serviceItem => {
      let result = {};
      serviceList.forEach(listItem => {
        result = {
          name: serviceItem.cnname,
          value: listItem[serviceItem.name],
          display: serviceItem.display
        };
      });
      return result;
    });

    this.setData({
      workTabs: temp,
      serviceInfo: contentDisplay || [],
      collItems: mergeData,
      serviceHeight: serviceHeight || 50
    })
  },
  //  切换订单Tabs的服务信息  
  handleOrderSwitchTab(e) {
    const {
      detailDataCollection: {
        serviceList = []
      } = {},
      serviceList: list = []
    } = this.data;
    const index = e.currentTarget.dataset.index
    const value = e.currentTarget.dataset.item.type
    const service = list.find(ele => Object.keys(ele)[0] == value)?.[value];
    const displayCount = (service || []).filter(ele => ele.display == 1).length;
    const serviceHeight = displayCount * 35;
    const contentDisplay = service.map(serviceItem => {
      let result = {};
      serviceList.forEach(listItem => {
        result = {
          name: serviceItem.cnname,
          value: listItem[serviceItem.name],
          display: serviceItem.display
        };
      });
      return result;
    });
    this.setData({
      activeTab: index,
      serviceInfo: contentDisplay,
      serviceHeight: serviceHeight || 50
    });
  },
  // 切换任务Tabs的服务信息
  handleTaskSwitchTab(e) {
    const {
      index
    } = e.currentTarget.dataset;
    this.setData({
      currentIndex_1: index
    });

  },
  // 初始化数据
  handleSetData() {
    const keys = [
      'orderDataCollection',
      'orderHeadDataSet',
      'orderStateCollection',
      'vehicleDataCollection',
      'vehicleDataCollectionAdditional',
      'vehicleHeadDataSet',
      'sendSingleOptions'
    ];
    const dataToUpdate = keys.reduce((acc, key) => ({
      ...acc,
      [key]: utils[key]
    }), {});
    this.setData(dataToUpdate);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.handleSetData()
    this.initialiWorkOrderDetails(options?.id)
    this.initialiServiceList()
    this.initialiServiceCollection()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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