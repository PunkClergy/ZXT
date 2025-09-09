const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default

const bleKeyManager = require('../../utils/BleKeyFun-utils.js');  // 蓝牙密钥管理
const appUtil = require('../../utils/app-util.js');               // 应用工具

// 页面定义
Page({
  /**
   * 页面初始数据
   */
  data: {
    // 界面布局相关
    c_screen_height: _handleWindowInfo.windowHeight || 0,         // 屏幕高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0,    // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度(平台差异)
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, // 平台特定高度

    // 界面显示相关
    s_background_picture_of_the_front_page: '',  // 首页背景图
    isBluetoothConnected: true,                  // 蓝牙连接状态
    batteryLevel: 78,                            // 电池电量(百分比)
    mode: 'manual',                              // 当前模式(manual/auto)

    // 控制项分页相关
    pages: [],                                   // 分页后的控制项
    currentPage: 0,                              // 当前页码
    indicatorPosition: '0%',                     // 指示器位置
    allControlItems: [],

    // 蓝牙通信相关
    dc: '',                                      // 设备标识
    data: '',                                    // 输入数据
    msg: '',                                     // 消息日志
    consolemsg: '',                              // 控制台消息
    deviceIDC: "932505100228",          // 默认设备ID
    orgKey: [0x33, 0x47, 0x01, 0x82, 0x34, 0x33], // 原始密钥
    isOwner: false,                              // 所有者标识
    connectionState: "未连接",                   // 连接状态
    connectionID: "",                            // 连接ID
    connectionDisplay: "未连接",                 // 连接显示文本

    // 数据解析相关
    scrollTo: "hiddenview",                      // 滚动位置1
    scrollTo2: "hiddenview2",                    // 滚动位置2
    parseLen: 0,                                 // 解析数据长度
    parsedData: {},                              // 解析后的数据
    voltage_image: '100',                        //剩余电池电量显示图片

    // 定时器相关
    pageInterval: 0,                              // 状态检查定时器
    controlItems: [
      { id: 1, name: '开锁', enabled: true, evt: 'handleUnlock' },
      { id: 2, name: '关锁', enabled: true, evt: 'handleLock' },
      { id: 3, name: '尾箱', enabled: true, evt: 'handleOpenTrunk' },
      { id: 4, name: '寻车', enabled: true, evt: 'handleFindCar' },
      { id: 5, name: '升窗', enabled: true, evt: 'handlRaiseTheWindow' },
      { id: 6, name: '降窗', enabled: true, evt: 'handleLowerTheWindow' },
    ],
    blue_tooth_state: false,//点击蓝牙已连接
    voltage_state: false,//点击电池电量处
  },



  /**
   * 生命周期函数 - 页面隐藏
   */
  onHide: function () {
    const that = this
    setTimeout(() => bleKeyManager.releaseBle(), 1500);
    this.setData({
      connectionState: "未连接",                   // 连接状态
      connectionID: "",                            // 连接ID
      connectionDisplay: "未连接",                 // 连接显示文本
      parsedData: {}
    })
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({ keepScreenOn: false })
  },
  // 蓝牙连接处理
  handleStart() {
    const that = this
    // 统一处理函数
    const handleData = (data) => {
      if (!data) return;
      that.setData({
        deviceIDC: `${data?.sn}`,
        orgKey: that.handleTransformation(data?.bluetoothKey),
        orgKeyOld: data?.bluetoothKey,
        bluetoothData: data
      }, () => {
        that.handleBule();
      });
    };
    // 本地存储处理
    wx.getStorage({
      key: 'bluetoothData',
      success(res) {
        handleData(res.data);
      }
    });

  },
  /**
   * 生命周期函数 - 页面卸载
   */
  onUnload: function () {
    const that = this
    setTimeout(() => bleKeyManager.releaseBle(), 500);
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({ keepScreenOn: false });
  },

  /**
   * 认证加密算法
   * @param {Array} passwordSource 原始密码(6字节数组)
   * @param {Array} random 随机数(6字节数组)
   * @returns {Array} 加密后的密码(8字节数组)
   */
  auth_encrypt: function (passwordSource, random) {
    var passwordEncrypt = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (var i = 0; i < 6; i++) {
      passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 0xFF;
    }
    return passwordEncrypt;
  },

  // 点击蓝牙出现tips
  handleBlueToothState() {
    const _this = this;
    _this.setData({ blue_tooth_state: true }, () => {
      setTimeout(() => {
        _this.setData({
          blue_tooth_state: false
        });
      }, 3000); // 3000 是 setTimeout 的延迟时间
    });
  },
  handleVoltage() {
    const _this = this;
    _this.setData({ voltage_state: true }, () => {
      setTimeout(() => {
        _this.setData({
          voltage_state: false
        });
      }, 3000); // 3000 是 setTimeout 的延迟时间
    });
  },
  handleBule() {
    const that = this
    that.btnStartConnect();  // 自动连接蓝牙
    // 设置定时状态检查
    that.data.pageInterval = setInterval(() => {
      const isConnected = bleKeyManager.getBLEConnectionState();
      that.setData({
        connectionState: isConnected ? "已连接" : "未连接",
        connectionID: isConnected ? bleKeyManager.getBLEConnectionID() : "",
        connectionDisplay: isConnected ? that.data.connectionID : "未连接",
      });
    }, 200);

    // 初始化数据
    that.setData({
      msg: "",
      consolemsg: "",
      parseLen: 0,
    });

    // 保持屏幕常亮
    wx.setKeepScreenOn({ keepScreenOn: true });
  },
  /**
   * 发送控制命令
   * @param {number} type 命令类型
   * @param {Array} data 命令数据
   */
  btnCmdSend: function (type, data) {
    const that = this
    const defaultData = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    switch (type) {
      case 0x10: // 认证命令
        const orgKey = this.data.orgKey; // 原始密钥
        that.PackAndSend(type, 8, that.auth_encrypt(orgKey, data));
        break;
      case 0x03: // 开锁
      case 0x04: // 锁车
      case 0x05: // 尾箱
      case 0x06: // 寻车
        that.PackAndSend(type, 8, defaultData);
        break;
      case 0x22: // 配对
        that.PackAndSend(type, 8, data);
        break;
      case 0x07: // 
        that.PackAndSend07(type, 8, data);
        break;
    }
  },

  /**
   * 数据打包与发送
   * @param {number} type 数据类型
   * @param {number} len 数据长度
   * @param {Array} data 数据内容
   */
  PackAndSend: function (type, len, data) {
    // 数据包格式: 起始符(0x24) + 类型 + 长度 + 数据 + 结束符(0x24)
    var packet = [0x24, type, len, ...data, 0x24];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  // 升窗降窗指令封装
  PackAndSend07: function (type, len, data) {
    const defaultData = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    var packet = [0x24, type, len, data, ...defaultData, 0x24];
    console.log(packet)
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  /**
   * 数组转ArrayBuffer
   * @param {Array} array 原始数组
   * @param {number} elementSize 元素大小(默认1字节)
   * @returns {ArrayBuffer} 转换后的缓冲区
   */
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    array.forEach((value, index) => typedArray[index * elementSize] = value);
    return typedArray.buffer;
  },
  handleTransformation(number) {
    if (!number) return
    const numStr = number.toString();
    // 分割成每两个字符一组
    const bytes = [];
    for (let i = 0; i < numStr.length; i += 2) {
      const byteStr = numStr.substring(i, i + 2);
      bytes.push(parseInt(byteStr, 16)); // 按16进制解析
    }
    return bytes
  },

  parseHexDataObject: function (hexString) {
    // 验证数据长度
    if (hexString.length !== 30) {
      // wx.showToast({ title: '数据长度不正确', icon: 'none' });
      return null;
    }

    // 转换为字节数组
    const bytes = [];
    for (let i = 0; i < 30; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    const resultObject = {}
    resultObject.lock = bytes[2] === 1 ? true : false;//锁状态
    resultObject.voltage = (bytes[12] / 10).toFixed(1);//电池剩余电压计算
    resultObject.supply = bytes[3];
    resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式';//执行模式
    return resultObject;
  },

  /**
   * 数据解析按钮处理
   * @param {string} hexData 16进制数据字符串
   */
  parseData: function (hexData) {
    const parsedResult = this.parseHexDataObject(hexData);
    if (parsedResult) {
      this.setData({ parsedData: parsedResult });
    }
  },

  /**
   * 初始化蓝牙连接
   */
  btnStartConnect: function () {
    const that = this
    if (that.data.connectionID == "") {
      bleKeyManager.connectBLE(that.data.deviceIDC, function (state) {
        // 蓝牙状态处理映射
        const stateHandlers = {
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => { },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => appUtil.hideLoading(),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () =>
            appUtil.showModal('请打开蓝牙', false, () => { }),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () =>
            appUtil.showModal('没有发现设备', false, () => { }),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => { },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () =>
            appUtil.showModal('您的手机不支持低功耗蓝牙', false, () => { }),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () =>
            appUtil.showModal('数据发送失败', false, () => { }),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () =>
            appUtil.showModal('设备超时无响应', false, () => { }),
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS]: () => appUtil.hideLoading()
        };

        if (stateHandlers[state]) stateHandlers[state]();
      }, function (type, arrayData, hexData, hexTextData) {
        wx.hideLoading()
        // 认证响应处理
        if (type == 0) {
          that.btnCmdSend(0x10, arrayData)
        } else {
          that.parseData(that.trimHexData(hexTextData))
        };

        // 更新接收消息显示
        that.setData({
          msg: that.data.msg + "receive: type:" + type + ",data:" + hexTextData + "\r\n",
          scrollTo: "hiddenview"
        });
      });
    } else {
      appUtil.showModal('已连接蓝牙', false, () => { });
    }
  },

  /**
   * 修剪16进制数据
   * @param {string} hexString 原始16进制字符串
   * @returns {string} 修剪后的有效数据部分
   */
  trimHexData: function (hexString) {
    if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
      throw new Error('无效的16进制字符串');
    }
    return hexString.slice(4, -2);  // 去除头尾固定字符
  },

  /**
   * 断开蓝牙连接
   */
  btnEndConnect: function () {
    bleKeyManager.releaseBle();
  },

  // 快捷控制命令方法
  handleUnlock: function () { this._sendVehicleCommand(0x03, ''); },   // 开锁命令
  handleLock: function () { this._sendVehicleCommand(0x04, ''); },     // 锁车命令
  handleOpenTrunk: function () {
    this._sendVehicleCommand(0x05, '');
  },// 尾箱命令
  handleFindCar: function () { this._sendVehicleCommand(0x06, ''); },  // 寻车命令
  handlRaiseTheWindow: function () { this._sendVehicleCommand(0x07, 0x03); },  // 升窗命令
  handleLowerTheWindow: function () { this._sendVehicleCommand(0x07, 0x04); }, // 降窗命令

  // 指令公共方法
  _sendVehicleCommand: function (commandCode, code) {
    if (!this.data?.bluetoothData?.platenumber) {
      wx.showModal({
        title: '提示',
        content: '请先开通设定再到开通设定-功能设置处完善设置',
        confirmText: '立即开通',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/listOfPrivateCars/list/index'
            });
          }
        }
      });
      return
    }
    if (this.data?.bluetoothData?.platenumber && this.data.connectionState == '已连接') {
      wx.showModal({
        title: '提示',
        content: commandCode == 0x03 || commandCode == 0x04 ? '确认下发指令' : '如原车钥匙不支持此功能请自行点击【更多钥匙功能】关闭',
        confirmText: commandCode == 0x03 || commandCode == 0x04 ? '确认' : '确认支持',
        complete: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中...',
              mask: true,
            })
            this.btnCmdSend(commandCode, code);
            setTimeout(() => {
              wx.hideLoading()
            }, 5000)
          }
        }
      })
      return
    }
    if (this.data.connectionState == '未连接') {
      wx.showToast({
        title: '请等待蓝牙连接后重试',
        icon: 'none'
      });
      return;
    }
  },

  /**
   * 获取已连接设备信息
   */
  btnConnected: function () {
    bleKeyManager.connectedDevice();
  },

  handleSelectJump() {
    this.handleStart()
  },
});