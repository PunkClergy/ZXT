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
  u_channelCommissionList
} = require('../../../utils/request/dispatch')

Page({
  data: {
    // 搜索条件
    searchDate: '2026-04',
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
    byGet(getApp().data.k1swUrl + u_channelCommissionList.URL, param).then(response => {
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
  initMonth() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const currentMonthStr = `${year}-${month}`;
    this.setData({
      searchDate: currentMonthStr
    }, () => {
      this.onSearch()
    })
  },
  onShow() {
    this.initMonth()
  },

  // 选择月份
  onDateChange(e) {
    this.setData({
      searchDate: e.detail.value
    });
  },

  // 选择类型
  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    });
  },

  // 输入关键词
  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索按钮
  onSearch() {
    const {
      searchDate,
      typeIndex,
      typeList,
      keyword
    } = this.data;
    const targetMonth = searchDate.substring(0, 7);
    const selectType = typeList[typeIndex];
    const key = keyword.trim();
    this.getOrderList(targetMonth, selectType, key)
  },


});