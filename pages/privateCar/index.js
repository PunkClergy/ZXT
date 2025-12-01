const {
  byGet,
  byPost,
  byPostJson,
  isLogin
} = require('../../utils/request/http')
const {
  u_getCarBluetoothKeyByCode
} = require('../../utils/request/order')
const {
  u_carList,
  u_sendInfo,
  u_uploadLog
} = require('../../utils/request/car')
const bleKeyManager = require('../../utils/BleKeyFun-utils-single.js');  // 蓝牙密钥管理
const appUtil = require('../../utils/app-util.js');               // 应用工具
Page({
  data: {
    g_screenTotalHeight: '',//屏幕总高度
    g_tabBarHeight: 80,    // 底部tabbar高度
    g_height_from_head: '',//手机状态栏高度
    g_head_height: '',//自定义导航高度
    g_capsule_distance_to_the_right: '',//胶囊按钮右侧边缘的距离
    topHeight: '',          // 核心内容区域上部固定高度（可自定义）
    bottomHeight: 90,       // 核心内容区域下部固定高度（可自定义）

    // 核心数值
    unlockRange: 50,   // 开锁范围（0-100）
    myPosition: 60,    // 人物位置

    // 样式变量
    unlockThumbStyle: '',//开锁范围位置
    myPositionStyle: '',//我的位置
  },


  // 初始化屏幕及系统头部相关信息
  initScreenAndSystemInfo() {
    const { screenHeight = 0, statusBarHeight = 0, screenWidth = 0 } = wx.getWindowInfo() || {};
    const { height: h = 0, top: t = 0, right: r = 0 } = wx.getMenuButtonBoundingClientRect() || {};
    if (!screenHeight || !statusBarHeight || !screenWidth || !h || !t || !r) return;
    console.log(statusBarHeight, statusBarHeight + h + (t - statusBarHeight) * 2)
    this.setData({
      g_height_from_head: statusBarHeight,//手机状态栏高度
      g_head_height: statusBarHeight + h + (t - statusBarHeight) * 2,//自定义导航高度
      g_capsule_distance_to_the_right: screenWidth - r,//胶囊按钮右侧边缘的距离
      g_screenTotalHeight: screenHeight,//屏幕总高度
    });
  },
  // 初始化获取缓存内容-手动操作区显示按钮
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
  onLoad: function (options) {
    this.initToConfigureCache()//获取缓存内容
    this.handleSystemInfo()
    this.setData({
      options: options
    })
    // 获取屏幕数据
    this.initScreenAndSystemInfo()
    // 初始化样式
    this.updateSliderStyles();
    this.updateMyPositionStyles();
  },

  onShow: function () {
    this.handleStart()//开始执行链接蓝牙
    this.startConnectionStatusPolling()//启动连接状态轮询
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onReady() {
  },


  // 蓝牙连接处理
  handleStart() {
    const that = this;
    const options = this.data.options;

    // 统一处理数据的函数
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

    // 统一请求蓝牙数据的函数
    const fetchBluetoothData = (code) => {
      byGet('https://k1sw.wiselink.net.cn/' + u_getCarBluetoothKeyByCode.URL, { code })
        .then(response => {
          if (!response?.data?.content) return;

          that.setData({
            netWork: true,
            code: code
          });
          handleData(response.data.content);
        })
        .catch(err => {
          console.error('获取蓝牙数据失败:', err);
        });
    };

    // 1. 优先处理URL参数
    if (options?.scene) {
      console.log('处理URL参数:', options.scene);
      fetchBluetoothData(options.scene);

      // 同时将URL参数存入缓存，便于后续使用
      wx.setStorage({
        key: 'scene',
        data: options.scene
      });
    }
    // 2. URL参数不存在时处理缓存参数
    else {
      wx.getStorage({
        key: 'scene',
        success: res => {
          console.log('处理缓存参数:', res.data);
          fetchBluetoothData(res.data);
        },
        fail: () => {
          wx.getStorage({
            key: 'bluetoothData',
            success: evt_response => {
              handleData(evt_response.data);
            },
            // 3. 缓存也不存在时处理车辆列表数据
            fail: () => {
              console.log('缓存不存在，处理车辆列表数据');
              const param = { [u_carList.page]: 1 };
              byGet('https://k1sw.wiselink.net.cn/' + u_carList.URL, param)
                .then(response => {
                  if (response.statusCode === 200 && response?.data?.content?.[0]) {
                    const firstCar = response.data.content[0];
                    wx.setStorageSync('bluetoothData', firstCar);
                    handleData(firstCar);
                  }
                })
                .catch(err => {
                  console.error('获取车辆列表失败:', err);
                });
            }
          })

        }
      });
    }
  },
  // 启动连接状态轮询
  startConnectionStatusPolling() {
    if (this.pageInterval) return;
    this.pageInterval = setInterval(() => {
      const isConnected = bleKeyManager.getBLEConnectionState();
      const connectionID = isConnected ? bleKeyManager.getBLEConnectionID() : '';
      const displayText = isConnected ? connectionID : '未连接';
      const firmware = isConnected ? this.data.firmware : '';
      this.setData({
        connectionState: isConnected ? '已连接' : '未连接',
        connectionID,
        connectionDisplay: displayText,
        firmware
      });
    }, 200);
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

  handleBule() {
    bleKeyManager.isDeviceConnected(this.data.deviceIDC, (status, param) => {
      if (status) {
        //设备已连接，执行已连接逻辑
        this.btnStartConnectConnected();
      } else {
        // 设备未连接，执行连接逻辑;
        this.btnStartConnect();
      }
    });
  },
  // 设备已连接，执行已连接逻辑
  btnStartConnectConnected() {
    if (this.data.connectionID == "") {
      bleKeyManager.connectBLEConnected(
        this.data.deviceIDC,
        (state) => { this.bluetoothStateMonitor(state); },
        (type, arrayData, hexData, hexTextData) => { this.bluetoothDataMonitor(type, arrayData, hexData, hexTextData); }
      );
    } else {
      appUtil.showModal('已连接蓝牙', false, (confirm) => { });
    }
  },
  // 蓝牙状态执行对应操作
  bluetoothStateMonitor: function (state) {
    if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
      //显示加载框
      //appUtil.showLoading('加载中...');
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
      //异常取消加载框
      appUtil.hideLoading();
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
      //蓝牙不可用
      appUtil.showModal('请打开蓝牙', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
      //没有扫描到设备信息
      appUtil.showModal('没有发现设备', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
      //连接失败
      //appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
      //不支持ble
      appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
      //发送失败
      appUtil.showModal('数据发送失败', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
      //无响应
      appUtil.showModal('设备超时无响应', false, function (confirm) { });
    } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS == state) {
      appUtil.hideLoading();
    }
  },
  // 解析数据+验证合法性
  bluetoothDataMonitor: function (type, arrayData, hexData, hexTextData) {
    const dataStr = hexTextData || '';
    if (type === 0) {
      this.btnCmdSend(0x10, arrayData);
      setTimeout(() => {
        this.PackAndSend(0x10, 8, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      }, 1000);
    }
    this.parseData(this.trimHexData(dataStr));
    this.handleLoggerapi(dataStr)
    const newMsg = this.data.msg + `receive: type:${type}, data:${dataStr}\r\n`;
    const scrollTarget = "hiddenview";
    this.setData({
      msg: newMsg,
      scrollTo: scrollTarget
    });
  },
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
  auth_encrypt: function (passwordSource, random) {
    var passwordEncrypt = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (var i = 0; i < 6; i++) {
      passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 0xFF;
    }
    return passwordEncrypt;
  },
  PackAndSend: function (type, len, data) {
    // 数据包格式: 起始符(0x24) + 类型 + 长度 + 数据 + 结束符(0x24)
    var packet = [0x24, type, len, ...data, 0x24];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    array.forEach((value, index) => typedArray[index * elementSize] = value);
    return typedArray.buffer;
  },
  trimHexData: function (hexString) {
    if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
      throw new Error('无效的16进制字符串');
    }
    return hexString.slice(4, -2);  // 去除头尾固定字符
  },
  parseData: function (hexData) {
    const parsedResult = this.parseHexDataObject(hexData);
    if (parsedResult) {
      this.setData({ parsedData: parsedResult });
    }
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
    console.log(bytes, '7777777')
    const resultObject = {}
    resultObject.lock = bytes[2] === 1 ? true : false;//锁状态
    resultObject.voltage = (bytes[12] / 10).toFixed(1);//电池剩余电压计算
    resultObject.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(1)));//电池剩余电量计算图片
    resultObject.supply = bytes[3];
    resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式';//执行模式
    console.log(resultObject, '6666666')
    return resultObject;
  },
  // 转换电池剩余电量
  initVoltage(dy) {
    const thresholds = [4.0, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1];
    const scores = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const index = thresholds.findIndex(threshold => dy >= threshold);
    return index !== -1 ? scores[index] : 0;
  },
  // 上传报文 
  handleLoggerapi(evt) {
    const MAX_LOGS_BEFORE_UPLOAD = 10;
    const UPLOAD_LOG_URL = 'https://k1sw.wiselink.net.cn/' + u_uploadLog.URL;
    const { deviceInfo, deviceIDC, logs: currentLogs } = this.data;
    const userId = getApp()?.data?.userInfo?.id;
    const d = new Date();
    const fmt = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');

    // 构造当前日志项
    const newLogEntry = {
      userId,
      sn: deviceIDC,
      mobileinfo: `${deviceInfo?.brand || ''} ${deviceInfo?.model || ''} ${deviceInfo?.platform || ''} ${deviceInfo?.system || ''}`,
      content: `${evt}${JSON.stringify(this.parseHexDataObject(this.trimHexData(evt)))}`,
      logdate: fmt
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
  // 剩余电量处转换
  getBatteryLevel(voltage) {
    this.getBatteryImage(voltage);
    const thresholds = [90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
    const values = ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10'];
    const index = thresholds.findIndex(threshold => voltage > threshold);
    return index !== -1 ? values[index] : '1';
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


  // 更新滑块和填充层样式（核心）
  updateSliderStyles() {
    const val = this.data.unlockRange;
    this.setData({
      // 滑块位置：与填充层宽度同步
      unlockThumbStyle: `left: ${val - 6}%;`
    });
  },

  // 更新人物位置样式
  updateMyPositionStyles() {
    this.setData({
      myPositionStyle: `left: 30%;`
    });
  },

  // 获取轨道尺寸（用于计算滑动位置）
  getTrackInfo(trackId) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${trackId}`).boundingClientRect();
      query.exec((res) => {
        resolve(res?.[0] ? { width: res[0].width, left: res[0].left } : null);
      });
    });
  },

  // 滑块拖动事件
  async onUnlockSlide(e) {
    const trackInfo = await this.getTrackInfo('unlockTrack');
    if (!trackInfo) return;
    // 计算触摸点相对轨道的百分比
    const touchX = e.touches[0].clientX;
    const relativeX = touchX - trackInfo.left;
    let val = Math.round((relativeX / trackInfo.width) * 100);

    // 限制范围 0-100
    val = Math.max(0, Math.min(100, val));

    // 更新数值并刷新样式
    this.setData({ unlockRange: val }, () => {
      this.updateSliderStyles();
    });
  },

});