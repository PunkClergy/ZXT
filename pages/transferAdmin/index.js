const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_childUserList,
  u_transferAdminUser
} = require('../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 40, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //当前页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新是否开启
    g_total: 0, //列表总数
  },

  onLoad: function (options) {
    this.getCarList()
  },
  onReady: function () {

  },
  onShow() {
    this.initialiImageBaseConversion()
    this.setData({
      user: getApp()?.data?.userInfo?.username
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
    const param = {
      [u_childUserList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_childUserList.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        _this.setData({
          g_items: _this.data.g_items.concat(response.data.content),
          g_total: response.data.count
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    })


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
    const params = {
      [u_transferAdminUser.targetUserId]: evt?.currentTarget.dataset.item.id
    }
    wx.showModal({
      title: '提示',
      content: '确认移交管理员？',
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (res?.confirm) {
          byPost(
            `${getApp().data.k1swUrl}${u_transferAdminUser.URL}`, params,
            (response) => {
              if (response.data.code == 1000) {
                showToast(response.data.msg)
                wx.switchTab({
                  url: '/pages/desk/desk',
                })
              }
            },
            (error) => {
              hideLoading();
            }
          );
        }


      },
      fail(res) {
        console.log('调用showModal失败', res)
      }
    })
  },

})