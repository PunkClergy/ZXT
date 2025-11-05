const { u_getMyCoupon } = require('../../utils/request/data_info')
const { byGet } = require('../../utils/request/http')

Page({
  data: {
    currentTab: 1, // 当前选中的标签页（0:可领取, 1:已领取, 2:已过期）
    availableCount: 0, // 可领取优惠券数量
    availableCoupons: [], // 可领取优惠券
    receivedCoupons: [], // 已领取优惠券
    expiredCoupons: [], // 已过期优惠券
    back: false
  },

  /**
   * 初始化优惠券数据（通用方法）
   * @param {number} status 优惠券状态：-1-可领取, 1-已领取, 0-已过期
   * @param {string} targetKey 要更新的数据键名
   */
  async initCoupons(status, targetKey) {
    try {
      const url = `${getApp().data.k1swUrl}${u_getMyCoupon.URL}`
      const response = await byGet(url, status !== null ? { status } : {})
      
      if (response?.data?.content) {
        this.setData({
          [targetKey]: response.data.content
        })
        
        // 如果是可领取优惠券，同步更新数量
        if (targetKey === 'availableCoupons') {
          this.setData({
            availableCount: response.data.content.length
          })
        }
      }
    } catch (error) {
      console.error(`获取${this.getStatusText(status)}优惠券失败:`, error)
      wx.showToast({
        title: `加载优惠券失败`,
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 获取状态文本（辅助方法）
   */
  getStatusText(status) {
    const statusMap = {
      '-1': '可领取',
      '1': '已领取',
      '0': '已过期'
    }
    return statusMap[status] || '未知状态'
  },

  /**
   * 领取优惠券
   */
  async receiveCoupon(e) {
    // 补充领取优惠券逻辑
    const couponId = e?.currentTarget?.dataset?.id
    if (!couponId) {
      wx.showToast({
        title: '优惠券信息错误',
        icon: 'none'
      })
      return
    }

    try {
      // 这里补充实际领取接口调用逻辑
      // await byPost(领取接口URL, { couponId })
      wx.showToast({
        title: '领取成功',
        icon: 'success'
      })
      
      // 重新加载数据
      this.initAvailableCoupons()
      this.initReceivedCoupons()
    } catch (error) {
      console.error('领取优惠券失败:', error)
      wx.showToast({
        title: '领取失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 选择使用优惠券
   */
  async handleChooseCoupon(e) {
    // 参数验证
    if (!e?.currentTarget) {
      console.error('无效的事件对象', e)
      return
    }

    const couponItem = e.currentTarget.dataset?.item

    // 优惠券数据验证
    if (!couponItem || typeof couponItem !== 'object') {
      console.warn('无效的优惠券数据', couponItem)
      wx.showToast({
        title: '优惠券数据无效',
        icon: 'none'
      })
      return
    }

    try {
      // 异步存储优惠券数据
      await wx.setStorageSync('coupon', couponItem)
      // 存储成功后返回上一页
      wx.navigateBack()
    } catch (error) {
      console.error('存储优惠券失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 去使用优惠券
   */
  handleUseCoupon(e) {
    const isUsed = e?.currentTarget?.dataset?.isused
    if (!isUsed) {
      wx.switchTab({
        url: '/pages/orderList/orderList'
      })
    }
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (this.data.currentTab !== tab) {
      this.setData({ currentTab: tab })
    }
  },

  /**
   * 初始化可领取优惠券
   */
  initAvailableCoupons() {
    this.initCoupons(-1, 'availableCoupons')
  },

  /**
   * 初始化已领取优惠券
   */
  initReceivedCoupons() {
    this.initCoupons(1, 'receivedCoupons')
  },

  /**
   * 初始化已过期优惠券
   */
  initExpiredCoupons() {
    this.initCoupons(0, 'expiredCoupons')
  },

  onLoad(options) {
    if (options?.tab) {
      this.setData({
        currentTab: parseInt(options.tab, 10), // 确保是数字类型
        back: !!options.back
      })
    }
  },

  onShow() {
    // 按需加载数据，优化性能
    this.initReceivedCoupons()
    this.initExpiredCoupons()
    this.initAvailableCoupons()
  }
})