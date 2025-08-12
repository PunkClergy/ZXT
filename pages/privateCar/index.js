const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const bleKeyManager = require('../../utils/BleKeyFun-utils.js');  // 蓝牙密钥管理
const appUtil = require('../../utils/app-util.js');               // 应用工具
const {
  u_getCarBluetoothKeyByCode
} = require('../../utils/request/order')

var that  // 全局页面引用
const detaltAllControlItems = [                           // 所有控制项配置
  { id: 1, name: '开锁', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/unlock_off.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/unlock_on.png', evt: 'handleUnlock' },
  { id: 2, name: '关锁', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/lock_off.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/lock_on.png', evt: 'handleLock' },
  { id: 5, name: '配置', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/set.png', evt: 'handleToConfigure' },
]
// 页面定义
Page({
  /**
   * 页面初始数据
   */
  data: {
    // 界面布局相关
    c_screen_height: _handleWindowInfo.screenHeight || 0,         // 屏幕高度
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
    deviceIDC: "51CarKey932505100228",          // 默认设备ID
    orgKey: [0x33, 0x47, 0x01, 0x82, 0x34, 0x33], // 原始密钥
    isOwner: false,                              // 所有者标识
    connectionState: "未连接",                   // 连接状态
    connectionID: "",                            // 连接ID
    connectionDisplay: "未连接",                 // 连接显示文本

    // 数据解析相关
    scrollTo: "hiddenview",                      // 滚动位置1
    scrollTo2: "hiddenview2",                    // 滚动位置2
    parseLen: 0,                                 // 解析数据长度
    parsedData: [],                              // 解析后的数据

    // 定时器相关
    pageInterval: 0                              // 状态检查定时器
  },

  /**
   * 生命周期函数 - 页面加载
   * @param {Object} options 页面参数
   */
  onLoad: function (options) {
    const that = this;

    // 统一处理函数
    const handleData = (data) => {
      if (!data) return;

      that.setData({
        deviceIDC: `51CarKey${data?.sn}`,
        orgKey: data?.bluetoothKey,
        bluetoothData: data
      }, () => {
        that.handleBule();
      });
    };

    if (options?.scene) {
      // 场景参数处理
      byGet(getApp().data.k1swUrl + u_getCarBluetoothKeyByCode.URL, {
        code: options.scene
      }).then(response => {
        if (!response?.data?.content) {
          console.error('无效的响应数据');
          return;
        }
        handleData(response.data.content);
      }).catch(err => {
        console.error('请求失败:', err);
      });
    } else {
      // 本地存储处理
      wx.getStorage({
        key: 'bluetoothData',
        success(res) {
          console.log('获取缓存成功:', res.data);
          handleData(res.data);
        },
        fail(err) {
          console.error('获取缓存失败:', err);
        }
      });
    }
  },

  /**
   * 生命周期函数 - 页面隐藏
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
   * 生命周期函数 - 页面卸载
   */
  onUnload: function () {
    console.log("页面卸载");
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

  // 转换电池剩余电量
  initVoltage(dy) {
    const thresholds = [
      { min: 4.0, score: 100 },
      { min: 3.9, score: 90 },
      { min: 3.8, score: 80 },
      { min: 3.7, score: 70 },
      { min: 3.6, score: 60 },
      { min: 3.5, score: 50 },
      { min: 3.4, score: 40 },
      { min: 3.3, score: 30 },
      { min: 3.2, score: 20 },
      { min: 3.1, score: 10 }
    ];
    return thresholds.find(t => dy >= t.min)?.score || 0;
  },
  // 剩余电量处转换
  getBatteryLevel(voltage) {
    if (voltage > 90) return '100';
    if (voltage > 70) return '75';
    if (voltage > 50) return '50';
    if (voltage > 25) return '25';
    return '0';
  },
  /**
   * 解析16进制车辆状态数据
   * @param {string} hexString 30字符的16进制字符串
   * @returns {Array|null} 解析结果数组，格式为[{key: string, value: any}]
   */
  parseHexData: function (hexString) {
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

    // 解析各项状态数据
    const result = [];
    const resultObject = {}

    // 1. 基础状态解析
    result.push({ key: '感应状态', value: bytes[0] === 1 ? '有效' : '无效' });
    result.push({ key: 'ACC状态', value: bytes[1] === 1 ? '开' : '关' });
    result.push({ key: '锁状态', value: bytes[2] === 1 ? true : false });
    resultObject.lock = bytes[2] === 1 ? true : false;
    result.push({ key: '3V断电剩余时间', value: bytes[3] + '分钟' });
    result.push({ key: '感应检测次数', value: bytes[4] });
    result.push({
      key: '自动感应模式',
      value: bytes[5] === 0 ? '操作后失效' : bytes[5] === 1 ? '一直有效' : '未知'
    });
    result.push({ key: '蓝牙断开自动锁车', value: bytes[6] === 1 ? '开' : '关' });

    // 2. 功能标志1解析
    result.push({ key: '洗车模式', value: (bytes[7] & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '蓝牙广播模式', value: (bytes[7] >> 1 & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '工作模式', value: (bytes[7] >> 6 & 0x01) === 0x00 ? '正常模式' : '网约车模式' });

    // 3. 感应信息解析
    result.push({ key: '感应缓冲值', value: bytes[8] });
    result.push({ key: '感应门把手开关', value: bytes[9] === 1 ? '开' : '关' });
    result.push({ key: '信号强度值', value: bytes[10] });
    result.push({ key: '感应开锁信号值', value: bytes[11] });

    // 4. 电压信息
    result.push({ key: '电压值', value: (bytes[12] / 10).toFixed(1) + 'V' });

    // 5. 功能标志2解析
    result.push({ key: '常供电开关', value: (bytes[13] & 0x01) === 0x01 ? '开' : '关' });
    result.push({ key: '蓝牙感应生效', value: (bytes[13] >> 1 & 0x01) === 0x00 ? '是' : '否' });

    // 6. 配对信息
    result.push({ key: '配对连接序号', value: bytes[14] & 0x07 });

    return result;
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
    resultObject.voltage = this.initVoltage((bytes[12] / 10).toFixed(1));//电池剩余电压计算
    resultObject.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(1)));//电池剩余电量计算图片
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
    // wx.showLoading({
    //   title: '蓝牙搜索中...',  
    //   mask: true       
    // })
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
  handleUnlock: function () { that.btnCmdSend(0x03, ""); },   // 开锁命令
  handleLock: function () { that.btnCmdSend(0x04, ""); },     // 锁车命令
  handleOpenTrunk: function () { that.btnCmdSend(0x05, ""); },// 尾箱命令
  handleFindCar: function () { that.btnCmdSend(0x06, ""); },  // 寻车命令
  handleToConfigure: function () {
    console.log(123)
    wx.navigateTo({
      url: '/pages/listOfPrivateCars/setting/index?sign=4',
    })
  },

  /**
   * 获取已连接设备信息
   */
  btnConnected: function () {
    bleKeyManager.connectedDevice();
  },

  /**
   * 图片转base64格式
   */
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];

    // 创建转换Promise数组
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({ [item.key]: `data:image/png;base64,${res.data}` });
          }
        });
      })
    );

    // 执行所有转换
    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },

  /**
   * 控制项分页处理
   */
  splitControlItems: function () {
    const pages = [];
    const itemsPerPage = 4;
    const tempItems = [];
    this.data.allControlItems.forEach(item => {
      if (item.enabled === true) {
        tempItems.push(item);
      }
    });
    for (let i = 0; i < tempItems.length; i += itemsPerPage) {
      pages.push(tempItems.slice(i, i + itemsPerPage));
    }

    this.setData({
      pages,
      indicatorWidth: pages.length === 1 ? '100%' : '20%'
    });
  },

  /**
   * 滚动事件处理
   * @param {Object} e 滚动事件对象
   */
  scrollHandler: function (e) {
    const scrollLeft = e.detail.scrollLeft;
    const scrollWidth = e.detail.scrollWidth;
    const pageWidth = scrollWidth / this.data.pages.length;
    const currentPage = Math.round(scrollLeft / pageWidth);

    // 计算指示器位置
    const maxScroll = scrollWidth - pageWidth;
    let positionPercent = 0;

    if (this.data.pages.length === 1) {
      positionPercent = 0;
    } else {
      positionPercent = maxScroll > 0 ? (scrollLeft / maxScroll * 100) : 0;
    }

    // 更新界面状态
    this.setData({
      currentPage,
      indicatorPosition: `${positionPercent}%`,
      indicatorWidth: this.data.pages.length === 1 ? '100%' : '20%'
    });
  },


  /**
   * 生命周期函数 - 页面显示
   */
  onShow: function () {
    this.updateVehicleStatus();       // 启动状态更新
    this.initialiImageBaseConversion() // 图片转换
    this.initToConfigureCache()
  },
  // 初始化获取缓存内容
  initToConfigureCache() {
    wx.getStorage({
      key: 'controlItems',
      success: (res) => {
        if (res?.data) {
          console.log('缓存数据:', res.data);

          // 创建新数组，将res.data插入到第三位
          const updatedItems = [
            ...detaltAllControlItems.slice(0, 2),  // 取前两项
            ...res?.data,                       // 插入缓存数据
            ...detaltAllControlItems.slice(2)     // 插入剩余项
          ];

          console.log('合并后的数组:', updatedItems);

          // 如果需要更新到data中
          this.setData({ allControlItems: updatedItems }, () => {
            this.splitControlItems(); // 初始化控制项分页
          });
        }
      },
      fail: (err) => {
        console.log('获取缓存失败:', err);
        // 如果没有缓存数据，使用初始数据
        this.setData({ allControlItems: detaltAllControlItems }, () => {
          this.splitControlItems(); // 初始化控制项分页
        });
      }
    });
  },
  /**
   * 更新车辆状态信息
   */
  updateVehicleStatus: function () {
    setTimeout(() => {
      this.setData({
        batteryLevel: Math.max(0, Math.min(100,
          this.data.batteryLevel + (Math.random() > 0.5 ? 1 : -1)))
      });
      this.updateVehicleStatus();  // 递归调用实现持续更新
    }, 5000);
  }
});