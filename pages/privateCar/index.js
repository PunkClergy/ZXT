Page({
  data: {
    currentPage: 0,
    scrollLeft: 0,
    isAutoMode: false,  // 默认手动模式
    distance: 3         // 默认感应距离3米
  },
  
  onLoad: function() {
    // 初始化时可以添加其他逻辑
  },
  
  // 切换模式
  switchMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      isAutoMode: mode === 'auto'
    });
    wx.showToast({
      title: mode === 'auto' ? '已切换至感应模式' : '已切换至手动模式',
      icon: 'none'
    });
  },
  
  // 改变感应距离
  changeDistance: function(e) {
    this.setData({
      distance: e.detail.value
    });
  },
  
  handleScroll: function(e) {
    const scrollLeft = e.detail.scrollLeft;
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    const newPage = Math.round(scrollLeft / screenWidth);
    
    if (newPage !== this.data.currentPage) {
      this.setData({
        currentPage: newPage
      });
    }
  },
  
  // 控制按钮方法
  toggleLock: function() {
    wx.showToast({ title: '执行开锁操作', icon: 'none' });
  },
  
  controlLights: function() {
    wx.showToast({ title: '执行关锁操作', icon: 'none' });
  },
  
  findCar: function() {
    wx.showToast({ title: '执行寻车鸣笛', icon: 'none' });
  },
  
  openTrunk: function() {
    wx.showToast({ title: '执行开启后备箱', icon: 'none' });
  },
  
  climateControl: function() {
    wx.showToast({ title: '执行空调控制', icon: 'none' });
  }
});