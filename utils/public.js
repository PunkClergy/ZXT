/**
 * uni-app 系统/设备/窗口信息工具
 * 替代 wx.getWindowInfo / wx.getSystemSetting / wx.getDeviceInfo 等微信原生API
 */

// 同步获取系统全部信息（uni-app 标准API）
const systemInfo = uni.getSystemInfoSync();

/**
 * 获取窗口信息（对应 wx.getWindowInfo()）
 * @param {number} pixelRatio：设备像素比
 * @param {number} screenWidth：屏幕宽度，单位px
 * @param {number} screenHeight：屏幕高度，单位px
 * @param {number} windowWidth：可使用窗口宽度，单位px
 * @param {number} windowHeight：可使用窗口高度，单位px
 * @param {number} statusBarHeight：状态栏高度，单位px
 * @param {number} screenTop：窗口上边缘的y值
 * @param {Object} safeArea：竖屏正方向下的安全区域
 * @returns {Object}
 */
const _handleWindowInfo = {
  pixelRatio: systemInfo.pixelRatio,
  screenWidth: systemInfo.screenWidth,
  screenHeight: systemInfo.screenHeight,
  windowWidth: systemInfo.windowWidth,
  windowHeight: systemInfo.windowHeight,
  statusBarHeight: systemInfo.statusBarHeight,
  screenTop: systemInfo.screenTop,
  safeArea: systemInfo.safeArea
};

/**
 * 获取系统设置信息（对应 wx.getSystemSetting()）
 * @typedef {Object} SystemSettingInfo
 * @property {boolean} bluetoothEnabled - 蓝牙系统开关
 * @property {boolean} locationEnabled - 地理位置系统开关
 * @property {boolean} wifiEnabled - Wi-Fi系统开关
 * @property {string} deviceOrientation - 设备方向 portrait/landscape
 */
const _handleSystemSetting = {
  bluetoothEnabled: systemInfo.bluetoothEnabled,
  locationEnabled: systemInfo.locationEnabled,
  wifiEnabled: systemInfo.wifiEnabled,
  deviceOrientation: systemInfo.deviceOrientation
};

/**
 * 获取设备基础信息（对应 wx.getDeviceInfo()）
 * @property {string} brand - 设备品牌
 * @property {string} model - 设备型号
 * @property {string} system - 操作系统及版本
 * @property {string} platform - 客户端平台（iOS/Android/Windows/macOS）
 */
const _handleDeviceInfo = {
  brand: systemInfo.brand,
  model: systemInfo.model,
  system: systemInfo.system,
  platform: systemInfo.platform
};

/**
 * 应用基础信息（对应 wx.getAppBaseInfo()）
 */
const _handleAppBaseInfo = {
  appId: systemInfo.appId,
  appName: systemInfo.appName,
  version: systemInfo.version,
  uniPlatform: systemInfo.uniPlatform // uni-app 平台标识
};

/**
 * 应用授权设置（对应 wx.getAppAuthorizeSetting()）
 */
const _handleAppAuthorizeSetting = systemInfo.appAuthorizeSetting || {};

export default {
  _handleWindowInfo,
  _handleSystemSetting,
  _handleAppAuthorizeSetting,
  _handleDeviceInfo,
  _handleAppBaseInfo
}