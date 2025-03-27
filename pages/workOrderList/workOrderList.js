const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  byGet
} = require('../../utils/request/http')
const {
  u_orderList,
  u_serviceList,
  u_getServiceFiled
} = require('../../utils/request/order')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  filterWorkStatus,
  filterWorkTime,
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
        filter_work: filterWorkStatus
      },
      {
        id: 2,
        name: '所有类型',
        btnRender: false,
        params: 'g_orderTypes',
        filter_work: []
      },
      {
        id: 3,
        name: '所有时间',
        btnRender: false,
        params: 'g_days',
        filter_work: filterWorkTime
      },
    ], //筛选的下拉数据
  },
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
  initialiServiceCollection() {
    const url = getApp().data.k1swUrl + u_serviceList.URL;
    byGet(url, {}).then(res => {
      const allOption = {
        id: '',
        name: '全部'
      };
      const collItems = [allOption].concat(res.data.content.map(evt => ({
        value: evt.id,
        name: evt.name
      })));
      const updatedFilterAggregate = this.data.filter_aggregate.map(element => {
        if (element.params === 'g_orderTypes') {
          element.filter_work = collItems;
        }
        return element;
      });
      this.setData({
        filter_aggregate: updatedFilterAggregate
      }, () => {
        hideLoading();
      });
    })
  },
  onLoad: function (options) {
    this.getOrderList()
    this.initialiServiceCollection()
    this.initialiServiceFiled()
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },
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
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_orderList.days]: this.data.g_days,
      [u_orderList.orderTypes]: this.data.g_orderTypes,
      [u_orderList.status]: this.data.g_status,
      [u_orderList.comParam]: this.data.g_comParam,
      [u_orderList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_orderList.URL, param).then(response => {
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
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
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
  handleJumpBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
  handleOneClickOrdering() {
    wx.switchTab({
      url: '/pages/oneClickOrdering/oneClickOrdering',
    })
  },
  initialiServiceFiled() {
    const url = getApp().data.k1swUrl + u_getServiceFiled.URL;
    byGet(url, {}).then(response =>
      response.data.content.map(element => {
        const [ordertype] = Object.keys(element);
        const info = (element[ordertype] || []).filter(evt => evt.display === 1).map(({
          cnname,
          name,
          type
        }) => ({
          name: cnname,
          value: name,
          type
        }));
        return {
          ordertype,
          info
        };
      }).reduce((acc, {
        ordertype,
        info
      }) => ({
        ...acc,
        [ordertype]: info
      }), {})
    ).then(g_filed => this.setData({
      g_filed
    }))
  },
  handleShowMask() {
    this.setData({
      is_mask_visible: true
    });
  },
  handleOnMaskClose() {
    this.setData({
      isMaskVisible: false
    });
  },
  handleMaskSubmit(e) {
    console.log(e)
    this.setData({
      isMaskVisible: false
    });
  },
  filterStatusColor(evt) {
    const colorMap = {
      '1': 'F56F48',
      '2': '4587FD',
      '3': 'FBA851',
      '4': '20C609',
      '5': '797979'
    };
    return colorMap[evt] || '';
  },
  filterStatusText(evt) {
    const textMap = {
      '1': '待接单',
      '2': '进行中',
      '3': '待验收',
      '4': '已完结',
      '5': '已取消'
    };
    return textMap[evt] || '';
  }
})