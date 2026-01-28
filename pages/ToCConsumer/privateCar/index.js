import { getInstructions, getOutputConfig, getControlItems, getParseHexDataObject, getInstructionMap } from 'z-utility';
const {
  u_navlist20
} = require('../../../utils/request/home')
const {
  byGet,
  byPost,
  byPostJson,
  isLogin
} = require('../../../utils/request/http')
const {
  u_carList,
  u_sendInfo,
  u_uploadLog
} = require('../../../utils/request/car')
const bleKeyManager = require('../../../utils/BleKeyFun-utils-single.js');  // 蓝牙密钥管理
const appUtil = require('../../../utils/app-util.js');               // 应用工具
const {
  u_getCarBluetoothKeyByCode
} = require('../../../utils/request/order')

Page({
  data: {
    g_screenTotalHeight: '',//屏幕总高度
    g_tabBarHeight: 80,    // 底部tabbar高度
    g_height_from_head: '',//手机状态栏高度
    g_head_height: '',//自定义导航高度
    g_capsule_distance_to_the_right: '',//胶囊按钮右侧边缘的距离
    topHeight: '',          // 核心内容区域上部固定高度（可自定义）
    bottomHeight: 90,       // 核心内容区域下部固定高度（可自定义）

    // 开锁 关锁 特殊情况数值
    unlockRange: 50,   // 开锁范围（0-100）
    lockRange: 60,   // 关锁范围（0-100）
    myPosition: 60,    // 人物位置
    unlockThumbStyle: '',//开锁范围位置
    lockThumbStyle: '',//关锁范围位置
    myPositionStyle: 'left: 30%',//我的位置


    // 蓝牙通信相关
    dc: '',                                      // 设备标识
    data: '',                                    // 输入数据
    msg: '',                                     // 消息日志
    deviceIDC: "932505100228",          // 默认设备ID
    orgKey: [0x33, 0x47, 0x01, 0x82, 0x34, 0x33], // 原始密钥
    isOwner: false,                              // 所有者标识
    connectionState: "未连接",                   // 连接状态
    connectionID: "",                            // 连接ID
    connectionDisplay: "未连接",                 // 连接显示文本

    // 数据解析相关
    scrollTo: "hiddenview",                      // 滚动位置1
    parseLen: 0,                                 // 解析数据长度
    parsedData: {},                              // 解析后的数据


    // 定时器相关
    pageInterval: 0,                              // 状态检查定时器
    netWork: false,
    controlItems: getControlItems(),//控制按钮
    controlItemspanel: [],//控制按钮面板
    logs: [],//报文日志
    deviceInfo: {},//设备信息
    // 底部tabbar高度
    tabBarHeight: 80,
    tabList: [],
    // 当前选中的底部tabbar索引
    currentTab: 1,
    // 原始链接
    c_link: 'https://k1sw.wiselink.net.cn/',
    // 设置弹窗
    modalisShow: false,
    // 更多钥匙功能标志
    key_settings: false,
    // 更多功能标志
    all_settings: false,
    keyInstructions: getInstructions(),//指令集合
    key_out_put: getOutputConfig(),//输出方式集合

    // 存储定时器ID（用于页面卸载时清除）
    checkTimer: null,
    fold_up: false,
    fold_lower: false
  },
  handleFoldUp(evt) {
    const { type, state } = evt?.currentTarget?.dataset || {};
    const typeToKey = {
      up: 'fold_up',
      lower: 'fold_lower'
    };
    if (type && typeToKey[type]) {
      const newState = !state;
      this.setData({
        [typeToKey[type]]: newState
      }, () => {
        wx.setStorageSync(typeToKey[type], newState);
      });
    }
  },
  // 转十六进制
  initToTwoHex(num) {
    return num.toString(16).padStart(2, '0').toUpperCase();
  },
  // DIY恢复出厂设置
  handleRestoreSettings() {
    // 统一定义函数内的常量，避免重复声明
    const CONST = {
      // 敏感值配置
      DEFAULT_UNLOCK_SENSITIVITY: 50, // 默认开锁敏感值
      DEFAULT_LOCK_SENSITIVITY: 70,   // 默认关锁敏感值
      CMD_SET_SENSITIVITY: 0x11,      // 设置敏感值指令码
      // 状态与路径
      LOGIN_PAGE: '/pages/system/managerLoginView/loginView',
      CONNECTION_STATE_UNCONNECTED: '未连接',
      PAIR_STATUS_UNPAIRED: '未配对',
      // 提示文本
      TOAST_BLUETOOTH_UNCONNECTED: '请等待蓝牙连接后重试',
      TOAST_SET_SUCCESS: '设置成功',
      MODAL_TITLE: '温馨提示',
      MODAL_CONTENT: '关锁敏感值不得低于开锁敏感值，使用默认关锁值前，需先将开锁敏感值设为默认值。',
      // 错误日志
      ERROR_MSG_UNLOCK: '设置开锁敏感值默认值失败：',
      ERROR_MSG_LOCK: '设置关锁敏感值默认值失败：'
    };

    wx.showModal({
      title: '确认重置',
      content: '是否将开关锁敏感值恢复到出厂设置？',
      confirmText: '确认',
      success: (res) => {
        if (res?.confirm) {
          const checkLogin = () => {
            if (!isLogin()) {
              wx.navigateTo({ url: CONST.LOGIN_PAGE });
              return false;
            }
            return true;
          };

          const checkBluetooth = () => {
            if (this.data.connectionState === CONST.CONNECTION_STATE_UNCONNECTED) {
              wx.showToast({ title: CONST.TOAST_BLUETOOTH_UNCONNECTED, icon: 'none' });
              return false;
            }
            return true;
          };

          const checkPair = (parsedData) => {
            const { inductionMode = false, pairStatus = CONST.PAIR_STATUS_UNPAIRED } = parsedData || {};
            if (!inductionMode && pairStatus === CONST.PAIR_STATUS_UNPAIRED) {
              this.btnPair();
              return false;
            }
            return true;
          };

          const setSensitivity = (sensitivity, type, errorMsg) => {
            try {
              this.btnCmdSend(CONST.CMD_SET_SENSITIVITY, type, this.initToTwoHex(sensitivity));
              wx.showToast({ title: CONST.TOAST_SET_SUCCESS, icon: 'none', duration: 1500 });
            } catch (e) {
              console.error(errorMsg, e);
            }
          };

          if (!checkLogin() || !checkBluetooth()) return;
          const parsedData = this.data.parsedData || {};
          if (!checkPair(parsedData)) return;
          setSensitivity(CONST.DEFAULT_LOCK_SENSITIVITY, 0, CONST.ERROR_MSG_LOCK);
          setSensitivity(CONST.DEFAULT_UNLOCK_SENSITIVITY, 1, CONST.ERROR_MSG_UNLOCK);
        }
      }
    });

  },


  // 跳转登录页面
  handleOnExistingAccountTap() {
    (0, wx.navigateTo)({ url: '/pages/system/managerLoginView/loginView' })
  },
  // 切换底部导航
  handleSwitchTabNavigation(evt) {
    const { currentTarget: { dataset: { index: idx = null } = {} } = {} } = evt ?? {};
    if (idx === null) return;
    const { tabList = [] } = this.data;
    const { pagePath: targetUrl } = tabList[idx] ?? {};
    if (!targetUrl) return;
    const [currentPage] = getCurrentPages().slice(-1);
    const { route: currentPath } = currentPage ?? {};
    if (!currentPath) return;
    const targetPurePath = targetUrl.split('?')[0];
    console.log(currentPath, targetPurePath);
    currentPath !== targetPurePath && wx.redirectTo({ url: `/${targetUrl}` });
  },
  // 获取底部导航数据
  initBottomDirectory() {
    byGet(this.data.c_link + u_navlist20.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          tabList: response.data.content
        })
      }
    })
  },
  // 配对按钮点击处理
  btnPair() {
    const that = this;
    const deviceInfo = wx.getDeviceInfo();  // 获取设备信息
    if (that.data.connectionState == '已连接') {
      // 判断Android系统
      if (deviceInfo.system.toLowerCase().includes('android')) {
        // 发送配对命令
        that.btnCmdSend(0x22, [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        setTimeout(() => {
          bleKeyManager.makePair();  // 执行配对
        }, 200);
      } else {
        // iOS系统处理流程
        that.btnCmdSend(0x22, [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        setTimeout(() => {
          that.btnCmdSend(0x22, [0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
          setTimeout(() => {
            that.btnEndConnect();  // 结束连接
            const pairInteval = setInterval(() => {
              if (!bleKeyManager.getBLEConnectionState()) {  // 检查连接状态
                clearInterval(pairInteval);  // 清除定时器
                setTimeout(() => {
                  that.btnStartConnect();  // 重新开始连
                }, 500);
              }
            }, 500);
            setTimeout(() => {
              clearInterval(pairInteval);  // 超时清除定时器
            }, 3000);
          }, 200);
        }, 200);
      }
    } else {
      wx.showToast({
        title: '请等待蓝牙初始化',
        icon: 'none'
      })
    }
  },
  // 切换感应模式
  handleToggleSensorMode(e) {
    const { parsedData = {} } = this.data || {};
    const { pairStatus = '未配对' } = parsedData;
    const newFlag = e?.detail?.value ?? false;
    if (pairStatus === '未配对') {
      this.btnPair();
      return;
    }
    const cmdValue = newFlag ? 0x01 : 0x00;
    this.btnCmdSend(0x3a, [cmdValue]);
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
  // 获取当前登录状态
  initLoginStatus() {
    wx.getStorage({
      key: 'userKey', // 替换为你的缓存键值
      success: res => {
        this.setData({
          account: res?.data?.companyName || res?.data?.username
        })
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
      }
    });
  },
  // 初始化钥匙按钮内容
  initContro() {
    this.setData({
      controlItemspanel: this.splitArray(getControlItems(), 4)
    })
  },
  onLoad: function (options) {
    // 获取屏幕数据
    this.initScreenAndSystemInfo()
    this.initBottomDirectory()
    this.initToConfigureCache()//获取缓存内容
    this.handleSystemInfo()
    // 创建定时器
    this.initCheckTimer();
    this.setData({
      options: options
    })
    // 定义需要存入缓存的字段集合
    const cacheFields = {
      title_name: options?.name,
      bgcolor: options?.bgcolor,
      subtitle: options?.subtitle,
      stfontSize: options?.stfontSize
    };
    this.setData(cacheFields, () => {
      wx.setStorageSync('cacheFields', cacheFields);
    });
  },
  initCheckTimer() {
    if (this.data.checkTimer) {
      clearInterval(this.data.checkTimer);
    }
    const timer = setInterval(() => {
      if (this.data.connectionID == '') {
        this.handleStart()
      }
    }, 3000);

    this.setData({ checkTimer: timer });
  },
  onShow: function () {
    this.handleStart()//开始执行链接蓝牙
    this.startConnectionStatusPolling()//启动连接状态轮询


  },
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

  onUnload: function () {
    const that = this
    setTimeout(() => bleKeyManager.releaseBle(), 500);
    clearInterval(that.data.pageInterval);
    clearInterval(this.data.checkTimer);
    clearTimeout(this.slideTimer);
    wx.setKeepScreenOn({ keepScreenOn: false });
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

  auth_encrypt(passwordSource, random) {
    var passwordEncrypt = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (var i = 0; i < 6; i++) {
      passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 0xFF;
    }
    return passwordEncrypt;
  },
  // 去绑定车辆
  handleBindVechi() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    wx.redirectTo({
      url: '/pages/ToCConsumer/listOfPrivateCars/list/index'
    });

  },
  // 跳转到详细设置
  handleSelectJump() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    if (this.data?.bluetoothData?.platenumber) {
      wx.redirectTo({
        url: `/pages/ToCConsumer/listOfPrivateCars/index?sn=${this.data.deviceIDC}&bluetoothKey=${this.data.orgKeyOld}`,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请先绑定车辆',
        confirmText: '立即绑定',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/ToCConsumer/listOfPrivateCars/list/index'
            });
          }
        }
      });
    }
  },

  // 调整安装手册
  handleJumpSc() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    wx.redirectTo({
      url: '/pages/ToCConsumer/listOfPrivateCars/pdf/index?flag=1',
    })
  },

  // 处理蓝牙连接状态：检查设备是否已连接，决定执行连接或重连逻辑
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

  // 发送控制命令
  btnCmdSend: function (type, data, sign) {
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
      case 0x11: //开锁信号值
        this.PackAndSendspecial(type, 6, data, sign); // 发送6字节数据
        break;
      case 0x3b: // 设置 断开蓝牙自动锁车
      case 0x3a: // 设置 感应模式
        const flameoutData = data// 第一个字节为0x01，后面补11个0x00
        this.PackAndSend3a(type, 12, flameoutData); // 发送12字节数据
        break;
      case 0x4D: //设置锁车升窗
        this.PackAndSendspecial04d(data); // 发送6字节数据
        break;
      case 0x63:
        this.PackAndSendspecial063(data); // 发送6字节数据
        break;
    }
  },
  PackAndSendspecial04d(data) {
    const packet = [
      0x24,
      0x4d, 0x01,
      data,
      0x24
    ];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  PackAndSendspecial(type, dataLength, data, sign) {
    const packet = [
      0x24,                     // Header
      0x11, 0x08,               // Type and length
      parseInt(sign, 16) || 0,   // Sign value (fallback to 0)
      data ? 0x01 : 0x00,        // Data flag
      ...Array(6).fill(0x00),    // Padding
      0x24                      // Footer
    ];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
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

  // 数组转ArrayBuffer
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    array.forEach((value, index) => typedArray[index * elementSize] = value);
    return typedArray.buffer;
  },
  // 处理密钥
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
  // 解析报文
  handleAnalysis(evt) {
    // 字典值
    const dictionaries = {
      inductionEnable: '感应功能',
      inductionMode: '感应模式',
      accStatus: false,
      lock: false,
      powerOffRemainTime: 0,
      powerOffRemainTimeDesc: "0分钟",
      inductionCheckTimes: 3,
      autoInductionMode: 1,
      autoInductionModeDesc: "一直有效",
      bleDisconnectLock: true,
      carWashMode: false,
      bleBroadcastMode: 0,
      modeType: 0,
      modeTypeDesc: "外置模式",
      oilCircuitStatus: 0,
      oilCircuitStatusDesc: "油路开",
      lockWindowUp: 1,
      serialBroadcast: "开",
      workMode: 0,
      workModeDesc: "正常模式",
      netCarControl: 0,
      netCarControlDesc: "不可控制",
      inductionLockSignal: 81,
      inductionHandle: false,
      signalValue: 32,
      inductionUnlockSignal: 40,
      voltage: "3.3V",
      electric: "30",
      alwaysPower: false,
      startInductionEnable: "生效",
      remoteInductionEnable: 1,
      keyWorkMode: 1,
      keyAlwaysPower: 0,
      pairStatus: "已配对",
      pairConnectIndex: 1,
      reservedBit3: 0,
      supply: 0
    }
    return evt
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
      content: `${evt}${this.handleAnalysis(JSON.stringify(getParseHexDataObject(this.trimHexData(evt))))}`,
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
  //  数据解析按钮处理
  parseData: function (hexData) {
    const parsedResult = getParseHexDataObject(hexData);
    if (parsedResult) {
      this.setData({ parsedData: parsedResult }, () => {
        // 初始化样式
        // this.updateSliderStyles();
        this.updateMyPositionStyles();
      });
    }
  },

  // 初始化蓝牙连接

  btnStartConnect: function () {
    const that = this
    if (that.data.connectionID == "") {
      bleKeyManager.connectBLE(that.data.deviceIDC,
        function (state) { that.bluetoothStateMonitor(state) },
        function (type, arrayData, hexData, hexTextData) { that.bluetoothDataMonitor(type, arrayData, hexData, hexTextData) }
      )
    }
    else
      appUtil.showModal('已连接蓝牙', false, function (confirm) { });
  },


  // 修剪16进制数据
  trimHexData: function (hexString) {
    if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
      throw new Error('无效的16进制字符串');
    }
    return hexString.slice(4, -2);  // 去除头尾固定字符
  },

  // 断开蓝牙连接
  btnEndConnect() {
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
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    if (!this.data?.bluetoothData?.platenumber) {
      wx.showModal({
        title: '提示',
        content: '请先开通设定再到开通设定-功能设置处完善设置',
        confirmText: '立即开通',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/ToCConsumer/listOfPrivateCars/list/index'
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
            }, 1000)
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
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    wx.redirectTo({
      url: '/pages/ToCConsumer/listOfPrivateCars/setting/index?sign=4',
    })
  },//跳转配置

  /**
   * 获取已连接设备信息
   */
  btnConnected: function () {
    bleKeyManager.connectedDevice();
  },



  // 返回上一页面
  handleBackHome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  onReady() {
    // 获取登录状态
    this.initLoginStatus()
    this.handleUpLower()
  },
  // 页面加载时执行（如 onLoad/onShow 生命周期）
  handleUpLower() {

    try {
      const foldUp = wx.getStorageSync('fold_up');
      const foldLower = wx.getStorageSync('fold_lower');
      const initData = {};
      if (foldUp !== undefined) initData.fold_up = foldUp;
      if (foldLower !== undefined) initData.fold_lower = foldLower;

      this.setData(initData);
    } catch (e) {
      console.error('读取折叠状态缓存失败：', e);
    }
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
        this.setData({ controlItems: result }, () => {
          this.setData({
            controlItemspanel: this.splitArray(result, 4)
          })
        });
      },
      fail: (err) => {
        this.initContro()
      }


    });
  },


  // 更新人物位置样式
  updateMyPositionStyles() {
    const val = this.data.parsedData;
    const { signalValue } = val
    this.setData({
      myPositionStyle: `left: ${signalValue - 10}%;`
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
  async onlockSlide(e) {
    // 声明定时器变量（建议挂载到this上，避免每次函数执行重新创建）
    if (!this.slideTimer) {
      this.slideTimer = null;
    }

    const { data: { parsedData = { pairStatus: '未配对' } } = {} } = this;
    if (parsedData.pairStatus === '未配对') {
      this.btnPair();
      return;
    }
    const { currentTarget: target, touches = [] } = e || {};
    const touch = touches[0];
    if (!target || !touch) return;
    const trackId = target.dataset?.id;
    const validTrackIds = new Set(['lockTrack', 'unlockTrack']);
    if (!validTrackIds.has(trackId)) return;
    const trackInfo = await this.getTrackInfo(trackId);
    if (!trackInfo?.left || !trackInfo?.width) return;
    const touchX = touch.clientX;
    const relativeX = touchX - trackInfo.left;
    console.log(`${trackId} - 判断滑动值`);
    const trackConfig = {
      lockTrack: { maxProgress: 100, cmdParam: 0 },
      unlockTrack: { maxProgress: 100, cmdParam: 1 }
    };
    const { maxProgress, cmdParam } = trackConfig[trackId];
    const progress = Math.max(0, Math.min(maxProgress, Math.round((relativeX / trackInfo.width) * maxProgress)));
    const THRESHOLD_CONFIG = {
      unlock: {
        defaultSignal: 100,
        min: 40,
        maxOffset: -10, // 最大阈值 = 感应信号 + 偏移量
      },
      lock: {
        defaultSignal: 40,
        max: 100,
        minOffset: -10, // 最小阈值 = 感应信号 + 偏移量
      },
    };

    const getParsedSignal = (context, trackType) => {
      const { data = {} } = context;
      const { parsedData = {} } = data;
      const config = THRESHOLD_CONFIG[trackType];
      const signalKey = trackType === 'unlock' ? 'inductionLockSignal' : 'inductionUnlockSignal';
      return Number(parsedData[signalKey]) || config.defaultSignal;
    };

    const calculateValidProgress = (progress, trackType) => {
      const config = THRESHOLD_CONFIG[trackType];
      const signal = getParsedSignal(this, trackType);
      const thresholds = trackType === 'unlock'
        ? { min: config.min, max: signal + config.maxOffset }
        : { min: signal + config.minOffset, max: config.max };
      thresholds.min = Math.max(0, thresholds.min); // 最小不低于0
      thresholds.max = Math.min(100, thresholds.max); // 最大不超过255（16进制两位上限）
      if (thresholds.min > thresholds.max) thresholds.min = thresholds.max; // 避免范围倒置
      const validProgress = Math.max(thresholds.min, Math.min(thresholds.max, progress));
      return { validProgress, ...thresholds };
    };
    const showThresholdTip = (progress, thresholds, trackType) => {
      const typeText = trackType === 'unlock' ? '开锁' : '锁定';
      let tipText;

      if (progress < thresholds.min) {
        tipText = `${typeText}进度不能小于${thresholds.min}，已自动修正为${thresholds.min}`;
      } else if (progress > thresholds.max) {
        tipText = `${typeText}进度不能大于${thresholds.max}，已自动修正为${thresholds.max}`;
      }

      if (tipText) {
        if (typeof wx?.showToast === 'function') {
          wx.showToast({
            title: tipText,
            icon: 'none',
            duration: 1500,
          });
        } else {
          console.warn('[提示]', tipText); // 降级日志提示
        }
      }
    };
    const toTwoHex = (num) => {
      return num.toString(16).padStart(2, '0').toUpperCase();
    };

    if (['unlockTrack', 'lockTrack'].includes(trackId)) {
      const trackType = trackId.replace('Track', ''); // 提取类型：unlock/lock
      const progressNum = Number(progress) || 0; // 确保进度是数字，默认0
      const { validProgress, min, max } = calculateValidProgress(progressNum, trackType);
      if (progressNum < min || progressNum > max) {
        showThresholdTip(progressNum, { min, max }, trackType);
      }
      console.log(trackId, trackType)
      if (trackType == 'lock') {//关锁
        this.setData({
          lockThumbStyle: validProgress,
          lockRange: (validProgress - 10),
        });
      }
      if (trackType == 'unlock') {
        this.setData({
          unlockThumbStyle: validProgress,
          unlockRange: (validProgress || 50),
        });
      }
      const hexProgress = toTwoHex(validProgress);
      clearTimeout(this.slideTimer);
      this.slideTimer = setTimeout(() => {
        this.btnCmdSend(0x11, cmdParam, hexProgress);
        console.log(`滑动停止3秒后，执行发送指令：0x11, ${cmdParam}, ${hexProgress}`);
      }, 1000); // 3000毫秒 = 3秒
    }
  },
  // 更多设置弹窗
  /**
 * 处理更多设置点击事件
 * @param {Event} evt - 点击事件对象
 */
  handleMoreSettings(evt) {
    const { currentTarget = {} } = evt || {};
    const { dataset = {} } = currentTarget;
    const key = dataset.key;
    this.setData({
      modalisShow: true,
      key_settings: key == 'key_settings',
      all_settings: key == 'all_settings'
    });
  },
  // 关闭弹出窗
  handleMaskTap() {
    const resetSettings = {
      modalisShow: false,
      key_settings: false,
      all_settings: false
    };
    this.setData(resetSettings);
  },
  // 设置 蓝牙断开自动断开锁车
  handleToBreakOff(e) {
    const isEnabled = Boolean(e?.detail?.value);
    this.btnCmdSend(0x3b, [isEnabled ? 0x01 : 0x00]);
  },
  // 锁车自动升窗
  handleAutoCloseTheWindow(e) {
    const isEnabled = Boolean(e?.detail?.value);
    this.btnCmdSend(0x4D, [isEnabled ? 0x01 : 0x00]);
  },
  // 输出方式
  handleOutputMethod(evt) {
    const { index, item: info } = evt?.currentTarget?.dataset || {};
    const value = evt?.detail?.value;

    // 参数校验
    if (index === undefined || !info || value === undefined) return;

    // 获取选中项
    const selectedOutput = this.data.key_out_put?.[index]?.[Number(value)];
    if (!selectedOutput?.name) return;

    // 查找需要更新的项
    const { keyInstructions } = this.data;
    const updateIndex = keyInstructions.findIndex(item => item?.id === info.id);
    if (updateIndex === -1) return;

    // 更新数据
    this.setData({
      [`keyInstructions[${updateIndex}].useType`]: selectedOutput.name,
      [`keyInstructions[${updateIndex}].useTypeId`]: selectedOutput.id
    }, () => {
      const updatedItem = keyInstructions[updateIndex];
      if (updatedItem?.useTypeId) {
        this.handleInstructions(updatedItem)
      }
    });
  },
  // 快捷设置按键
  handleInstructions(evt) {
    const { id, useTypeId } = evt;
    const sendCommand = (cmd, data) => {
      this.PackAndSendSet(cmd, data);
    };
    const instructionMap = getInstructionMap(sendCommand)
    const idActions = instructionMap[id];
    console.log(idActions)
    if (!idActions) return; // 无效 id
    const action = idActions[useTypeId];
    if (action) {
      action();
    }
  },
  // 处理快捷设置按键命令
  PackAndSendSet(type, data) {
    const packet = [
      0x24,
      type,
      ...data,
      ...Array(12 - data.length).fill(0x00),
      0x24
    ];
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  splitArray(arr, n = 4) {
    const filteredArr = arr.filter(item => item.enabled);
    const result = [];
    for (let i = 0; i < filteredArr.length; i += n) {
      result.push(filteredArr.slice(i, i + n));
    }
    return result;
  },
  //新增或减少配置
  handleToggleControl(evt) {
    const { index } = evt.currentTarget?.dataset || {};
    const { value } = evt.detail || {};
    const { controlItems } = this.data;
    if (index == null || value == null || !controlItems?.[index]) {
      return;
    }
    const updatedItems = controlItems.map((item, i) =>
      i === index ? { ...item, enabled: Boolean(value) } : item
    );
    this.setData({ controlItems: updatedItems }, () => {
      this.setData({
        controlItemspanel: this.splitArray(updatedItems, 4)
      })
    });
    wx.setStorage({ key: 'controlItems', data: updatedItems });
  },

  // 调整安装手册
  handleJumpSc() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    wx.redirectTo({
      url: '/pages/ToCConsumer/listOfPrivateCars/pdf/index?flag=1',
    })
  },
});