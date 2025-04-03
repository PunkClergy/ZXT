const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  byGet
} = require('../../utils/request/http')
const {
  u_buyRecord,
  u_serviceList,
  u_getServiceFiled
} = require('../../utils/request/data_info')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  orderListStatus,
  orderStatus
} = require('../../utils/Inspect/filterColl').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    c_status: orderStatus, //订单状态
    is_mask_visible: false, //蒙版状态
    g_page: 1, //列表页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_total: 0, //工单总数
    g_triggered: false, //下拉刷新状态
    g_days: '', //天数
    g_status: '', //状态
    g_orderTypes: '', //类型
    g_filed: {}, //自定义字段集合
    filter_aggregate: [{
      id: 1,
      name: '所有状态',
      btnRender: false,
      params: 'g_status',
      filter_work: orderListStatus
    }, ], //筛选的下拉数据
    startDate: '2025-03-20', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
    endDate: '2025-03-20', //历史轨迹查询时间
    endTime: '19:00', //历史轨迹查询时间
  },
  // 下拉筛选执行
  bindPickerChange(e) {
    const filterAggregate = this.data.filter_aggregate;
    const {
      id: targetId
    } = e.currentTarget.dataset;
    const {
      key: selectedKey
    } = e.detail;
    const targetIndex = filterAggregate.findIndex(item => item.id === targetId);
    if (targetIndex === -1) {
      return;
    }
    const targetItem = {
      ...filterAggregate[targetIndex]
    };
    const statusOptions = targetItem.filter_work || [];
    if (selectedKey >= statusOptions.length) {
      return;
    }
    const selectedStatus = statusOptions[selectedKey] || {};
    const dynamicParams = {
      [selectedStatus.params || targetItem.params]: selectedStatus.value ?? targetItem.value ?? ''
    };
    const updatedAggregate = filterAggregate.map((item, index) =>
      index === targetIndex ? {
        ...item,
        name: selectedStatus.name || item.name
      } : item
    );
    this.setData({
      filter_aggregate: updatedAggregate,
      g_items: [],
      ...dynamicParams
    }, () => {
      this.getOrderList();
    });
  },
  // 查看详情
  handleView() {
    const item = evt.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/orderList/orderDetails/orderDetails?flag=' + 'see&item=' + JSON.stringify(item),
    })
  },
  // 搜索框执行操作
  handleBlur(e) {
    const resp = e.detail.value
    if (resp == this.data.g_comParam) {
      return
    }
    this.setData({
      g_comParam: e.detail.value,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    })
  },

  // 跳转下单页面
  handleOneClickOrdering() {
    wx.switchTab({
      url: '/pages/oneClickOrdering/oneClickOrdering',
    })
  },

  // 全屏背景
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );

    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_buyRecord.days]: this.data.g_days,
      [u_buyRecord.orderTypes]: this.data.g_orderTypes,
      [u_buyRecord.status]: this.data.g_status,
      [u_buyRecord.comParam]: this.data.g_comParam,
      [u_buyRecord.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_buyRecord.URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  // 触底懒加载
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
  onLoad: function (options) {
    this.getOrderList()
    this.initialiServiceCollection()
  },
  onShow: function () {

  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },


})