Page({
  data: {
    currentPage: 0,
    scrollLeft: 0,
    isAutoMode: false,  // 默认手动模式
    distance: 3         // 默认感应距离3米
  },

  onLoad: function () {
    // 初始化时可以添加其他逻辑
  },

  // 切换模式
  switchMode: function (e) {
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
  changeDistance: function (e) {
    this.setData({
      distance: e.detail.value
    });
  },

  handleScroll: function (e) {
    const scrollLeft = e.detail.scrollLeft;
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    const newPage = Math.round(scrollLeft / screenWidth);

    if (newPage !== this.data.currentPage) {
      this.setData({
        currentPage: newPage
      });
    }
  },
  stringToArrayBuffer(str) {
    // 创建一个长度为字符串长度的ArrayBuffer
    const buffer = new ArrayBuffer(str.length);
    // 创建DataView来操作buffer
    const dataView = new DataView(buffer);

    // 将字符串的每个字符转换为Unicode码并存入buffer
    for (let i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charCodeAt(i));
    }

    return buffer;
  },
  // 控制按钮方法
  toggleLock: function () {
    wx.showToast({ title: '执行开锁操作', icon: 'none' });
    const value = wx.getStorageSync('BluetoothData');
    console.log(value,'22222555')
    // 创建1字节缓冲区
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    // 生成随机数写入缓冲区
    console.log(this.data)
    const arrayBuffer = this.stringToArrayBuffer('245906 336945228378 24');
    // 执行写入操作
    wx.writeBLECharacteristicValue({
      deviceId: value._deviceId,
      serviceId: value._serviceId,        // 注意：此处可能有误，应为this._serviceId
      characteristicId: value._characteristicId,
      value: arrayBuffer,  // 要写入的二进制数据
      success(res) {
        console.log('特征值写入成功', res)
        // 可以在这里添加写入成功后的处理逻辑
      },
      fail(err) {
        console.error('特征值写入失败', err)
        // 错误处理逻辑
        if (err.errMsg.includes('not connected')) {
          console.warn('设备未连接，尝试重新连接...')
          // 重新连接逻辑
        }
      },
      complete() {
        console.log('写入操作完成')
        // 无论成功失败都会执行
      }
    })
  },

  controlLights: function () {
    wx.showToast({ title: '执行关锁操作', icon: 'none' });
  },

  findCar: function () {
    wx.showToast({ title: '执行寻车鸣笛', icon: 'none' });
  },

  openTrunk: function () {
    wx.showToast({ title: '执行开启后备箱', icon: 'none' });
  },

  climateControl: function () {
    wx.showToast({ title: '执行空调控制', icon: 'none' });
  }
});