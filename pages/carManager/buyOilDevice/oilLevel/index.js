const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../utils/public').default
const {
  filterWorkStatus,
  filterWorkTime,
  orderStatus
} = require('../../../../utils/Inspect/filterColl').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../../utils/Inspect/tips')
const {
  u_buyRecord
} = require('../../../../utils/request/eqpmnt')
const {
  byGet
} = require('../../../../utils/request/http')
Page({
  data: {
    s_background_picture_of_the_front_page: '', //全图背景
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    c_status: orderStatus, //订单状态
    g_page: 1, //列表页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_total: 0, //工单总数
    g_triggered: false, //下拉刷新状态
    g_days: '', //天数
    g_status: '', //状态
    g_num: '', //订单号
    filter_aggregate: [{
        id: 1,
        name: '所有状态',
        btnRender: false,
        params: 'g_status',
        filter_work: filterWorkStatus
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
      [u_buyRecord.days]: this.data.g_days,
      [u_buyRecord.num]: this.data.g_num,
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
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  onLoad(options) {
    this.getOrderList()
  },
  onReady() {
    this.initialiImageBaseConversion()
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