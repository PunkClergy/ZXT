const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
Page({
  data: {
    // 列表数据
    items: [],
    // 分页参数
    page: 1,
    pageSize: 10,
    hasMore: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载
  },

  // 页面加载时请求数据
  onLoad() {
    this.fetchData();
  },

  // 请求接口数据的方法
  fetchData() {
    const _this = this
    if (this.data.isLoading || !this.data.hasMore) return;



    const {
      page,
      pageSize
    } = this.data;

    // 发起GET请求
    appUtil.byGet(getApp().data.k1swUrl + 'deviceBuyApi/buyRecord', {
      page,
      pageSize
    }, function (res) {
      console.log(res)
      const newData = res.data.content || []; // 假设接口返回的数据结构为 { list: [] }
      const updatedItems = [..._this.data.items, ...newData];
      const hasMore = newData.length === pageSize;

      _this.setData({
        items: updatedItems,
        page: _this.data.page + 1,
        hasMore,
      });
    })

  },

  // 滑动到底部触发加载更多
  loadMore() {
    this.fetchData();
  },

  // 点击列表项事件
  onItemTap(e) {
    const itemId = e.currentTarget.dataset.id; // 获取点击项的ID
    wx.showToast({
      title: `点击了ID为${itemId}的记录`,
      icon: "none",
    });
  },

  // 新增按钮点击事件
  onAddClick() {
    wx.navigateTo({
      url: '/pages/slfSrvc/slfSrvcAdd/add', // 跳转到新增页面
    });
  },
});