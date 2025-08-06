const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const vwManager = require('../../../utils/VWFun-utils');
const utils = require('../../../utils/byte-util');
const BluetoothAuth = {
  /**
   * 十六进制字符串转 Uint8Array
   * @param {string} hex - 十六进制字符串（如 'A1B2C3'）
   * @returns {Uint8Array}
   */
  hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  },

  /**
   * Uint8Array 转十六进制字符串
   * @param {Uint8Array} bytes
   * @returns {string} 大写十六进制字符串
   */
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  },

  /**
   * 格式化十六进制字符串：每两个字符加空格
   * @param {string} hexStr - 原始 HEX 字符串（可含空格）
   * @returns {string} 格式化后如 "A1 B2 C3"
   */
  formatHexString(hexStr) {
    const cleanHex = hexStr.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (cleanHex.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须为偶数');
    }
    return cleanHex.match(/.{2}/g).join(' ');
  },

  /**
   * 执行蓝牙认证加密算法：passwordSource ^ random ^ 0xFF
   * @param {Uint8Array} passwordSource - 6字节密钥
   * @param {Uint8Array} random - 6字节随机数
   * @returns {Uint8Array} 加密结果（6字节）
   */
  auth_encrypt(passwordSource, random) {
    const result = new Uint8Array(6);
    for (let i = 0; i < 6; i++) {
      result[i] = ((passwordSource[i] ^ random[i]) ^ 0xFF) & 0xFF;
    }
    return result;
  },

  /**
   * 生成完整认证码
   * @param {string} terminalId - 终端号（6位HEX，如 '241008'）
   * @param {string} passwordSourceHex - 蓝牙密钥（12位HEX）
   * @param {string} randomHex - 随机数（12位HEX）
   * @param {string} suffix - 后缀（6位HEX，如 '000024'）
   * @returns {string} 格式化后的认证码，如 "24 10 08 E8 DC B3 E2 E5 9F 00 00 24"
   */
  generateAuthCode(terminalId, passwordSourceHex, randomHex, suffix = '000024') {
    const passwordSource = this.hexToBytes(passwordSourceHex);
    const random = this.hexToBytes(randomHex);
    const encrypted = this.auth_encrypt(passwordSource, random);
    const encryptedHex = this.bytesToHex(encrypted);

    const rawCode = `${terminalId}${encryptedHex}${suffix}`;
    return this.formatHexString(rawCode);
  }
};
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    sign: '',
    devices: [],    // 存储发现的蓝牙设备列表
    chs: [],        // 存储蓝牙特征值列表
    carBrands: [
      { name: "奥迪" },
      { name: "宝马" },
      { name: "保时捷" },
      { name: "奔驰" },
      { name: "本田" },
      { name: "大众" },
      { name: "丰田" },
      { name: "通用车型" }
    ],
    controlItems: [
      { name: "寻车", enabled: false },
      { name: "尾箱", enabled: false },
      { name: "启动", enabled: false },
      { name: "左中门", enabled: false },
      { name: "右中门", enabled: false },
      { name: "升窗", enabled: false },
      { name: "降窗", enabled: false },
      { name: "油路控制", enabled: false },
      { name: "布防控制", enabled: false }
    ],
  },

  onLoad: function (options) {
    const sign = options?.sign || ''
    this.setData({
      sign,
      headerTitle: this.getHeaderTitle(sign)
    })
  },
  onShow() {
    this.initialiImageBaseConversion()
  },

  // 标题计算逻辑
  getHeaderTitle(evt) {
    const titleMap = {
      1: '感应设置',
      3: '车型指令配置',
      4: '个性配置',
      5: '车辆转移',
      6: '编辑车辆',
      default: '设置'
    };
    return titleMap[evt] || titleMap.default;
  },
  // 全屏背景图
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );

    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },
  // 切换开关状态
  handleToggleControl(e) {
    const index = e.currentTarget.dataset.index;
    const key = `controlItems[${index}].enabled`;
    this.setData({
      [key]: !this.data.controlItems[index].enabled
    });
    console.log(`${this.data.controlItems[index].name}状态:`, this.data.controlItems[index].enabled);
  },
  // 选择汽车品牌
  handleCarBrand(e) {
    const brand = e.currentTarget.dataset.brand;
    console.log("选择的品牌:", brand);
    // 这里可以添加导航逻辑
  },
  auth_encrypt: function (passwordSource, random) {
    var passwordEncrypt = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    for (var i = 0; i < 6; i++) {
      passwordEncrypt[i] = passwordSource[i] ^ random[i];
      passwordEncrypt[i] ^= 0xFF;
    }
    return passwordEncrypt;
  },
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    for (let i = 0; i < array.length; i++) {
      typedArray[i * elementSize] = array[i];
      // 如果需要处理多字节元素，请在这里添加额外的逻辑
    }
    return typedArray.buffer;
  },
  btnCmdSend: function (type, data) {
    const that = this
    switch (type) {
      case 0x10:
        var orgKey = [0x33, 0x69, 0x45, 0x22, 0x83, 0x78];
        var retKey = that.auth_encrypt(orgKey, data);
        console.log(data);
        console.log(retKey);
        var packet = that.PackCmdPacket(type, 8, retKey);
        console.log(that.arrayToArrayBuffer(packet))
        vwManager.dispatcherSend2(that.arrayToArrayBuffer(packet));
        break;
      default:
        break;
    }
  },

  PackCmdPacket: function (type, len, data) {
    var header = [0x24];
    var end = [0x24];
    var packet = header.concat(type).concat(len).concat(data).concat(end);
    console.log(packet);
    return packet;
  },
  // 初始化蓝牙适配
  openBluetoothAdapter() {
    wx.navigateTo({
      url: '/pages/BleKeyTest/BleKeyTest',
    })
    return
    const _this = this
    vwManager.connectBLE("51CarKey932505100319",
      function (state) {
        console.log('连接状态:', state);
      }, 
      function (data, key) {
        console.log('收到数据:', data, 'key:', key);
        _this.btnCmdSend(0x10, data)
      }
    );
  },
})