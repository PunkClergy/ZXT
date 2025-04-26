const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_carManagerapi_list,
  u_carManagerapi_del
} = require('../../../utils/request/car')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_source: 0, //上级跳转页面
    g_page: 1, //当前页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新是否开启
    g_total: 0, //列表总数
  },

  onLoad: function (options) {
    this.initCarryParams(options)
    this.getCarList()
  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },
  initCarryParams(evt) {
    const {
      source
    } = evt
    this.setData({
      g_source: source
    })
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
  getCarList() {
    const _this = this
    showLoading("加载中...");
    const param = {
      [u_carManagerapi_list.page]: this.data.g_page,
      [u_carManagerapi_list.comParam]: this.data.g_comParam
    };

    byPost(getApp().data.k1swUrl + u_carManagerapi_list.URL, param, function (response) {
      _this.setData({
        g_items: _this.data.g_items.concat(response.data.content),
        g_total: response.data.count
      }, () => {
        hideLoading();
      });

    });


  },
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getCarList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getCarList();
    });
  },
  handleSelectJump(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    wx.redirectTo({
      url: `${this.data.g_source}?datails=${JSON.stringify(item)}`
    })
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
      this.getCarList();
    })
  },
  handleJumpBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
  handleJumpInfo() {
    wx.navigateTo({
      url: '/pages/carManager/corpelAdd/index',
    })
  },
  handleView(evt) {
    const item = evt.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/carManager/carListAdd/index?flag=' + 'see&item=' + JSON.stringify(item),
    })
  },
  handleEdit(evt) {
    const item = evt.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/carManager/corpelAdd/index?flag=' + 'edit&item=' + JSON.stringify(item),
    })
  },
// 删除
handleDelete(evt) {
  const item = evt.currentTarget.dataset.item
  const index = evt.currentTarget.dataset.index
  const g_items = this.data.g_items
  const param = {
    [u_carManagerapi_del.id]: item?.id,
  };
  byGet(getApp().data.k1swUrl + u_carManagerapi_del.URL, param).then(response => {
    hideLoading()
    if (response.statusCode == 200) {
      this.setData({
        g_items: g_items.filter((_, i) => i != index)
      }, () => {
        showToast(response?.data?.msg);
      })
    } else {
      showToast('请求失败，请稍后再试');
    }
  })
},
})