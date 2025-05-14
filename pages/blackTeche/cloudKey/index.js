const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_vehicleApplyApiList,
  u_retrunCar
} = require('../../../utils/request/order')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_total: 0, //工单总数
    g_triggered: false, //下拉刷新状态
  },
  // 全图背景
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
  // 新增跳转
  handleOneClickOrdering() {
    wx.navigateTo({
      url: '/pages/blackTeche/cloudKeyApply/index',
    })
  },
  handleSelectJump(evt) {
    const item = evt.currentTarget.dataset.item
    const _this = this
    wx.showModal({
      title: '提示',
      content: `确认归还`,
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          byPost(getApp().data.k1swUrl + u_retrunCar.URL, {
            id: item.id
          }, function (res) {
            if (res.data.code == 1000) {
              _this.setData({
                g_page: 1, //列表页码
                g_comParam: '', //输入框内容
                g_items: [], //列表数据
              }, () => {
                _this.getOrderList()
              })
            }
          });
        }
      }
    });
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
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_vehicleApplyApiList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_vehicleApplyApiList.URL, param).then(response => {
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
  onLoad(options) {
    this.getOrderList()
  },


  onReady() {

  },


  onShow() {
    this.initialiImageBaseConversion()
  },

})