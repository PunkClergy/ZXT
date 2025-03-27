
/**
 * 获取所有的控制命令
 */
const app = getApp();
const utils = require("byte-util.js");
const bleManager = require("./ble-manager");

/**
 * 最后一次发送的数据的流水号
 */
var lastSendSerialNum = 0;

/**
 * 获取流水号（序列号）
 */
function getSerialNum() {
  var serialNum;
  try {
    var value = wx.getStorageSync('serial-num')
    if (value) {
      serialNum = value;
    } else {
      serialNum = 0;
    }
  } catch (e) {
    serialNum = 0;
  }
  //流水号自增，并且不超过65535
  serialNum++;
  serialNum = serialNum % 65535;
  //保存流水号
  try {
    wx.setStorageSync('serial-num', serialNum);
  } catch (e) {
    serialNum = 0;
  }
  lastSendSerialNum = serialNum;
  console.log("--------serial-num:" + serialNum);
  return utils.shortToBytes(serialNum, true);
}

/**
* 获取控制指令
*/
function getDeviceControlCmd(cmd, controllCiphertext) {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x0A, 0x01];
  // 控制密文,16字节
  var controllCipherByte = utils.hexStringToArray(controllCiphertext);
  // 控制指令
  var controlCmd = utils.stringToBytes(cmd);
  // 控制密文长度
  var controlCmdLength = controlCmd.length;
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(controllCipherByte).concat(controlCmdLength).concat(controlCmd).concat(time);
  // 指定指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取状态指令
 */
function getDeviceStateCmd() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x0A, 0x06];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取电量,里程等相关信息
 */
function getDeviceCarInfo() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x98];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取VIN
 */
function getDeviceCarVIN() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x9A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取油量
 */
function getDeviceCarOIL() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x0A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取胎压
 */
function getDeviceCarTIRE() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x1A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取车辆保养信息
 */
function getDeviceCarMAIN() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x2A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取设备保养参数信息
 */
function getDeviceDevMAIN() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x3A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取设备保养参数信息
 */
function getDeviceDevSPINFO() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x4A];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取gps指令
 */
function getGPSDataCmd() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x02, 0x43];
  // 内容
  var content = serialNum.concat(cmdIdentifier);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 记录当前debug指令变量
 */
var debugType;
var debugLen;
var debugPara;

/**
 * 记录当前debug指令类型
 */
function setDebugType(debugTypeTmp) {
  debugType=utils.shortToSingleBytes(debugTypeTmp,true);
}

/**
 * 记录当前debug指令长度
 */
function setDebugLen(debugLenTmp) {
  debugLen=utils.shortToSingleBytes(debugLenTmp,true);
}

/**
 * 记录当前debug指令参数
 */
function setDebugPara(debugParaTmp) {
  if(debugType==0x00)
    debugPara=utils.shortToSingleBytes(0,true);
  else if(debugType==0x01)
    debugPara=utils.stringToBytes(debugParaTmp+'0',true);
  else if(debugType==0x02)
    debugPara=utils.shortToSingleBytes(debugParaTmp,true);
  else if(debugType==0x03)
    debugPara=utils.shortToSingleBytes(debugParaTmp,true);  
  else if(debugType==0x04)
    debugPara=utils.stringToBytes(debugParaTmp+'0',true);
  else if(debugType==0xa0)
    debugPara=utils.hexStringToArray(debugParaTmp);
  else if(debugType==0xa1)
    debugPara=utils.shortToSingleBytes(debugParaTmp,true);   
  else if(debugType==0xf0)
    debugPara=debugParaTmp;   
}

/**
 * 获取debug指令
 */
function getDEBUGDataCmd() {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x09, 0x99];
  // 时间戳
  var time = utils.intToBytes(Date.parse(new Date()) / 1000, true);
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(debugType).concat(debugLen).concat(debugPara).concat(time);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

/**
 * 获取通用应答指令
 */
function getNormalCmd(obdSerialNum) {
  // 报文序列号,占用2字节
  var serialNum = getSerialNum();
  // 命令标识,占用2个字节
  var cmdIdentifier = [0x60, 0x01];
  // 接收的报文流水号
  var obdSerialByte = utils.shortToBytes(obdSerialNum, true);
  // 结果
  var result = [0x00];
  // 内容
  var content = serialNum.concat(cmdIdentifier).concat(obdSerialByte).concat(result);
  // 获取指令
  var controlBytes = utils.crcEncrypt(app.CRC_TABLE_XW, content, app.header);
  return utils.buf2hex(controlBytes);
}

module.exports = {
  // 获取控制指令
  getDeviceControlCmd: getDeviceControlCmd,
  // 获取状态指令
  getDeviceStateCmd: getDeviceStateCmd,
  // 获取电量, 里程等相关信息
  getDeviceCarInfo: getDeviceCarInfo,
  // 获取VIN
  getDeviceCarVIN: getDeviceCarVIN,
  // 获取油量
  getDeviceCarOIL: getDeviceCarOIL,
  // 获取胎压
  getDeviceCarTIRE: getDeviceCarTIRE,
  // 获取车辆保养参数
  getDeviceCarMAIN: getDeviceCarMAIN,
  // 获取设备保养参数
  getDeviceDevMAIN: getDeviceDevMAIN,
  // 获取设备保养参数
  getDeviceDevSPINFO: getDeviceDevSPINFO,
  // 获取gps指令
  getGPSDataCmd: getGPSDataCmd,
  //设置debug类型
  setDebugType: setDebugType,
  //设置debug类型
  setDebugLen: setDebugLen,
  //设置debug参数
  setDebugPara: setDebugPara,
  // 获取debug指令
  getDEBUGDataCmd: getDEBUGDataCmd,
  // 获取胎压
  getDeviceCarTIRE: getDeviceCarTIRE,
  // 获取保养
  getDeviceCarMAIN: getDeviceCarMAIN,
  // 获取通用应答指令
  getNormalCmd: getNormalCmd,
  //最后一次发送的数据的流水号
  lastSendSerialNum: lastSendSerialNum
}

