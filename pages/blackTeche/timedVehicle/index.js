const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_scheduledCarList
} = require('../../../utils/request/order')
const {
  byGet
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.windowHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_comParam: '', //输入框内容
    alarms: [{
        id: 1,
        title: '定时内容标题',
        starttime: '07:09',
        endtime: '09:09',
        vehids: [],
        dayofweek: [1, 2, 3, 4, 5],
        allowuse: true,
        bak: '22222'
      },
      {
        id: 2,
        time: "08:00",
        repeatDays: [0, 6],
        enabled: false
      }
    ]
  },

  // 格式化重复天数
  formatRepeatDays(days) {
    if (days.length === 0) return "仅一次";
    if (days.length === 7) return "每天";

    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return days.map(d => weekDays[d]).join(" ");
  },

  // 切换闹钟状态
  toggleAlarm(e) {
    const id = e.currentTarget.dataset.id;
    const alarms = this.data.alarms.map(alarm => {
      if (alarm.id === id) {
        alarm.enabled = !alarm.enabled;
      }
      return alarm;
    });
    this.setData({
      alarms
    });
  },

  // 添加新闹钟
  addAlarm() {
    wx.showToast({
      title: '跳转到添加页面',
      icon: 'none'
    })
    // 实际使用时跳转到添加页面
    // wx.navigateTo({ url: '/pages/add-alarm/add-alarm' })
  },

  // 编辑闹钟
  editAlarm(e) {
    const id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/blackTeche/timedVehicleAdd/index?id=${id}`
    })
  },
  initList() {
    const param = {
      [u_scheduledCarList.page]: this.data.g_page,
      [u_scheduledCarList.comParam]: this.data.comParam
    };
    byGet(getApp().data.k1swUrl + u_scheduledCarList.URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  onLoad() {
    console.log(211)
    this.initList()
  },
})