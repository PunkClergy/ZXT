// 导入工具模块
const {
  _handleWindowInfo,  // 窗口信息处理工具
  _handleDeviceInfo   // 设备信息处理工具
} = require('../../../utils/public').default;
const appUtil = require('../../../utils/app-util.js');          // 应用工具
const bleKeyManager = require('../../../utils/BleKeyFun-utils.js');  // 蓝牙钥匙功能工具
const byteUtil = require('../../../utils/byte-util.js');        // 字节工具

// 控制项常量数组（新增熄火选项）
const CONTROL_ITEMS = [
  { id: 3, name: '尾箱', enabled: false, icon: 'https://k3a.wiselink.net.cn/img/app/blue/box_off.png', evt: 'handleOpenTrunk' },
  { id: 4, name: '寻车', enabled: false, icon: 'https://k3a.wiselink.net.cn/img/app/blue/search_off.png', evt: 'handleFindCar' },
];

// 标题映射对象
const TITLE_MAP = {
  1: '感应设置',        // 类型1对应标题
  3: '车型指令配置',    // 类型3对应标题
  4: '个性配置',       // 类型4对应标题
  5: '车辆转移',       // 类型5对应标题
  6: '编辑车辆',       // 类型6对应标题
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
    devices: [],       // 蓝牙设备列表
    chs: [],           // 蓝牙特征值列表
    controlItems: CONTROL_ITEMS, // 控制项列表
    pageInterval: 0,   // 页面定时器ID
    connectionID: "",  // 蓝牙连接ID
    deviceIDC: "51CarKey932505100319",  // 默认设备ID
    notificationEnabled: false
  },

  // 页面加载生命周期
  onLoad(options) {
    const sign = options?.sign || '';  // 从参数获取sign值
    if (options?.sign === '1') {      // 如果sign为1则处理请求
      this.handleRequest(options);
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
  // 初始化获取缓存内容
  initToConfigureCache() {
    wx.getStorage({
      key: 'controlItems',
      success: (res) => {
        if (res?.data) {
          this.setData({
            controlItems: res?.data || CONTROL_ITEMS
          })
        }
      }
    })
  },
  // 配对按钮点击处理
  btnPair() {
    const that = this;
    const deviceInfo = wx.getDeviceInfo();  // 获取设备信息
    console.log(deviceInfo);  // 打印设备信息

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
                that.btnStartConnect();  // 重新开始连接
              }, 500);
            }
          }, 500);
          setTimeout(() => {
            clearInterval(pairInteval);  // 超时清除定时器
          }, 3000);
        }, 200);
      }, 200);
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
  PackAndSend(type, dataLength, data) {
    const header = [0x24];  // 数据头
    const end = [0x24];     // 数据尾
    // 根据要求的数据长度填充数据，不足补0
    const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0x00)).slice(0, dataLength);
    const packet = [...header, type, ...paddedData, ...end];  // 组合数据包
    this.consoleOut("send:" + byteUtil.buf2hex(packet) + "\r\n");  // 输出日志
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));  // 发送数据
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
  btnCmdSend(type, data) {
    switch (type) {
      case 0x10:  // 认证命令
        const orgKey = [0x33, 0x69, 0x45, 0x22, 0x83, 0x78];  // 原始密钥
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
        const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
        this.PackAndSend(type, 12, flameoutData); // 发送12字节数据
        break;
      case 0x22: // 配对命令
        this.PackAndSend(type, 8, data); // 发送8字节数据
        break;
      default:
        break;
    }
  },

  // 开始蓝牙连接
  btnStartConnect() {
    const that = this;
    console.log(that.data.connectionID);  // 打印连接ID
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
        // 数据接收回调
        if (type === 0) {  // 认证类型
          this.btnCmdSend(0x10, arrayData);  // 发送认证响应
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
    // 更新通知状态
    this.setData({ notificationEnabled: isEnabled });
  },

  // 处理汽车品牌选择
  handleCarBrand(e) {
    const brand = e.currentTarget.dataset.brand;  // 获取品牌
    console.log("选择的品牌:", brand);  // 打印品牌
  },

  // 结束蓝牙连接
  btnEndConnect() {
  },

  //新增或减少配置
  handleToggleControl(evt) {
    const { index } = evt.currentTarget?.dataset || {};
    const { value } = evt.detail || {};
    const { controlItems } = this.data;

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
    wx.setStorage({ key: 'controlItems', data: updatedItems });
  }
});