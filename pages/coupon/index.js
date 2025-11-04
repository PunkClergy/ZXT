const {
  u_getMyCoupon
} = require('../../utils/request/data_info')
const {
  byGet
} = require('../../utils/request/http')
Page({
  data: {
    currentTab: 1, // 当前选中的标签页（0:可领取, 1:已领取, 2:已过期）
    availableCount: 0, // 可领取优惠券数量
    // 可领取优惠券
    availableCoupons: [
    ],
    // 已领取优惠券
    receivedCoupons: [
    ],
    // 已过期优惠券
    expiredCoupons: [
    ],
    back: false
  },
  // 已领取的优惠券
  initCoupon() {
    byGet(getApp().data.k1swUrl + u_getMyCoupon.URL, {}).then(response => {
      const list = response.data.content
      this.setData({
        receivedCoupons: list
      })
    })
  },
  // 可领取优惠券
  initCanBeClaimed() {
    this.setData({
      availableCount: 0
    });
  },
  // 选择使用优惠券
  async handleChooseACoupon(e) {
    // 参数验证
    if (!e || !e.currentTarget) {
      console.error('无效的事件对象', e);
      return;
    }

    const couponItem = e.currentTarget.dataset?.item;

    // 优惠券数据验证
    if (!couponItem || typeof couponItem !== 'object') {
      console.warn('无效的优惠券数据', couponItem);
      wx.showToast({
        title: '优惠券数据无效',
        icon: 'none'
      });
      return;
    }

    try {
      // 异步存储优惠券数据
      await new Promise((resolve, reject) => {
        wx.setStorage({
          key: 'coupon',
          data: couponItem,
          success: resolve,
          fail: reject
        });
      });

      // 存储成功后返回上一页
      wx.navigateBack();

    } catch (error) {
      console.error('存储优惠券失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  },
  // 去使用优惠券
  handleUseCoupon(e) {
    const isused = e?.currentTarget?.dataset?.isused
    if (!isused) {
      wx.switchTab({
        url: '/pages/orderList/orderList',
      })
    }

  },
  onLoad(options) {
    if (options?.tab) {
      this.setData({
        currentTab: options?.tab,
        back: options?.back
      })
    }
  },
  onShow() {
    // 计算可领取优惠券数量
    this.initCoupon()
    // 可领取优惠券
    this.initCanBeClaimed()
  },
  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab !== tab) {
      this.setData({
        currentTab: tab
      });
    }
  },
  // 领取优惠券
  receiveCoupon(e) {
  }
})