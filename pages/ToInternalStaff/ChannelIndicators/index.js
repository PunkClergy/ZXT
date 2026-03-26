const {
  byGet,
  byPost
} = require('../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_myCustomerPdList,
  u_customerList
} = require('../../../utils/request/dispatch')
Page({
  data: {
    // 搜索条件
    searchDate: '', // 选中月份
    typeIndex: 0, // 类型选中索引
    typeList: ['全部', '停运批单', '失联批单'], // 类型下拉选项
    keyword: '', // 搜索关键词

    // 列表数据
    list: [],
    g_page: 1, // 当前页码
    g_total: 0, // 总条数
    noMore: false, // 是否没有更多数据

    // 原始总数据（用于筛选）
    originList: [
      {
        batchNo: 'P202603001',
        createTime: '2026-03-26 10:20',
        typeName: '类型A',
        company: '测试科技有限公司',
        filePath: 'https://example.com/file1.pdf'
      },
      {
        batchNo: 'P202602002',
        createTime: '2026-02-15 09:30',
        typeName: '类型B',
        company: '张三贸易公司',
        filePath: 'https://example.com/file2.pdf'
      }
    ],

    // PDF预览
    showPdfModal: false,
    currentPdfPath: ''
  },

  // 查询列表（支持刷新/加载更多）
  getOrderList(targetMonth, selectType, key) {
    showLoading("加载中...");
    const param = {
      comParam: key || '',
      page: this.data.g_page,
      typeName: selectType || '',
      month: targetMonth || ''
    }
    byGet(getApp().data.k1swUrl + u_myCustomerPdList.URL, param).then(response => {
      hideLoading()
      // 停止下拉刷新动画
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

  onLoad() {

  },
  onShow() {
    // 页面显示刷新数据
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

  // 搜索按钮 - 核心筛选逻辑
  onSearch() {
    const { searchDate, typeIndex, typeList, keyword } = this.data;
    const targetMonth = searchDate.substring(0, 7);
    // 2. 按类型筛选
    const selectType = typeList[typeIndex];
    // 3. 按关键词筛选（批单号/公司名）
    const key = keyword.trim();
    this.getOrderList(targetMonth, selectType, key)
  },

  // 点击查看PDF
  previewPDF(e) {
    wx.showLoading({
      title: '下载中...',
    })
    wx.downloadFile({
      url: e.currentTarget.dataset.path,
      success: (res) => {
        wx.hideLoading()
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
        wx,hideLoading()
        console.error('下载失败', err)
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        })
      }
    })

  },



  // 阻止弹窗内容区关闭
  preventClose() { }
});