const {
  u_navlist20
} = require('../../utils/request/home')
const {
  byGet,
  byPost,
  byPostJson,
  isLogin
} = require('../../utils/request/http')
const {
  u_carList,
  u_sendInfo,
  u_uploadLog
} = require('../../utils/request/car')
const bleKeyManager = require('../../utils/BleKeyFun-utils-single.js');  // 蓝牙密钥管理
const appUtil = require('../../utils/app-util.js');               // 应用工具
const {
  u_getCarBluetoothKeyByCode
} = require('../../utils/request/order')

// 指令集合
const _INSTRUCTIONS = [
  { id: 1, name: '开锁功能指令配置', useType: '', useTypeId: '', },
  { id: 2, name: '关锁功能指令配置', useType: '', useTypeId: '', },
  { id: 3, name: '寻车功能指令配置', useType: '', useTypeId: '', },
  { id: 4, name: '尾箱功能指令配置', useType: '', useTypeId: '', },
  // { id: 5, name: '左中门功能指令配置', useType: '', useTypeId: '', },
  // { id: 6, name: '右中门功能指令配置', useType: '', useTypeId: '', },
  { id: 7, name: '升窗功能指令配置', useType: '', useTypeId: '', },
  { id: 8, name: '降窗功能指令配置', useType: '', useTypeId: '', },
];
// 输出方式
const _OUTPUT = [
  // 开锁
  [{ id: 1, name: '短按开锁键' },//输出次数1 输出时间500ms 输出间隔0
  { id: 2, name: '短按两次开锁键' },//输出次数2 输出时间500ms 输出间隔500ms
  ],
  // 关锁
  [{ id: 1, name: '短按关锁键' },//输出次数1 输出时间500ms 输出间隔0
  ],
  // 寻车
  [{ id: 1, name: '短按寻车键' },//寻车键：输出次数1 输出时间500ms 输出间隔0; 关锁键:输出次数3 输出时间500 输出间隔1000ms
  { id: 2, name: '短按关锁键' },
  ],
  // 尾箱
  [{ id: 1, name: '短按两次尾箱键' },//输出次数2 输出时间500ms 输出间隔1000ms
  { id: 2, name: '长按三秒尾箱键' },//输出次数1 输出时间3000ms 输出间隔0
  ],
  // // 左中门
  // [{ id: 1, name: '短按左中门键' },//输出次数为1 输出时间为500ms 输出间隔0
  // { id: 2, name: '长按3秒左中门键' },//输出次数为1 输出时间为3000ms 输出间隔0
  // ],
  // // 右中门
  // [{ id: 1, name: '短按右中门键' },//输出次数为1 输出时间为500ms 输出间隔0
  // { id: 2, name: '长按3秒右中门键' },//输出次数为1 输出时间为3000ms 输出间隔0
  // ],
  // 升窗
  [{ id: 1, name: '长按7秒关锁键' },//输出次数为1 输出时间为7000ms 输出间隔0
  ],
  // 降窗
  [{ id: 1, name: '长按7秒开锁键' },//输出次数为1 输出时间为7000ms 输出间隔0
  ]]
// 控制项常量数组
const CONTROL_ITEMS = [
  { id: 1, name: '开锁', enabled: true, icon: 'https://k1sw.wiselink.net.cn/img/app2.0/sjc/unlock@2x.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/unlock_on.png', evt: 'handleUnlock' },
  { id: 2, name: '关锁', enabled: true, icon: 'https://k1sw.wiselink.net.cn/img/app2.0/sjc/lock@2x.png', ative: 'https://k3a.wiselink.net.cn/img/app/blue/lock_on.png', evt: 'handleLock' },
  { id: 3, name: '尾箱', enabled: true, icon: 'https://k1sw.wiselink.net.cn/img/app2.0/sjc/tail_box@2x.png', evt: 'handleOpenTrunk' },
  { id: 4, name: '寻车', enabled: true, icon: 'https://k1sw.wiselink.net.cn/img/app2.0/sjc/seek_car@2x.png', evt: 'handleFindCar' },
  { id: 5, name: '升窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handlRaiseTheWindow' },
  { id: 6, name: '降窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleLowerTheWindow' },
];
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
    unlockThumbStyle: 'left: 44%',//开锁范围位置
    lockThumbStyle: 'left: 54%',//关锁范围位置
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
    voltage_image: '100',                        //剩余电池电量显示图片

    // 定时器相关
    pageInterval: 0,                              // 状态检查定时器
    netWork: false,
    controlItems: CONTROL_ITEMS,

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
    keyInstructions: _INSTRUCTIONS,//指令集合
    key_out_put: _OUTPUT,//输出方式集合
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
    const { inductionMode: oldFlag = false, pairStatus = '未配对' } = parsedData;
    const newFlag = e?.detail?.value ?? false;
    if (!oldFlag && pairStatus === '未配对') {
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
  onLoad: function (options) {
    // 获取屏幕数据
    this.initScreenAndSystemInfo()
    this.initBottomDirectory()
    this.initToConfigureCache()//获取缓存内容
    this.handleSystemInfo()
    this.setData({
      options: options
    })
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
      url: '/pages/listOfPrivateCars/list/index'
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

  // 调整安装手册
  handleJumpSc() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return
    }
    wx.redirectTo({
      url: '/pages/listOfPrivateCars/pdf/index?flag=1',
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
      case 0x3a: // 设置 手动或感应模式
        const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
        this.PackAndSend3a(type, 12, flameoutData); // 发送12字节数据
        break;
    }
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

  //  解析蓝牙十六进制数据为完整的参数对象
  parseHexDataObject(hexString) {
    if (!hexString || hexString.length !== 30) {
      console.error('数据长度不正确，需为24（仅数据体）或32（完整帧）字符');
      return null;
    }

    let dataBodyHex = hexString;
    if (hexString.length === 32) {
      dataBodyHex = hexString.substr(4, 24);
    }

    const bytes = [];
    for (let i = 0; i < dataBodyHex.length; i += 2) {
      bytes.push(parseInt(dataBodyHex.substr(i, 2), 16));
    }

    const result = {};
    result.inductionEnable = bytes[0] === 1;
    result.inductionMode = bytes[0] === 1 ? true : false; // 兼容原有induction字段

    // D[1] ACC状态：0关，1开
    result.accStatus = bytes[1] === 1;

    // D[2] 锁状态：0关，1开（自动开关锁下发标记）
    result.lock = bytes[2] === 1; // 兼容原有lock字段

    // D[3] 3V断电剩余时间：0-255分钟，255=不断电/最大
    result.powerOffRemainTime = bytes[3];
    result.powerOffRemainTimeDesc = bytes[3] === 255 ? '不断电' : `${bytes[3]}分钟`;

    // D[4] 感应检测次数：0-255
    result.inductionCheckTimes = bytes[4];

    // D[5] 自动感应模式：0=操作后失效，1=一直有效，2=操作后失效
    result.autoInductionMode = bytes[5];
    result.autoInductionModeDesc = {
      0: '操作后失效',
      1: '一直有效',
      2: '操作后失效'
    }[bytes[5]] || '未知模式';

    // D[6] 蓝牙断开自动锁车配置：0关，1开
    result.bleDisconnectLock = bytes[6] === 1;

    // D[7] 位域解析（bit0~bit7）
    const d7 = bytes[7];
    result.carWashMode = (d7 & 0x01) === 1; // bit0：洗车模式 0关1开
    result.bleBroadcastMode = (d7 >> 1) & 0x01; // bit1：蓝牙广播模式（对应0x3D）
    result.modeType = (d7 >> 2) & 0x01; // bit2：0外置模式 1内置模式
    result.modeTypeDesc = (d7 >> 2) & 0x01 ? '内置模式' : '外置模式';
    result.oilCircuitStatus = (d7 >> 3) & 0x01; // bit3：油路状态 0开1关
    result.oilCircuitStatusDesc = (d7 >> 3) & 0x01 ? '油路关' : '油路开';
    result.lockWindowUp = (d7 >> 4) & 0x01; // bit4：锁车升窗 0不升1升
    result.serialBroadcast = (d7 >> 5) & 0x01 ? '关' : '开'; // bit5：串口输出广播 0开1关
    result.workMode = (d7 >> 6) & 0x01; // bit6：0正常模式 1网约车模式
    result.workModeDesc = (d7 >> 6) & 0x01 ? '网约车模式' : '正常模式';
    result.netCarControl = (d7 >> 7) & 0x01; // bit7：网约车模式是否可控制 0不可1可
    result.netCarControlDesc = (d7 >> 7) & 0x01 ? '可控制' : '不可控制';

    // D[8] 感应关锁信号值（原感应缓冲值，对应0x11）
    result.inductionLockSignal = bytes[8];

    // D[9] 感应门把手开关：0关1开
    result.inductionHandle = bytes[9] === 1;

    // D[10] 信号值：0-100（绝对值）
    result.signalValue = Math.abs(bytes[10]); // 确保绝对值

    // D[11] 感应开锁信号值（对应0x22）
    result.inductionUnlockSignal = bytes[11];

    // ===================== 扩展参数 D[12]~D[14]（兼容低版本） =====================
    // D[12] 电压值：0-255（120=12.0V），低版本无该位则为undefined
    if (bytes.length >= 13) {
      result.voltage = (bytes[12] / 10).toFixed(1) + 'V'; // 兼容原有voltage字段
      // 电池剩余电量计算（需补充getBatteryLevel和initVoltage方法）
      result.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(1)));
    } else {
      result.voltage = '未知';
      result.electric = 0;
    }

    // D[13] 位域解析（bit0~bit5）
    if (bytes.length >= 14) {
      const d13 = bytes[13];
      result.alwaysPower = (d13 & 0x01) === 1; // bit0：常供电开关 0关1开
      result.startInductionEnable = (d13 >> 1) & 0x01 ? '失效' : '生效'; // bit1：启动状态感应 0生效1失效
      result.remoteInductionEnable = (d13 >> 2) & 0x01; // bit2：遥控感应开关是否有效
      result.keyWorkMode = (d13 >> 3) & 0x01; // bit3：钥匙工作模式
      result.keyAlwaysPower = (d13 >> 4) & 0x01; // bit4：钥匙一直供电 0关1开
      result.pairStatus = (d13 >> 5) & 0x01 ? '未配对' : '已配对'; // bit5：0已配对1未配对（兼容旧固件）
    } else {
      result.alwaysPower = false;
      result.startInductionEnable = '未知';
      result.remoteInductionEnable = false;
      result.keyWorkMode = 0;
      result.keyAlwaysPower = false;
      result.pairStatus = '未知';
    }

    // D[14] 位域解析（bit0~bit2：配对连接序号0-7；bit3：预留）
    if (bytes.length >= 15) {
      const d14 = bytes[14];
      result.pairConnectIndex = d14 & 0x07; // bit0~bit2（0-7）
      result.reservedBit3 = (d14 >> 3) & 0x01; // bit3：预留
    } else {
      result.pairConnectIndex = 0;
      result.reservedBit3 = 0;
    }

    // ===================== 原有兼容字段 =====================
    result.supply = bytes[3]; // 兼容原有supply字段（D[3]断电剩余时间）

    console.log('解析结果:', result);
    return result;
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
  //  数据解析按钮处理
  parseData: function (hexData) {
    const parsedResult = this.parseHexDataObject(hexData);
    if (parsedResult) {
      this.setData({ parsedData: parsedResult }, () => {
        // 初始化样式
        this.updateSliderStyles();
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
      url: '/pages/listOfPrivateCars/setting/index?sign=4',
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
  // 更新滑块和填充层样式（核心）
  updateSliderStyles() {
    const val = this.data.parsedData;
    const { inductionUnlockSignal, inductionLockSignal } = val
    this.setData({
      unlockThumbStyle: `left: ${(inductionUnlockSignal || 50 - 6)}%;`,
      lockThumbStyle: `left: ${(inductionLockSignal || 60 - 6)}%;`,
      unlockRange: inductionUnlockSignal || 50,
      lockRange: inductionLockSignal || 60,
    });
  },

  // 更新人物位置样式
  updateMyPositionStyles() {
    const val = this.data.parsedData;
    const { signalValue } = val
    this.setData({
      myPositionStyle: `left: ${signalValue}%;`
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
    // 先判断是否配对
    const { parsedData = {} } = this.data || {};
    const { pairStatus = '未配对' } = parsedData;
    if (pairStatus == '未配对') {
      this.btnPair();
      return;
    }
    const target = e?.currentTarget;
    const touch = e?.touches?.[0];
    if (!target || !touch) return;
    const trackId = target.dataset?.id;
    if (!['lockTrack', 'unlockTrack'].includes(trackId)) return;
    const trackTypeMap = {
      lockTrack: 'lockTrack',
      unlockTrack: 'unlockTrack'
    };
    const trackInfo = await this.getTrackInfo(trackTypeMap[trackId]);
    if (!trackInfo?.left || !trackInfo?.width) return;
    const touchX = touch.clientX;
    const relativeX = touchX - trackInfo.left;
    const progress = Math.max(0, Math.min(100, Math.round((relativeX / trackInfo.width) * 100)));
    const cmdParamMap = {
      lockTrack: 0,
      unlockTrack: 1
    };
    const cmdParam = cmdParamMap[trackId];
    const hexProgress = progress.toString(16).padStart(2, '0');
    this.btnCmdSend(0x11, cmdParam, hexProgress);
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
    const instructionMap = {
      1: { // 开锁键
        1: () => sendCommand(0x33, [0x33, 0x06, 0x01, 0x00, 0x00]), // 短按开锁键 
        2: () => sendCommand(0x33, [0x33, 0x06, 0x02, 0x06, 0x00]) // 短按两次开锁键 
      },
      2: { // 关锁键
        1: () => sendCommand(0x34, [0x34, 0x06, 0x01, 0x00, 0x00]) // 短按开锁键
      },
      3: { // 寻车键
        1: () => sendCommand(0x36, [0x36, 0x06, 0x01, 0x00, 0x00]), // 短按寻车键
        2: () => sendCommand(0x36, [0x34, 0x06, 0x03, 0x06, 0x00])  // 三按关锁键
      },
      4: { // 尾箱键
        1: () => sendCommand(0x35, [0x35, 0x06, 0x02, 0x06, 0x00]), // 短按两次尾箱键
        2: () => sendCommand(0x35, [0x35, 0x1E, 0x01, 0x00, 0x00])  // 长按3秒尾箱键
      },
      5: { // 左中门
        1: () => sendCommand(0x50, [0x50, 0x06, 0x01, 0x00, 0x00]), // 短按左中门键
        2: () => sendCommand(0x50, [0x50, 0x1E, 0x01, 0x00, 0x00])  // 长按3秒左中门键
      },
      6: { // 右中门
        1: () => sendCommand(0x51, [0x51, 0x06, 0x01, 0x00, 0x00]), // 短按右中门键
        2: () => sendCommand(0x51, [0x51, 0x1E, 0x01, 0x00, 0x00])  // 长按3秒右中门键
      },
      7: { // 升窗
        1: () => sendCommand(0x52, [0x34, 0x46, 0x01, 0x00, 0x00])  // 长按7秒关锁键
      },
      8: { // 降窗
        1: () => sendCommand(0x53, [0x33, 0x46, 0x01, 0x00, 0x00])  // 长按7秒开锁键
      }
    };
    const idActions = instructionMap[id];
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
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));  // 发送数据
  },
  splitArray(arr, n = 4) {
    const result = [];
    for (let i = 0; i < arr.length; i += n) {
      result.push(arr.slice(i, i + n));
    }
    return result;
  },
  //新增或减少配置
  handleToggleControl(evt) {
    const { index } = evt.currentTarget?.dataset || {};
    const { value } = evt.detail || {};
    const { controlItems } = this.data;
    console.log(controlItems)
    // 参数校验
    if (index == null || value == null || !controlItems?.[index]) {
      return;
    }
    // 更新数据（使用不可变更新）
    const updatedItems = controlItems.map((item, i) =>
      i === index ? { ...item, enabled: Boolean(value) } : item
    );
    // 更新视图和缓存
    this.setData({ controlItems: updatedItems });
    console.log(updatedItems)
    wx.setStorage({ key: 'controlItems', data: updatedItems });
  },
});