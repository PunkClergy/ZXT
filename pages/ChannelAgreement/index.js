const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_channelAgreementList
} = require('../../utils/request/data_info')
const {
  byGet,
} = require('../../utils/request/http')
const {
  showToast
} = require('../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新状态
    g_title: '',//头部标题
  },

  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_page: 1,
      g_items: [],
    }, () => {
      this.initList();
    });
  },

  // 全屏背景图
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
  // 人员列表
  initList(evt) {
    byGet(`${getApp().data.k1swUrl}${u_channelAgreementList.URL}`, { type: evt }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content,
          g_total: Number(response.data.count || 0).toLocaleString(),
          g_title: evt == 1 ? 'MCCK渠道协议' : '无忧二号渠道协议'
        });
      }
    })
    return
  },
  hadleView(evt) {
    wx.downloadFile({
      url: encodeURI(`https://k3a.wiselink.net.cn/img/${evt?.currentTarget?.dataset?.item.filepath}`),
      success: (res) => {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          success: (res) => {
            console.log('打开PDF成功')
          },
          fail: (err) => {
            console.error('打开PDF失败', err)
            wx.showToast({
              title: '打开文件失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('下载失败', err)
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        })
      }
    })
  },
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: [],
    }, () => {
      this.initList();
    });
  },

  onLoad(options) {
    this.initList(options?.type)
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
})