const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  byPost
} = require('../../../utils/request/http')
const {
  u_scheduledaddOrUpdate
} = require('../../../utils/request/order')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    time: '',
    label: '',
    vehids: '',
    params: {},
    allowuse: 0,
    starttime: '',
    endtime: '',
    days: [{
        label: '周一',
        value: 1,
        active: false
      },
      {
        label: '周二',
        value: 2,
        active: false
      },
      {
        label: '周三',
        value: 3,
        active: false
      },
      {
        label: '周四',
        value: 4,
        active: false
      },
      {
        label: '周五',
        value: 5,
        active: false
      },
      {
        label: '周六',
        value: 6,
        active: false
      },
      {
        label: '周日',
        value: 0,
        active: false
      }
    ],
  },
  handleCarList() {
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/blackTeche/timedVehicleAdd/index&flagMulti=1&info=${JSON.stringify(this.data)}`
    })
  },
  handleSubmit() {
    let temp = {
      title: this.data.title,
      ...this.data.params,
      starttime: this.data.starttime,
      endtime: this.data.endtime,
      allowuse: this.data.allowuse,
      vehids: this.data.vehids,
      dayofweek: this.data.days
        .filter(item => item.active)
        .map(item => item.value)
    }
    console.log(temp)
    byPost(getApp().data.k1swUrl + u_scheduledaddOrUpdate.URL, temp, (response) => {
      console.log(response)
      wx.reLaunch({
        url: '/pages/blackTeche/timedVehicle/index',
      })

    });
  },
  // 内容输入回调
  handleBindinput(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    })
  },
  handleToggleEnable(evt) {
    this.setData({
      allowuse: evt.detail.value
    })
  },
  onLoad(options) {
    if (options.black) {
      this.setData({
        ...JSON.parse(options.info),
        vehids: options.black,
        platenumbers: options.platenumbers,
      })
    }
    if (options.details) {
      console.log(JSON.parse(options.details))
      const dayofweek = JSON.parse(options.details).dayofweek.split(",").map(Number);
      const days = this.data.days
      const newDays = days.map(day => ({
        ...day,
        active: Array.isArray(dayofweek) ?
          dayofweek.includes(day.value) : day.value === dayofweek
      }));
      this.setData({
        ...JSON.parse(options.details),
        days: newDays,
        params: {
          title: JSON.parse(options.details).title,
          bak: JSON.parse(options.details).bak
        }
      })
    }
  },
  handleBindStartTimeChange(e) {
    this.setData({
      starttime: e.detail.value
    });
  },
  hadnlebindEndTimeChange(e) {
    this.setData({
      endtime: e.detail.value
    });
  },
  bindLabelInput(e) {
    this.setData({
      label: e.detail.value
    });
  },
  handleToggleDay(e) {
    const dayValue = parseInt(e.currentTarget.dataset.day);
    const days = this.data.days.map(item => {
      if (item.value === dayValue) {
        return {
          ...item,
          active: !item.active
        };
      }
      return item;
    });
    this.setData({
      days
    });
  },
});