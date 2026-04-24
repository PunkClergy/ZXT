/**
 * 获取窗口信息
 * @param {number} ‌pixelRatio‌：设备像素比
 * @param {number} screenWidth‌： 屏幕宽度， 单位px。
 * @param {number} ‌screenHeight‌： 屏幕高度， 单位px。
 * @param {number} ‌windowWidth‌： 可使用窗口宽度， 单位px。
 * @param {number} ‌windowHeight‌： 可使用窗口高度， 单位px。‌
 * @param {number} statusBarHeight‌： 状态栏的高度， 单位px。
 * @param {number} ‌screenTop‌： 窗口上边缘的y值
 * @param {Object} safeArea‌： 在竖屏正方向下的安全区域， 包括左上角横坐标、 右上角横坐标、 左上角纵坐标、 右上角纵坐标、 宽度和高度。 
 * @returns {Object} - 返回一个Promise对象
 */
const _handleWindowInfo = wx.getWindowInfo()
/**
 * 获取设备的系统设置信息
 * @typedef {Object} SystemSettingInfo
 * @property {boolean} bluetoothEnabled - 表示蓝牙的系统开关状态，true表示开启，false表示关闭。
 * @property {boolean} locationEnabled - 表示地理位置的系统开关状态，true表示开启，false表示关闭。
 * @property {boolean} wifiEnabled - 表示Wi-Fi的系统开关状态，true表示开启，false表示关闭。
 * @property {string} deviceOrientation - 表示设备方向，合法值为"portrait"（竖屏）和"landscape"（横屏）。
 */
const _handleSystemSetting = wx.getSystemSetting()
/**
 * 获取设备的基础信息
 * @property {string} brand - 设备品牌
 * @property {string} model - 设备型号
 * @property {string} system - 操作系统及版本
 * @property {string} platform - 客户端平台（如 iOS、Android）
 * @property {...} ... - 其他参数
 */
const _handleDeviceInfo = wx.getDeviceInfo()

const _handleAppBaseInfo = wx.getAppBaseInfo()
const _handleAppAuthorizeSetting = wx.getAppAuthorizeSetting()

export default {
  _handleWindowInfo,
  _handleSystemSetting,
  _handleAppAuthorizeSetting,
  _handleDeviceInfo,
  _handleAppBaseInfo
}