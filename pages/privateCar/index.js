const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.windowHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    // 车辆状态
    lockActive: false, // 车门锁定状态
    chargingStatus: '充电中', // 充电状态
    chargingAnimation: true, // 充电动画效果
    
    // 车辆数据
    batteryLevel: 82, // 当前电量
    range: 438, // 续航里程
    totalMileage: 12584, // 总里程
    batteryTemp: 32, // 电池温度
  },
  
  // 页面加载
  onLoad() {
    // 模拟获取车辆数据
    this.getVehicleData();
  },
  
  // 获取车辆数据
  getVehicleData() {
    // 这里应该是API请求
    setTimeout(() => {
      this.setData({
        batteryLevel: 82,
        range: 438,
        totalMileage: 12584,
        batteryTemp: 32
      });
    }, 1000);
  },
  
  // 切换车门锁定状态
  toggleLock() {
    wx.showToast({
      title:  '车门已解锁',
      icon: 'none',
      duration: 1500
    });
  },

  
  // 灯光控制
  controlLights() {
    wx.showToast({
      title: '车门已锁定',
      icon: 'none',
      duration: 1500
    });
  },
  
  // 寻车鸣笛
  findCar() {
    wx.showToast({
      title: '正在鸣笛寻车',
      icon: 'none',
      duration: 1500
    });
  },
  
  // 车窗除雾
  defogWindows() {
    wx.showToast({
      title: '车窗除雾已开启',
      icon: 'none',
      duration: 1500
    });
  },
  
  // 充电预约
  scheduleCharging() {
    wx.navigateTo({
      url: '/pages/charging/charging',
    });
  },
  
  // 切换充电状态
  toggleCharging() {
    const newStatus = this.data.chargingStatus === '充电中' ? '已停止' : '充电中';
    const newAnimation = newStatus === '充电中';
    
    this.setData({
      chargingStatus: newStatus,
      chargingAnimation: newAnimation
    });
    
    wx.showToast({
      title: newStatus === '充电中' ? '充电已开始' : '充电已停止',
      icon: 'success',
      duration: 1500
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.getVehicleData();
    wx.stopPullDownRefresh();
  }
});