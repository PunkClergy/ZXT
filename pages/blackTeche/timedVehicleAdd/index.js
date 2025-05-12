const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    time: '',
    label: '',
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
    ]
  },

  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },

  bindLabelInput(e) {
    this.setData({
      label: e.detail.value
    });
  },

  toggleDay(e) {
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

  saveAlarm() {
    if (!this.data.time) {
      wx.showToast({
        title: '请选择时间',
        icon: 'none'
      });
      return;
    }

    const activeDays = this.data.days
      .filter(item => item.active)
      .map(item => item.value);

    if (activeDays.length === 0) {
      wx.showToast({
        title: '请选择生效日期',
        icon: 'none'
      });
      return;
    }

    const alarm = {
      time: this.data.time,
      label: this.data.label,
      days: activeDays,
      enabled: true
    };

    // 实际保存逻辑（示例）
    console.log('保存闹钟：', alarm);
    wx.showToast({
      title: '保存成功'
    });
    wx.navigateBack();
  }
});