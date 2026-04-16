const {
  u_getCarList,
  u_cancalShareCarToOta,
  u_shareCarToOta
} = require('../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')

Page({
  data: {
    carList: [],
    isOperating: false,
    clink: 'http://192.168.10.100:8689/',
    loading: false
  },

  onLoad() {
    this.getCarList()
  },

  // 获取车辆列表
  getCarList() {
    this.setData({
      loading: true
    })
    byGet(this.data.clink + u_getCarList.URL, {}).then(res => {
      if (res.statusCode === 200) {
        const carList = (res.data.content || []).map(car => {
          const otaStatus = (car.otaList || []).some(ele => ele.shared === 0) ? 0 : 1
          return {
            ...car,
            otaStatus,
            shareAllOta: otaStatus === 1
          }
        })
        this.setData({
          carList
        })
      }
    }).finally(() => {
      this.setData({
        loading: false
      })
    })
  },

  // OTA 统一请求
  otaRequest(url, params) {
    wx.showLoading({
      title: '操作中...'
    })
    byPost(url, params, res => {
      wx.hideLoading()
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
      this.getCarList()
      this.setData({
        isOperating: false
      })
    }, () => {
      wx.hideLoading()
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
      this.setData({
        isOperating: false
      })
    })
  },

  // 二次确认框（通用）
  showConfirm(title, content, confirmCallback) {
    wx.showModal({
      title: title || '提示',
      content: content || '确认执行此操作吗？',
      confirmText: '确认',
      cancelText: '取消',
      // 取消按钮样式改浅（解决暗色问题）
      cancelColor: '#999999',
      success: (res) => {
        if (res.confirm) confirmCallback()
      }
    })
  },

  // 全部 OTA
  handleAllOTA(e) {
    if (this.data.isOperating) return
    const {
      vehid,
      item,
      status
    } = e.currentTarget.dataset
    const text = status ? '确认取消全部共享？' : '确认开启全部共享？'

    this.showConfirm('操作确认', text, () => {
      this.setData({
        isOperating: true
      })
      const otaIds = item?.otaList?.map(ele => ele.id)?.filter(Boolean)?.join(',') || ''
      const url = status ? u_cancalShareCarToOta.URL : u_shareCarToOta.URL
      this.otaRequest(this.data.clink + url, {
        vehId: vehid,
        otaIds
      })
    })
  },

  // 单个 OTA
  handleSingleOTA(e) {
    if (this.data.isOperating) return
    const {
      carid,
      otaid,
      shared
    } = e.currentTarget.dataset
    const text = shared ? '确认取消该OTA共享？' : '确认开启该OTA共享？'

    this.showConfirm('操作确认', text, () => {
      this.setData({
        isOperating: true
      })
      const url = shared ? u_cancalShareCarToOta.URL : u_shareCarToOta.URL
      this.otaRequest(this.data.clink + url, {
        vehId: carid,
        otaIds: String(otaid)
      })
    })
  }
})