const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  u_shareRecord
} = require('../../../utils/request/data_info')
Page({
  data: {
    recordList: [],
    loading: false,
    clink: 'http://192.168.10.100:8689/',
    // 分页参数
    page: 1, // 页码（后端一般从0或1开始，这里默认0）
    size: 10, // 每页20条
    noMore: false // 是否没有更多数据
  },

  onLoad() {
    this.getRecordList();
  },

  // 获取记录（支持分页）
  getRecordList() {
    // 防重复请求 + 没有更多数据时不请求
    if (this.data.loading || this.data.noMore) return;

    this.setData({
      loading: true
    });

    // 拼接分页参数
    const {
      page,
      size
    } = this.data;
    const url = `${this.data.clink}${u_shareRecord.URL}?page=${page}&size=${size}`;

    byGet(url).then(res => {
      if (res.statusCode === 200) {
        const newList = res.data.content || [];
        const {
          recordList
        } = this.data;

        // 拼接数据
        const totalList = page === 0 ? newList : [...recordList, ...newList];

        this.setData({
          recordList: totalList,
          loading: false,
          // 如果返回不足20条，说明没有更多
          noMore: newList.length < size
        });
      } else {
        showToast("获取失败");
        this.setData({
          loading: false
        });
      }
    }).catch(() => {
      showToast("网络异常");
      this.setData({
        loading: false
      });
    });
  },

  // 下拉刷新 → 重置分页
  onPullDownRefresh() {
    this.setData({
      page: 0,
      noMore: false,
      recordList: []
    }, () => {
      this.getRecordList();
      wx.stopPullDownRefresh();
    });
  },

  // 滚动到底部 → 加载下一页
  loadMore() {
    if (this.data.noMore) return;
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.getRecordList();
    });
  }
});

// 工具方法
function showToast(msg) {
  wx.showToast({
    title: msg,
    icon: "none"
  })
}