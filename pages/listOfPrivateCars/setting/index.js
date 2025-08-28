// 导入工具模块
const {
  _handleWindowInfo,  // 窗口信息处理工具
  _handleDeviceInfo   // 设备信息处理工具
} = require('../../../utils/public').default;
const appUtil = require('../../../utils/app-util.js');          // 应用工具
const bleKeyManager = require('../../../utils/BleKeyFun-utils.js');  // 蓝牙钥匙功能工具
const byteUtil = require('../../../utils/byte-util.js');        // 字节工具

// 控制项常量数组
const CONTROL_ITEMS = [
  { id: 3, name: '尾箱', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/box_off.png', evt: 'handleOpenTrunk' },
  { id: 4, name: '寻车', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleFindCar' },
  { id: 5, name: '升窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handlRaiseTheWindow' },
  { id: 6, name: '降窗', enabled: true, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleLowerTheWindow' },
];
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
// 标题映射对象
const TITLE_MAP = {
  1: '感应设置',        // 类型1对应标题
  4: '个性配置',       // 类型4对应标题
  3: '按键设置',
  default: '设置'      // 默认标题
};
// 图片映射数组
const IMAGE_MAP = [{
  path: '/assets/images/home/car-bg.png',  // 图片路径
  key: 's_background_picture_of_the_front_page'  // 对应的data键名
}];

// 页面定义
Page({
  // 页面初始数据
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,  // 屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0,    // 屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform === 'ios' ? 49 : 44, // 导航栏高度(iOS和Android不同)
    sign: '',          // 页面标识
    chs: [],           // 蓝牙特征值列表
    controlItems: CONTROL_ITEMS, // 控制项列表
    pageInterval: 0,   // 页面定时器ID
    connectionID: "",  // 蓝牙连接ID
    deviceIDC: "",  // 默认设备ID
    orgKey: [], // 原始密钥
    Radiochecked: 0,//手动和感应模式切换
    distance: false,//显示自动校准模块
    bigRadius: 60,      // 大圈默认半径（45-90）
    smallRadius: 40,     // 小圈默认半径（40-85）
    signalCache: [],//信号值集合
    keyInstructions: _INSTRUCTIONS,//指令集合
    instruction_type: 0,//是否展开开始设置
    key_out_put: _OUTPUT,//输出方式集合
  },

  // 页面加载生命周期
  onLoad(options) {
    const sign = options?.sign || '';  // 从参数获取sign值
    if (options?.sign === '1' || options?.sign == '3' || options?.sign == '5') {      // 如果sign为1则处理请求
      this.setData({
        deviceIDC: options?.deviceIDC,  // 默认设备ID
        orgKey: this.keyToHexArray(options?.orgKey)
      }, () => {
        this.handleRequest(options);
      })
    }
    // 设置页面数据
    this.setData({
      sign,  // 设置sign值
      headerTitle: this.getHeaderTitle(sign)  // 设置标题
    });

  },

  // 页面显示生命周期
  onShow() {
    this.initialiImageBaseConversion();  // 初始化图片转换
    this.initToConfigureCache()
  },

  // 页面卸载生命周期
  onUnload() {
    console.log("debug page unload");  // 调试日志
    setTimeout(() => {
      bleKeyManager.releaseBle();  // 释放蓝牙资源
    }, 500);
    clearInterval(this.data.pageInterval);  // 清除定时器
    wx.setKeepScreenOn({
      keepScreenOn: false  // 关闭屏幕常亮
    });
  },

  // 数据处理
  keyToHexArray(key) {
    return key.match(/.{1,2}/g).map(byte => "0x" + byte);
  },

  // 是否开启距离校准
  handleDistance() {
    console.log(this.data?.parsedData)
    if (this.data?.parsedData?.unlock > 0) {
      this.setData({
        distance: true
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请先执行蓝牙配对',
      })
    }
  },

  // 更新大圈半径
  updateBigRadius(e) {
    const newBigRadius = e.detail.value;
    this.setData({
      bigRadius: newBigRadius,
      smallRadius: Math.min(this.data.smallRadius, newBigRadius - 5)
    }, () => {
      this.btnCmdSend(0x11, 0, newBigRadius?.toString(16));   // 关锁值
    });
  },

  // 更新小圈半径
  updateSmallRadius(e) {
    this.setData({
      smallRadius: Math.min(e.detail.value, this.data.bigRadius - 5)
    }, () => {
      this.btnCmdSend(0x11, 1, (Math.min(e.detail.value, this.data.bigRadius - 5))?.toString(16));   // 开锁值
    });
  },

  // 初始化获取缓存内容
  initToConfigureCache() {
    wx.getStorage({
      key: 'controlItems',
      success: (res) => {
        const storedData = res?.data || [];
        // 提取 CONTROL_ITEMS 中不存在于 storedData 的项
        const newItems = CONTROL_ITEMS.filter(controlItem =>
          !storedData.some(storedItem => storedItem.id === controlItem.id)
        );
        // 合并数据
        const mergedItems = [...storedData, ...newItems];
        this.setData({ controlItems: mergedItems });
      },
      fail: () => {
        // 如果本地存储不存在，直接使用默认数据
        this.setData({ controlItems: CONTROL_ITEMS });
      }
    });
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

  // 数组转ArrayBuffer
  arrayToArrayBuffer(array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);  // 创建Uint8Array
    array.forEach((item, i) => {
      typedArray[i * elementSize] = item;  // 填充数据
    });
    return typedArray.buffer;  // 返回ArrayBuffer
  },

  // 控制台输出
  consoleOut(e) {
    this.setData({
      consolemsg: this.data.consolemsg + "\r\n" + e,  // 追加消息
      scrollTo2: "hiddenview2",  // 设置滚动位置
    });
  },

  // 处理请求
  handleRequest(options) {
    console.log(options);  // 打印参数
    console.log("debug page load");  // 调试日志
    const that = this;
    that.btnStartConnect();  // 开始蓝牙连接
    // 设置定时器检查连接状态
    that.data.pageInterval = setInterval(() => {
      if (bleKeyManager.getBLEConnectionState()) {  // 已连接状态
        that.setData({
          connectionState: "已连接",
          connectionID: bleKeyManager.getBLEConnectionID(),
          connectionDisplay: that.data.connectionID,
        });
      } else {  // 未连接状态
        that.setData({
          connectionState: "未连接",
          connectionID: "",
          connectionDisplay: "未连接",
        });
      }
    }, 200);
    // 初始化数据
    that.setData({
      msg: "",
      consolemsg: "",
      parseLen: 0,
    });
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  // 打包并发送数据（支持动态数据体长度）
  PackAndSend(type, dataLength, data, sign) {
    console.log(type, dataLength, data, sign)
    const header = [0x24];  // 数据头
    const end = [0x24];     // 数据尾
    // 根据要求的数据长度填充数据，不足补0
    const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0x00)).slice(0, dataLength);
    const packet = dataLength == 8 ? [...header, type, dataLength, ...data, ...end] : [...header, type, ...paddedData, ...end];  // 组合数据包
    this.consoleOut("send:" + byteUtil.buf2hex(packet) + "\r\n");  // 输出日志
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));  // 发送数据
  },
  PackAndSendSet(type, data) {
    const packet = [
      0x24,
      type,
      ...data,
      ...Array(12 - data.length).fill(0x00),
      0x24
    ];
    console.log(packet, Array(12 - data.length).fill(0x00))
    this.consoleOut("send:" + byteUtil.buf2hex(packet) + "\r\n");  // 输出日志
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));  // 发送数据
  },
  // 自动校准数据处理
  PackAndSendspecial(type, dataLength, data, sign) {
    const packet = [
      0x24,                     // Header
      0x11, 0x08,               // Type and length
      parseInt(sign, 16) || 0,   // Sign value (fallback to 0)
      data ? 0x01 : 0x00,        // Data flag
      ...Array(6).fill(0x00),    // Padding
      0x24                      // Footer
    ];
    this.consoleOut(`send: ${byteUtil.buf2hex(packet)}\r\n`);
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  PackAndSendspecial04d(data) {
    const packet = [
      0x24,
      0x4d, 0x01,
      data,
      0x24
    ];
    this.consoleOut(`send: ${byteUtil.buf2hex(packet)}\r\n`);
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },
  PackAndSendspecial063(data) {
    const packet = [
      0x24,
      0x63, 0x01,
      data,
      0x24
    ];
    this.consoleOut(`send: ${byteUtil.buf2hex(packet)}\r\n`);
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
  },

  // 认证加密
  auth_encrypt(passwordSource, random) {
    const passwordEncrypt = new Array(8).fill(0x00);  // 初始化8字节数组
    for (let i = 0; i < 6; i++) {
      // 异或加密算法
      passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 0xFF;
    }
    return passwordEncrypt;
  },

  // 发送命令（区分不同指令的数据体长度）
  btnCmdSend(type, data, sign) {
    console.log(type)
    switch (type) {
      case 0x10:  // 认证命令
        const orgKey = this.data.orgKey
        const retKey = this.auth_encrypt(orgKey, data);  // 加密密钥
        this.PackAndSend(type, 8, retKey);  // 发送8字节认证数据
        break;
      case 0x03: // 开锁命令
      case 0x04: // 锁车命令
      case 0x05: // 尾箱命令
      case 0x06: // 寻车命令
        this.PackAndSend(type, 8, new Array(8).fill(0x00));  // 发送8字节空数据
        break;
      case 0x3b: // 设置 断开蓝牙自动锁车
      case 0x3a: // 设置 感应模式
        const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
        this.PackAndSend(type, 12, flameoutData); // 发送12字节数据
        break;
      case 0x22: // 配对命令
        this.PackAndSend(type, 8, data); // 发送8字节数据
        break;
      case 0x11: //开锁信号值
        this.PackAndSendspecial(type, 6, data, sign); // 发送6字节数据
        break;
      case 0x4D: //设置锁车升窗
        this.PackAndSendspecial04d(data); // 发送6字节数据
        break;
      case 0x63:
        this.PackAndSendspecial063(data); // 发送6字节数据
        break;
      default:
        break;
    }
  },

  // 开始蓝牙连接
  btnStartConnect() {
    const that = this;
    if (!that.data.connectionID) {  // 如果未连接
      bleKeyManager.connectBLE(that.data.deviceIDC, (state) => {
        // 蓝牙状态回调
        if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE === state) {
          // 预处理状态
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR === state) {
          appUtil.hideLoading();  // 隐藏加载框
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE === state) {
          appUtil.showModal('请打开蓝牙', false, () => { });  // 提示打开蓝牙
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND === state) {
          appUtil.showModal('没有发现设备', false, () => { });  // 提示未发现设备
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED === state) {
          // 连接失败
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED === state) {
          appUtil.showModal('您的手机不支持低功耗蓝牙', false, () => { });  // 提示不支持BLE
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED === state) {
          appUtil.showModal('数据发送失败', false, () => { });  // 提示发送失败
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE === state) {
          appUtil.showModal('设备超时无响应', false, () => { });  // 提示超时
        } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS === state) {
          appUtil.hideLoading();  // 连接成功，隐藏加载框
        }
      }, (type, arrayData, hexData, hexTextData) => {
        wx.hideLoading()
        // 数据接收回调
        if (type === 0) {  // 认证类型
          this.btnCmdSend(0x10, arrayData);  // 发送认证响应
        } else {
          that.parseData(that.trimHexData(hexTextData))
        }
        // 更新接收数据
        this.setData({
          msg: this.data.msg + "receive: type:" + type + ",data:" + hexTextData + "\r\n",
          scrollTo: "hiddenview"  // 设置滚动位置
        });
      });
    } else {
      appUtil.showModal('已连接蓝牙', false, () => { });  // 提示已连接
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

  handleCalibration() {
    const that = this
    wx.showModal({
      title: '第一步',
      content: '请参考安装说明书将设备放置在要安装的位置',
      confirmText: '已安装',
      success: (cbRes_1) => {
        if (cbRes_1?.confirm) {
          wx.showModal({
            title: '第二步',
            content: '请关好所有车窗及车门',
            confirmText: '已关闭',
            success: (cbRes_2) => {
              if (cbRes_2?.confirm) {
                wx.showModal({
                  title: '第三步',
                  content: '请移步至离车头直线距离5米处',
                  confirmText: '立即校准',
                  success: (cbRes_3) => {
                    if (cbRes_3?.confirm) {
                      const signalCache = that.data.signalCache
                      const sorted = [...signalCache].sort((a, b) => a - b);
                      const trimmed = sorted.slice(1, -1);
                      const avgA = Math.round(trimmed.reduce((a, b) => a + b) / trimmed.length);
                      this.btnCmdSend(0x11, 1, avgA?.toString(16));//开锁
                      this.btnCmdSend(0x11, 0, (avgA + 10)?.toString(16));//关锁
                    }
                  }
                })
              }
            }
          })
        }

      }
    })
  },

  /**
  * 数据解析按钮处理
  * @param {string} hexData 16进制数据字符串
  */
  parseData: function (hexData) {
    const parsedResult = this.parseHexDataObject(hexData);
    if (parsedResult) {
      const currentData = this.data.parsedData || {};
      const isEqual = JSON.stringify(parsedResult) === JSON.stringify(currentData);
      if (!isEqual) {
        this.setData({ parsedData: parsedResult });
      }
    }
  },

  /**
 * 解析16进制车辆状态数据
 * @param {string} hexString 30字符的16进制字符串
 * @returns {Array|null} 解析结果数组，格式为[{key: string, value: any}]
 */
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
    resultObject.supply = bytes[3];//3v断电剩余时间
    resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式'//感应状态
    resultObject.lock = bytes[8]//关锁信号值
    resultObject.unlock = bytes[11]//开锁信号值
    resultObject.toBreakOff = bytes[6] === 1//蓝牙断开自动锁车
    resultObject.signal = bytes[10]//当前信号值
    resultObject.autoCloseWin = (bytes[7] & 0x10) !== 0//锁车自动关窗
    resultObject.startSense = (bytes[13] & 0x02) !== 0//启动状态蓝牙感应是否生效

    // Update the signal cache
    let signalCache = this.data.signalCache;
    signalCache.push(bytes[10]); // Add new value

    // Keep only the last 10 values
    if (signalCache.length > 10) {
      signalCache = signalCache.slice(-10);
    }

    this.setData({
      bigRadius: bytes[8],      // 大圈默认半径（45-90）
      smallRadius: bytes[11],    // 小圈默认半径（40-85）
      signalCache: signalCache   // Update the cache in data
    })

    return resultObject;
  },

  // 获取标题
  getHeaderTitle(evt) {
    return TITLE_MAP[evt] || TITLE_MAP.default;  // 根据evt返回对应标题
  },

  // 初始化图片转换
  initialiImageBaseConversion() {
    const promises = IMAGE_MAP.map(item =>
      new Promise((resolve) => {
        // 读取图片文件
        wx.getFileSystemManager().readFile({
          filePath: item.path,  // 图片路径
          encoding: 'base64',   // base64编码
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`  // 解析为base64格式
            });
          }
        });
      })
    );

    // 所有图片处理完成后更新数据
    Promise.all(promises)
      .then(results => {
        const dataToUpdate = Object.assign({}, ...results);  // 合并结果
        this.setData(dataToUpdate);  // 更新数据
      });
  },

  // 设置 蓝牙断开自动断开锁车
  handleToBreakOff(e) {
    const isEnabled = Boolean(e?.detail?.value);
    // 发送指定 设置蓝牙断开自动锁车 (0x01: 开, 0x00: 关)
    this.btnCmdSend(0x3b, [isEnabled ? 0x01 : 0x00]);
  },
  handleAutoCloseTheWindow(e) {
    const isEnabled = Boolean(e?.detail?.value);
    // 发送指定 设置蓝牙断开自动锁车 (0x01: 开, 0x00: 关)
    this.btnCmdSend(0x4D, [isEnabled ? 0x01 : 0x00]);
  },
  handleStartSense(e) {
    const isEnabled = Boolean(e?.detail?.value);
    // 发送指定 设置启动状态蓝牙感应是否有效 (0x01: 感应开, 0x00: 感应关关)
    this.btnCmdSend(0x63, [!isEnabled ? 0x01 : 0x00]);
  },

  // 设置 感应模式
  handleRadioChange(e) {
    const isEnabled = e?.detail?.value
    this.btnCmdSend(0x3a, [isEnabled == '1' ? 0x01 : 0x00]);
    // 更新通知状态
    this.setData({ Radiochecked: isEnabled });
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

  // 设置按键指令
  handleKeyCommands(evt) {
    const { id } = evt?.currentTarget?.dataset?.item || {};
    const { instruction_type: currentType } = this.data;
    const newInstructionType = id === currentType ? 0 : id;
    this.setData({
      instruction_type: newInstructionType
    });
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
        1: () => sendCommand(0x33, [0x33, 0x06, 0x01, 0x00, 0x00]) // 短按开锁键 
      },
      2: { // 关锁键
        1: () => sendCommand(0x34, [0x34, 0x06, 0x01, 0x00, 0x00]) // 短按开锁键
      },
      3: { // 寻车键
        1: () => sendCommand(0x36, [0x36, 0x06, 0x01, 0x00, 0x00]), // 短按寻车键
        2: () => sendCommand(0x34, [0x34, 0x06, 0x03, 0x06, 0x00])  // 三按关锁键
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
});