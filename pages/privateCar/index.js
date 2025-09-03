const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  byGet,
  byPost,
  byPostJson
} = require('../../utils/request/http')
const {
  u_carList,
  u_sendInfo,
  u_uploadLog
} = require('../../utils/request/car')
const bleKeyManager = require('../../utils/BleKeyFun-utils.js');  // 蓝牙密钥管理
const appUtil = require('../../utils/app-util.js');               // 应用工具
const {
  u_getCarBluetoothKeyByCode
} = require('../../utils/request/order')

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
    netWork: false,
    controlItems: [
      { id: 1, name: '开锁', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/unlock_off.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/unlock_on.png', evt: 'handleUnlock' },
      { id: 2, name: '关锁', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/lock_off.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/lock_on.png', evt: 'handleLock' },
      { id: 3, name: '尾箱', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/box_off.png', evt: 'handleOpenTrunk' },
      { id: 4, name: '寻车', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleFindCar' },
      { id: 5, name: '升窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handlRaiseTheWindow' },
      { id: 6, name: '降窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleLowerTheWindow' },
      { id: 7, name: '更多钥匙功能', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/set.png', evt: 'handleToConfigure' },
    ],
    blue_tooth_state: false,//点击蓝牙已连接
    voltage_state: false,//点击电池电量处
    manual_state: false,//点击手动模式文字（现已作废）
    logs: [],//报文日志
    deviceInfo: {},//设备信息
  },
  // 切换感应模式
  toggleSensorMode() {
    const induction = this.data.parsedData.induction;
    const isManualInduction = !induction || induction === '手动模式';
    if (this.data?.bluetoothData?.platenumber) {
      if ((!isManualInduction)) {
        // 此时为感应模式，可直接切换手动模式
        wx.showModal({
          title: '提示',
          content: '确认关闭感应模式?',
          complete: (res) => {
            if (res.confirm) {
              this.btnCmdSend(0x3a, [0x00]);
            }
          }
        })
        return
      } if (this.data.parsedData.induction != '感应模式') {
        wx.showModal({
          title: '提示',
          content: '请到开通设定-功能设置处完善设置',
          complete: (res) => {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/listOfPrivateCars/list/index?tabs=3'
              })
            }
          }
        })
      }
    } else {
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
    }

  },
  // 获取设备信息
  handleSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        const { brand, model, system, platform, screenWidth, screenHeight, pixelRatio, statusBarHeight } = res;
        this.setData({ deviceInfo: { brand, model, system, platform, screenWidth, screenHeight, pixelRatio, statusBarHeight } });
        console.log('设备信息:', this.data.deviceInfo);
      },
      fail: console.error
    });
  },
  /**
   * 生命周期函数 - 页面加载
   * @param {Object} options 页面参数
   */
  onLoad: function (options) {
    this.initToConfigureCache()//获取缓存内容
    this.handleSystemInfo()
    this.setData({
      options: options
    })
  },
  /**
  * 生命周期函数 - 页面显示
  */
  onShow: function () {
    this.updateVehicleStatus();       // 启动状态更新
    this.initialiImageBaseConversion() // 图片转换
    this.handleStart()
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
    const options = this.data.options
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
    if (options?.scene) {
      byGet('https://k1sw.wiselink.net.cn/' + u_getCarBluetoothKeyByCode.URL, {
        code: options.scene
      }).then(response => {
        if (!response?.data?.content) {
          return;
        }
        this.setData({
          netWork: true,
          code: options?.scene
        })
        handleData(response.data.content);
      }).catch(err => {
      });
    } else {
      // 本地存储处理
      wx.getStorage({
        key: 'bluetoothData',
        success(res) {
          handleData(res.data);
        },
        fail(err) {
          const param = {
            [u_carList.page]: 1,
          };
          byGet('https://k1sw.wiselink.net.cn/' + u_carList.URL, param).then(response => {
            if (response.statusCode == 200) {
              console.log(response)
              handleData(response?.data?.content?.[0])
            }
          })
        }
      });
    }
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
  handleBindVechi() {
    wx.redirectTo({
      url: '/pages/listOfPrivateCars/list/index'
    });
  },
  // 跳转到详细设置
  handleSelectJump() {
    if (this.data?.bluetoothData?.platenumber) {
      wx.redirectTo({
        url: `/pages/listOfPrivateCars/index?sn=${this.data.deviceIDC}&bluetoothKey=${this.data.orgKeyOld}`,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请先绑定车辆',
        confirmText: '立即绑定',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/listOfPrivateCars/list/index'
            });
          }
        }
      });
    }
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
  handleJumpSc() {
    wx.redirectTo({
      url: '/pages/listOfPrivateCars/pdf/index?flag=1',
    })
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
      case 0x3a: // 设置 手动或感应模式
        const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
        this.PackAndSend3a(type, 12, flameoutData); // 发送12字节数据
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
  // 打包并发送数据（支持动态数据体长度）
  PackAndSend3a(type, dataLength, data, sign) {
    console.log(type, dataLength, data, sign)
    const header = [0x24];  // 数据头
    const end = [0x24];     // 数据尾
    // 根据要求的数据长度填充数据，不足补0
    const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0x00)).slice(0, dataLength);
    const packet = dataLength == 8 ? [...header, type, dataLength, ...data, ...end] : [...header, type, ...paddedData, ...end];  // 组合数据包
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));  // 发送数据
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
  // 转换电池剩余电量
  initVoltage(dy) {
    const thresholds = [4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1];
    const scores = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const index = thresholds.findIndex(threshold => dy >= threshold);
    return index !== -1 ? scores[index] : 0;
  },
  // 剩余电量显示图片
  getBatteryImage(voltage) {
    const levels = [
      { min: 75, value: '100' },
      { min: 50, value: '75' },
      { min: 25, value: '50' },
      { min: 10, value: '25' }
    ];
    const level = levels.find(item => voltage > item.min) || { value: '0' };
    this.setData({ voltage_image: level.value });
  },
  // 剩余电量处转换
  getBatteryLevel(voltage) {
    this.getBatteryImage(voltage);
    const thresholds = [90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
    const values = ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10'];
    const index = thresholds.findIndex(threshold => voltage > threshold);
    return index !== -1 ? values[index] : '1';
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
    resultObject.voltage = (bytes[12] / 10).toFixed(1);//电池剩余电压计算
    resultObject.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(1)));//电池剩余电量计算图片
    resultObject.supply = bytes[3];
    resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式';//执行模式
    return resultObject;
  },
  // 上传报文 
  handleLoggerapi(evt) {
    const MAX_LOGS_BEFORE_UPLOAD = 10;
    const UPLOAD_LOG_URL = 'https://k1sw.wiselink.net.cn/' + u_uploadLog.URL;
    const { deviceInfo, deviceIDC, logs: currentLogs } = this.data;
    const userId = getApp()?.data?.userInfo?.id;

    // 构造当前日志项
    const newLogEntry = {
      userId,
      sn: deviceIDC,
      mobileinfo: `${deviceInfo?.brand || ''} ${deviceInfo?.model || ''} ${deviceInfo?.platform || ''} ${deviceInfo?.system || ''}`,
      content: `${evt}${JSON.stringify(this.parseHexDataObject(this.trimHexData(evt)))}`,
    };

    // 创建新日志数组（避免直接修改原数组）
    const updatedLogs = [...currentLogs, newLogEntry];
    // 判断是否达到上传阈值
    if (updatedLogs.length >= MAX_LOGS_BEFORE_UPLOAD) {
      byPostJson(
        UPLOAD_LOG_URL,
        updatedLogs,
        (response) => {
          // 上传成功，清空日志
          if (response?.data?.code === 1000) {
            this.setData({
              logs: []
            });
          } else {
            // 上传失败，保留日志（后续可重试）
            this.setData({
              logs: updatedLogs
            });
          }
        },
        (err) => {
          // 网络错误等异常情况，保留日志
          console.warn('日志上传失败，保留本地日志:', err);
          this.setData({
            logs: updatedLogs
          });
        }
      );
    } else {
      // 未达到阈值，仅本地保存
      this.setData({
        logs: updatedLogs
      });
    }
  },
  /**
   * 数据解析按钮处理
   * @param {string} hexData 16进制数据字符串
   */
  parseData: function (hexData) {
    const parsedResult = this.parseHexDataObject(hexData);
    const parsedDataob = this.parseHexData(hexData)
    if (parsedResult) {
      this.setData({ parsedData: parsedResult, parsedDataob: parsedDataob });
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
          that.handleLoggerapi(hexTextData)
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
            this.handleSendInfo(commandCode, code)
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
  // 发送控制命令
  handleSendInfo(commandCode, code) {
    const temp = {
      sn: this.data.deviceIDC,
      controltype: `${commandCode}${code}`,
      electricity: this?.data?.parsedData?.electric || 0
    }
    byPost('https://k1sw.wiselink.net.cn/' + u_sendInfo.URL, temp, function () { });
  },
  handleToConfigure: function () {
    wx.redirectTo({
      url: '/pages/listOfPrivateCars/setting/index?sign=4',
    })
  },//跳转配置

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
  // 初始化获取缓存内容
  initToConfigureCache() {
    const currentItems = this.data.controlItems || [];
    wx.getStorage({
      key: 'controlItems',
      success: (res) => {
        const storageItems = res.data || [];
        const merged = [...currentItems, ...storageItems];
        const uniqueMap = new Map();
        merged.forEach(item => {
          const existing = uniqueMap.get(item.id);

          if (!existing) {
            uniqueMap.set(item.id, item);
          } else {
            if (item.enabled === false) {
              uniqueMap.set(item.id, item);
            }
          }
        });
        const result = Array.from(uniqueMap.values());
        console.log('合并并优先保留 enabled=false 的结果：', result);
        this.setData({ controlItems: result });
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