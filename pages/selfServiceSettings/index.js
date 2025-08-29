// 工具函数：rpx 转 px
function rpxToPx(rpx) {
  const systemInfo = wx.getSystemInfoSync();
  const px = (rpx / 750) * systemInfo.windowWidth;
  return Math.round(px);
}

// 模拟请求函数（请替换为你的实际请求）
const { u_midMenulist } = require('../../utils/request/home');
const { byGet } = require('../../utils/request/http');

Page({
  data: {
    dataList: [],
    moveId: null,
    endY: 0,
    itemHeight: 0, // 将在 onLoad 中设置
    isInputting: false,
    c_link: 'https://k1sw.wiselink.net.cn/',
    containerHeight: 0, // 动态控制 movable-area 高度
  },

  onLoad() {
    const itemHeightPx = rpxToPx(100);
    this.setData({ itemHeight: itemHeightPx });
  },

  onShow() {
    this.initialQuickEntry();
  },

  // 刷新列表并计算容器高度
  refreshList(list) {
    const { itemHeight } = this.data;
    // 👇 计算总高度时，需要包含 margin
    // 假设您想要上下各 10rpx 的间距，总共就是 20rpx
    const itemMargin = rpxToPx(20); // 20rpx 转 px
    const totalItemHeight = itemHeight + itemMargin; // 每个项占据的总空间

    const positioned = list.map((item, index) => ({
      ...item,
      y: index * totalItemHeight, // 👈 y 值现在基于总高度计算
      x: 0,
    }));

    // 计算 movable-area 所需总高度
    const totalHeight = list.length * totalItemHeight + 20; // +20 安全边距

    this.setData({
      dataList: positioned,
      containerHeight: totalHeight
    }, () => {
      wx.setStorage({
        key: 'quickEntry',
        data: this.data.dataList,
        success: function () {
          getApp().data.reflag = 1
        },

      })
    });
  },

  // 拖拽中
  moving(e) {
    if (this.data.isInputting) return;
    const moveId = e.currentTarget.dataset.moveid;
    const y = e.detail.y;
    this.setData({ moveId, endY: y });
  },

  // 拖拽结束
  // 拖拽结束
  moved() {
    const { dataList, moveId, endY, itemHeight } = this.data;
    if (!moveId) return;

    // 👇 计算目标索引时，也需要使用总高度
    const itemMargin = rpxToPx(20); // 20rpx 转 px
    const totalItemHeight = itemHeight + itemMargin;
    const targetIndex = Math.max(0, Math.round(endY / totalItemHeight)); // 👈 使用 totalItemHeight

    const item = dataList.find(i => i.id === moveId);
    if (!item) return;

    const newList = dataList.filter(i => i.id !== moveId);
    newList.splice(targetIndex, 0, item);

    this.refreshList(newList); // refreshList 内部会重新计算 y

    setTimeout(() => {
      this.setData({ moveId: null });
    }, 150);
  },

  // 切换显示/隐藏
  toggleItem(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.dataList.map(item => {
      if (item.id === id) {
        return { ...item, isHidden: !item.isHidden };
      }
      return item;
    });
    this.refreshList(list);
  },

  // 输入排序号
  onSortInput(e) {
    const id = e.currentTarget.dataset.id;
    const value = e.detail.value.trim();

    const list = this.data.dataList.map(item => {
      if (item.id === id) {
        let num = '';
        if (value !== '') {
          num = parseInt(value);
          if (isNaN(num)) num = '';
          else if (num < 1) num = 1;
          else if (num > 99) num = 99;
        }
        return { ...item, sortNumber: num };
      }
      return item;
    });

    this.setData({ dataList: list });
  },

  // 聚焦输入框
  onInputFocus() {
    this.setData({ isInputting: true });
  },

  // 失焦输入框
  onInputBlur() {
    this.setData({ isInputting: false });
  },

  // 按输入数字排序
  sortListByNumber() {
    const { dataList } = this.data;

    const visible = dataList
      .filter(item => !item.isHidden)
      .sort((a, b) => {
        const na = typeof a.sortNumber === 'number' ? a.sortNumber : 999;
        const nb = typeof b.sortNumber === 'number' ? b.sortNumber : 999;
        return na - nb;
      });

    const hidden = dataList.filter(item => item.isHidden);
    const merged = [...visible, ...hidden];

    this.refreshList(merged);
    wx.showToast({ title: '已排序', icon: 'none', duration: 1000 });
  },

  // 初始化数据
  initialQuickEntry() {
    const url = `${this.data.c_link}${u_midMenulist.URL}`;
    const params = { terminalId: -1 };
    const _this = this
    wx.getStorage({
      key: 'quickEntry',
      success(res) {
        const rawData = res?.data;
        if (!rawData || !Array.isArray(rawData)) {
          return;
        }
        _this.refreshList(rawData);
      },
      fail(err) {
        byGet(url, params)
          .then(response => {
            const rawData = response?.data?.content;
            if (!rawData || !Array.isArray(rawData)) {
              console.error('数据格式错误', response);
              return;
            }

            const initList = rawData.map((item, index) => ({
              ...item,
              name: item.name || `未命名项${index + 1}`,
              sortNumber: '',
              isHidden: false,
              y: 0,
              x: 0,
            }));

            _this.refreshList(initList);
          })
          .catch(err => {
            console.error('请求失败:', err);
            wx.showToast({ title: '加载失败', icon: 'none' });
          });
      }
    });

  }
});