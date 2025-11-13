const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  byGet,
  byPost
} = require('../../utils/request/http')
const {
  u_customerList,
  u_delCustomer
} = require('../../utils/request/dispatch')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_total: 0, //工单总数
    g_page: 1, //列表页码
    g_comParam: '', //搜索内容
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
  handleEdit(evt) {
    console.log(evt)
    const {
      item
    } = evt.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/CustomerReporting/scanCodeAdd/index?source=' + JSON.stringify(item),
    })
  },
  handleDelete(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    byPost(`${getApp().data.k1swUrl}${u_delCustomer.URL}`, {
      id: item?.id
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      showToast(response?.data?.msg);
      this.handleRefresh()
    }, (error) => {
      hideLoading();
      showToast('删除失败，请稍后重试');
    });
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_customerList.customerName]: this.data.g_comParam,
      [u_customerList.page]: this.data.g_page,
      type: this.data.type
    };
    byGet(getApp().data.k1swUrl + u_customerList.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
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
  // 跳转下单页面
  handleOneClickOrdering() {
    wx.navigateTo({
      url: '/pages/CustomerReporting/scanCodeAdd/index',
    })
  },

  onLoad(options) {
    this.setData({
      g_comParam: '',
      g_page: 1,
      g_items: [],
      type: options?.type
    }, () => {
      this.getOrderList();
    })
  },
  onReady() { },
  onShow() {
    this.initialiImageBaseConversion()

  },

})