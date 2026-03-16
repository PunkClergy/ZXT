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
  u_rentRecord
} = require('../../../utils/request/self')
const {
  byGet
} = require('../../../utils/request/http')

Page({
  data: {
    // 页面布局相关
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0,
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44,
    s_background_picture_of_the_front_page: '',
    searchBarHeight: 80,

    // 记录列表相关
    y_items: [],       // 电子钥匙发送记录列表
    y_page: 1,         // 列表页码
    y_triggered: false,// 下拉刷新状态
    y_total: 0,        // 记录总数
    comParam: '',      // 搜索关键词
    c_fin3_link: 'https://fin3.wiselink.net.cn/fin/' // 照片链接前缀
  },

  // 搜索框失焦触发搜索
  bindblurSea(evt) {
    this.setData({
      comParam: evt.detail.value,
      y_triggered: false,
      y_page: 1,
      y_items: []
    }, () => {
      this.getKeySendingList()
    })
  },

  // 触底加载更多
  handleKeyLower() {
    this.setData({
      y_page: this.data.y_page + 1,
    }, () => {
      this.getKeySendingList()
    });
  },

  // 下拉刷新
  handleKeyRefresh() {
    this.setData({
      y_triggered: false,
      y_page: 1,
      y_items: []
    }, () => {
      this.getKeySendingList();
    });
  },

  // 获取电子钥匙发送记录列表
  getKeySendingList: async function () {
    showLoading("加载中...");
    try {
      const app = getApp();
      const url = app.data.k1swUrl + u_rentRecord.URL;
      const params = {
        [u_rentRecord.page]: this.data.y_page,
        status: 1,
        comParam: this.data.comParam || ''
      };
      const response = await byGet(url, params);
      const resp = response.data;

      // 无更多数据提示
      if (this.data.y_page > 1 && resp.content.length === 0) {
        showToast(`已加载全部数据：共${this.data.y_items.length}条`);
        return;
      }

      this.setData({
        y_total: resp.count || 0,
        y_items: [...this.data.y_items, ...resp.content],
      });
    } catch (error) {
      showToast("数据加载失败，请重试");
    } finally {
      hideLoading();
    }
  },

  // 查看照片
  handleViewPhotos(evt) {
    const info = evt?.currentTarget?.dataset?.item;
    if (!info) {
      showToast('无效数据');
      return;
    }
    // 过滤空照片链接
    const g_images = [info.img1, info.img2, info.img3, info.img4, info.img5]
      .filter(img => img != null && img !== '');
    if (g_images.length < 1) {
      showToast('无可查看照片');
      return;
    }
    // 拼接完整照片链接
    const images = g_images.map(ele => {
      return this.data.c_fin3_link + ele.replace(/\\/g, "/");
    });
    // 预览照片
    wx.previewImage({
      urls: images
    });
  },

  // 初始化背景图(base64转换)
  initialiImageBaseConversion() {
    const _this = this;
    wx.getFileSystemManager().readFile({
      filePath: '/assets/images/home/car-bg.png',
      encoding: 'base64',
      success: (res) => {
        _this.setData({
          s_background_picture_of_the_front_page: `data:image/png;base64,${res.data}`
        });
      }
    });
  },

  // 页面加载
  onLoad() {
    this.getKeySendingList()
  },

  // 页面显示
  onShow() {
    this.initialiImageBaseConversion()
  }
})