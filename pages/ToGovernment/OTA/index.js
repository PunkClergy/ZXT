const {
  byPost,
  byGet
} = require('../../../utils//request/http')
const {
  u_OTAApiList,
  u_shareToOta,
  u_cancalShareToOta,
} = require('../../../utils/request/data_info')
// OTA 列表页 JS
Page({
  data: {
    // 加载状态
    loading: true,
    // OTA 公司列表
    otaList: [],

    isOperating: false, // 防重复点击
    clink: 'http://192.168.10.100:8689/'
  },

  onLoad() {
    // 页面加载时获取OTA列表
    // this.getOtaList();
    this.initGetOtaList()
  },
  initGetOtaList() {
    byGet(this.data.clink + u_OTAApiList.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          otaList: response.data.content,
          loading: false
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },

  // 切换单个OTA共享状态
  handleToggleShare(e) {
    const {
      id,
      shared
    } = e.currentTarget.dataset;
    if (this.isOperating) return;

    wx.showModal({
      content: shared ? '确定取消共享？' : '确定开启共享？',
      success: res => {
        if (!res.confirm) return;
        this.isOperating = true;
        wx.showLoading({
          title: '操作中...',
          mask: true
        });

        const url = shared ? `${this.data.clink}${u_cancalShareToOta.URL}` : `${this.data.clink}${u_shareToOta.URL}`;
        byPost(url, {
          otaId: id
        }, res => {
          wx.hideLoading();
          wx.showToast({
            title: res?.data?.msg,
            icon: 'none'
          });
          this.initGetOtaList();
          this.isOperating = false;
        }, () => {
          wx.hideLoading();
          wx.showToast({
            title: '提交失败',
            icon: 'none'
          });
          this.isOperating = false;
        });
      }
    });
  }
});