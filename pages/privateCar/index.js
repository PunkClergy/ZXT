// 引入蓝牙密钥管理工具和应用工具
const bleKeyManager = require('../../utils/BleKeyFun-utils.js');
const appUtil = require('../../utils/app-util.js');

// 页面实例引用
var that;
Page({
  data: {
    idc: '', // 身份标识
    data: '', // 输入数据
    msg: '', // 消息显示
    consolemsg: '', // 控制台消息
    deviceIDC: "51CarKey932505100319", // 默认设备ID
    isOwner: false, // 是否拥有者标识
    scrollTo: "hiddenview", // 滚动位置1
    scrollTo2: "hiddenview2", // 滚动位置2
    connectionState: "未连接", // 连接状态显示
    connectionID: "", // 连接ID
    connectionDisplay: "未连接", // 连接显示文本
    parseLen: 0, // 解析长度
    pageInterval: 0, // 页面定时器
    parsedData: [] // 解析后的数据数组
  },

  /**
   * 认证加密函数
   * @param {Array} passwordSource 原始密码数组
   * @param {Array} random 随机数数组
   * @returns {Array} 加密后的密码数组
   */
  auth_encrypt: function (passwordSource, random) {
    var passwordEncrypt = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (var i = 0; i < 6; i++) {
      passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 0xFF;
    }
    return passwordEncrypt;
  },

  /**
   * 发送命令按钮处理
   * @param {number} type 命令类型
   * @param {Array} data 命令数据
   */
  btnCmdSend: function (type, data) {
    const defaultData = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    switch (type) {
      case 0x10: // 认证命令
        var orgKey = [0x33, 0x69, 0x45, 0x22, 0x83, 0x78]; // 原始密钥
        that.PackAndSend(type, 8, that.auth_encrypt(orgKey, data));
        break;
      case 0x03: // 开锁命令
      case 0x04: // 锁车命令
      case 0x05: // 尾箱命令
      case 0x06: // 寻车命令
        that.PackAndSend(type, 8, defaultData);
        break;
      case 0x22: // 配对命令
        that.PackAndSend(type, 8, data);
        break;
    }
  },

  /**
   * 打包并发送数据
   * @param {number} type 数据类型
   * @param {number} len 数据长度
   * @param {Array} data 数据内容
   */
  PackAndSend: function (type, len, data) {
    // 数据包格式: 起始符(0x24) + 类型 + 长度 + 数据 + 结束符(0x24)
    var packet = [0x24, type, len, ...data, 0x24];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },

  /**
   * 数组转ArrayBuffer
   * @param {Array} array 原始数组
   * @param {number} elementSize 元素大小(默认为1)
   * @returns {ArrayBuffer} 转换后的ArrayBuffer
   */
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    array.forEach((value, index) => typedArray[index * elementSize] = value);
    return typedArray.buffer;
  },

  /**
   * 解析16进制数据的方法
   * @param {string} hexString - 30个字符长度的16进制字符串
   * @returns {Array|null} 解析后的结构化数据数组，格式为[{key: string, value: any}]
   */
  parseHexData: function(hexString) {
    // 确保数据长度正确（15字节 = 30个字符）
    if (hexString.length !== 30) {
      wx.showToast({
        title: '数据长度不正确',
        icon: 'none'
      });
      return null;
    }

    // 将16进制字符串转换为字节数组
    const bytes = [];
    for (let i = 0; i < 30; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // 准备要setData的数据
    const result = [];

    // 1. 解析基本状态 (D[0]-D[6])
    result.push({ key: '感应状态', value: bytes[0] === 1 ? '有效' : '无效' });
    result.push({ key: 'ACC状态', value: bytes[1] === 1 ? '开' : '关' });
    result.push({ key: '锁状态', value: bytes[2] === 1 ? '开' : '关' });
    result.push({ key: '3V断电剩余时间', value: bytes[3] + '分钟' });
    result.push({ key: '感应检测次数', value: bytes[4] });
    result.push({
      key: '自动感应模式',
      value: bytes[5] === 0 ? '操作后失效' : bytes[5] === 1 ? '一直有效' : '未知'
    });
    result.push({ key: '蓝牙断开自动锁车', value: bytes[6] === 1 ? '开' : '关' });

    // 2. 解析功能标志1 (D[7])
    result.push({ key: '洗车模式', value: (bytes[7] & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '蓝牙广播模式', value: (bytes[7] >> 1 & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '工作模式', value: (bytes[7] >> 6 & 0x01) === 0x00 ? '正常模式' : '网约车模式' });

    // 3. 解析感应信息 (D[8]-D[11])
    result.push({ key: '感应缓冲值', value: bytes[8] });
    result.push({ key: '感应门把手开关', value: bytes[9] === 1 ? '开' : '关' });
    result.push({ key: '信号强度值', value: bytes[10] });
    result.push({ key: '感应开锁信号值', value: bytes[11] });

    // 4. 解析电压信息 (D[12])
    result.push({ key: '电压值', value: (bytes[12] / 10).toFixed(1) + 'V' });

    // 5. 解析功能标志2 (D[13])
    result.push({ key: '常供电开关', value: (bytes[13] & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '蓝牙感应生效', value: (bytes[13] >> 1 & 0x01) === 0x00 ? '是' : '否' });

    // 6. 解析配对信息 (D[14])
    result.push({ key: '配对连接序号', value: bytes[14] & 0x07 });

    return result;
  },

  /**
   * 按钮点击事件处理函数 - 解析数据
   * @param {string} hexData - 16进制数据字符串
   */
  parseData: function(hexData) {
    // 调用解析方法
    const parsedResult = this.parseHexData(hexData);

    if (parsedResult) {
      this.setData({
        parsedData: parsedResult
      });
    }
  },

  /**
   * 开始蓝牙连接
   */
  btnStartConnect: function () {
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
        console.log(type, arrayData, hexData, hexTextData, '[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]')
        // 接收到认证请求时发送认证响应
        if (type == 0) { that.btnCmdSend(0x10, arrayData) } else {
          that.parseData(that.trimHexData(hexTextData))
        };

        // 更新接收到的消息显示
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
   * @param {string} hexString - 原始16进制字符串
   * @returns {string} 修剪后的16进制字符串
   */
  trimHexData: function(hexString) {
    // 检查输入是否有效
    if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
      throw new Error('无效的16进制字符串');
    }

    // 去除前4个字符和后2个字符
    return hexString.slice(4, -2);
  },

  /**
   * 断开蓝牙连接
   */
  btnEndConnect: function () {
    bleKeyManager.releaseBle();
  },

  // 以下为各种控制命令的快捷方法
  handleUnlock: function () { that.btnCmdSend(0x03, ""); }, // 开锁
  handleLock: function () { that.btnCmdSend(0x04, ""); }, // 锁车
  handleOpenTrunk: function () { that.btnCmdSend(0x05, ""); }, // 尾箱
  handleFindCar: function () { that.btnCmdSend(0x06, ""); }, // 寻车

  /**
   * 获取已连接设备
   */
  btnConnected: function () {
    bleKeyManager.connectedDevice();
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options 页面参数
   */
  onLoad: function (options) {
    console.log("页面加载");
    that = this;
    that.btnStartConnect(); // 自动开始连接

    // 设置定时器检查连接状态
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("页面隐藏");
    if (that.data.connectionState == "已连接") {
      setTimeout(() => bleKeyManager.releaseBle(), 1500);
    }
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({ keepScreenOn: false });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("页面卸载");
    setTimeout(() => bleKeyManager.releaseBle(), 500);
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({ keepScreenOn: false });
  },
});