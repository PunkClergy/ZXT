// 仅保留用到的依赖，byGet 完整保留
const {
  byGet
} = require('../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_myCustomerPdList
} = require('../../../utils/request/dispatch')

Page({
  data: {
    // 搜索条件
    searchDate: '',
    typeIndex: 0,
    typeList: ['全部', '停运批单', '失联批单'],
    keyword: '',

    // 列表数据
    list: [],
    g_page: 1,
    g_total: 0,
    noMore: false,

    // PDF预览
    showPdfModal: false,
    currentPdfPath: ''
  },

  // ========== 请求方式 100% 原封不动保留 ==========
  getOrderList(targetMonth, selectType = '', key) {
    showLoading("加载中...");
    const param = {
      comParam: key || '',
      page: this.data.g_page,
      typeName: selectType == '全部' ? '' : selectType,
      month: targetMonth || ''
    }
    // 完全保留你原来的写法
    byGet(getApp().data.k1swUrl + u_myCustomerPdList.URL, param).then(response => {
      hideLoading()
      wx.stopPullDownRefresh()

      if (response.statusCode == 200) {
        const total = Number(response.data.count || 0)
        const list = response.data?.content.map(ele => {
          let temp = {
            ...ele,
            filepath: encodeURI(ele?.filepath)
          }
          return temp
        })

        this.setData({
          list,
          g_total: total.toLocaleString()
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    }).catch(() => {
      hideLoading()
      wx.stopPullDownRefresh()
      showToast('网络异常，请重试')
    })
  },

  onShow() {
    this.getOrderList()
  },

  // 选择月份
  onDateChange(e) {
    this.setData({ searchDate: e.detail.value });
  },

  // 选择类型
  onTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  // 输入关键词
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 搜索按钮
  onSearch() {
    const { searchDate, typeIndex, typeList, keyword } = this.data;
    const targetMonth = searchDate.substring(0, 7);
    const selectType = typeList[typeIndex];
    const key = keyword.trim();
    this.getOrderList(targetMonth, selectType, key)
  },

  // 预览PDF
  previewPDF(e) {
    wx.showLoading({ title: '下载中...' })
    wx.downloadFile({
      url: e.currentTarget.dataset.path,
      success: (res) => {
        wx.hideLoading()
        wx.openDocument({
          filePath: res.tempFilePath,
          fail: () => wx.showToast({ title: '打开文件失败', icon: 'none' })
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '文件下载失败', icon: 'none' })
      }
    })
  }
});