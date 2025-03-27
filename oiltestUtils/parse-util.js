/**
 * 解析工具,用来解析设备返回的数据
 */
const app = getApp();
const utils = require('byte-util.js');
const { bytesToInt } = require('./byte-util');
var packageContent = null;

/**
 * crc验证
 */
function getCRCValueWith(data, start, length) {

  //Byte *buff = (Byte *)[data bytes];
  var crc = 0xffff;
  for (var i = start; i < length + start; i++) {
    crc = (crc >> 8) ^ app.CRC_TABLE_XW[(crc ^ data[i]) & 0xff];
  }
  //(short)
  return crc;
}

//
function isRightCrc(data) {

  var crcValue = getCRCValueWith(data, 4, data.length - 6);
  var lenData = data.slice(data.length - 2, data.length);

  var crcCurrent = utils.getShortWith(lenData, false);
  return (crcValue == crcCurrent);
}
//粘包处理
//使用方法：
// for (var response = filterOnePage(a); response != null; response = filterOnePage(null)) {
//   if (response != null) {
//     alert(response);
//   }
// }
function filterOnePage(content) {
  //alert(2222);
  if (packageContent == null) {
    packageContent = new Array();
  }
  if (content != null) {
    //	alert(33333);
    //Buffer.concat
    //packageContent.push()
    packageContent = packageContent.concat(content);
    //packageContent.add;
  }
  //alert(44444);
  var count = packageContent.length;
  //alert(5555);
  var headerIndex = -1;

  // int isDebug = 0;
  for (var i = 0; i < count; i++) {
    // int obdInt = Integer.toHexString(content[i]);
    // 不管何数与0xFF相与结果都是那个数的原值
    //获取数据
    var b0 = packageContent[i];//获取某一位置的数据
    var firstint = b0 & 0xff;

    // 找到头信息
    if (0x7E == firstint) {
      //console.log(firstint);
      headerIndex = i;
      // 数据不一定完整，但可以拿到头数据
      if (headerIndex + 4 <= count) {
        //console.log(packageContent);
        //console.log("headerIndex="+headerIndex);
        var lenData = packageContent.slice(headerIndex + 2, headerIndex + 2 + 2);


        //int size = (int) b1 & 0xff;
        //console.log(lenData);
        var size = utils.getShortWith(lenData, true);
        //console.log("size="+size);
        // 代表数据完整
        var onePackageLen = 4 + size;
        //正常
        if (onePackageLen + headerIndex <= count && onePackageLen + headerIndex >= 0) {
          var subData = packageContent.slice(headerIndex, headerIndex + onePackageLen);//截取索引0到索引100的数据


          //alert(subData);
          if (isRightCrc(subData)) {
            //删除数据
            packageContent = packageContent.slice(headerIndex + onePackageLen, count);
            //alert("packageContent="+packageContent);
            return subData;
          }
        }
      }
    }

  }
  return null;
}

/**
 * 处理一个完整的包数据
 * data:数组
 */
function receiveData(data, lastControlCmd, DEFAULT_CONTROL_CMDS, callback) {
  var s = utils.buf2hex(data);
  var length = data.length;
  if (length > 7) {
    //流水号
    var currentOBDSerialNum = [data[4], data[5]];
    var currentOBDSerialNumShort = utils.getShortWith(currentOBDSerialNum, true);
    //命令标识符
    var cmdIdentifier = [data[6], data[7]];
    var cmdIdentifierShort = utils.getShortWith(cmdIdentifier, true);
    dispatcherState(cmdIdentifierShort, data, length, s, currentOBDSerialNum, lastControlCmd, DEFAULT_CONTROL_CMDS, callback);
  }
}

/**
 * controlType：控制类型 1，gps 2,状态读取 3，里程电量 4，控制 5,VIN 6,油量 7,debug响应 8,胎压 9,保养车辆参数 10,保养设备参数 11,车型特殊数据
 * serilalOBDNum：流水号
 * result：结果数据
 * reply：是否回复6001
 */
function parseResult(controlType, serilalOBDNum, result, reply) {
  var data = {};
  data.controlType = controlType;
  data.serilalOBDNum = serilalOBDNum;
  data.result = result;
  data.reply = reply;
  return data;
}

/**
 * 解析状态
 */
function dispatcherState(cmdIdentifierText, data, length, receiver,
  serilalOBDNum, lastControlCmd, DEFAULT_CONTROL_CMDS, callback) {

  if (0x0295 == cmdIdentifierText) {
    console.log("---------------收到一条控制信息-----------------");
    // 远程控制
    var result = data[length - 7];
    callback(parseResult(4, serilalOBDNum, parseControlResult(lastControlCmd, DEFAULT_CONTROL_CMDS, result), true));
  }
  else if (0x0283 == cmdIdentifierText) {
    // gps
    console.log("---------------收到一条GPS信息-----------------");
    var result = parseZisGps(receiver);
    callback(parseResult(1, serilalOBDNum, result, true));
  }
  else if (0x0A07 == cmdIdentifierText) {
    // 状态读取
    console.log("---------------收到一条车辆状态信息-----------------");
    var arr = parseZisCarStatus(receiver);
    var result = analyticStatusNew(arr[1], arr[2], arr[3]);
    callback(parseResult(2, serilalOBDNum, result, true));
  }
  else if (0x0299 == cmdIdentifierText) {
    // 4.2.5 电量,总里程和续航里程,RPM
    console.log("---------------收到一条电量、里程信息-----------------");
    var result = parseZisMileRange(receiver);
    callback(parseResult(3, serilalOBDNum, result, true));
  }
  else if (0x029B == cmdIdentifierText) {
    // VIN
    console.log("---------------收到一条VIN信息-----------------");
    var result = parseZisVIN(receiver);
    callback(parseResult(5, serilalOBDNum, result, true));
  }
  else if (0x020B == cmdIdentifierText) {
    // OIL
    console.log("---------------收到一条油量信息-----------------");
    var result = parseZisOIL(receiver);
    callback(parseResult(6, serilalOBDNum, result, true));
  }
  else if (0x099A == cmdIdentifierText) {
    // DEBUG
    console.log("---------------收到一条调试信息-----------------");
    var result = parseZisDebug(receiver);
    callback(parseResult(7, serilalOBDNum, result, true));
  }
  else if (0x021B == cmdIdentifierText) {
    // 胎压
    console.log("---------------收到一条胎压信息-----------------");
    var result = parseZisTIRE(receiver);
    callback(parseResult(8, serilalOBDNum, result, true));
  }
  else if (0x022B == cmdIdentifierText) {
    // 保养
    console.log("---------------收到一条原车保养信息-----------------");
    var result = parseZisCarMAIN(receiver);
    callback(parseResult(9, serilalOBDNum, result, true));
  }
  else if (0x023B == cmdIdentifierText) {
    // 保养
    console.log("---------------收到一条设备保养参数-----------------");
    var result = parseZisDevMAIN(receiver);
    callback(parseResult(10, serilalOBDNum, result, true));
  }
  else if (0x024B == cmdIdentifierText) {
    // 保养
    console.log("---------------收到一条车型特殊数据-----------------");
    var result = parseZisDevSPINFO(receiver);
    callback(parseResult(11, serilalOBDNum, result, true));
  }
  else if (0x6001 == cmdIdentifierText) {
    // 通用应答
    console.log("---------------收到一条通用应答信息-----------------");
    if (length > 10) {
      var state = utils.getShortWith(data[10], true);
      if (state == 0x00) {
        // 成功
        console.log("------------成功解析6001-----");
        callback(parseResult(0, serilalOBDNum, '', false));
      }
    }
  }
}

/**
 * 解析控制结果
 */
function parseControlResult(lastControlCmd, DEFAULT_CONTROL_CMDS, resultCode) {
  var result = '';
  console.log("\r\n------------------------------------------------"+resultCode+"\r\n--------------------------------------------------------------")
  switch (resultCode) {
    case 0x00:// 成功
      if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_OPEN_DOOR_POWER) {
        result = '开门+上电 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_OPEN_DOOR) {
        result = '开门 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_CLOSE_DOOR) {
        result = '锁门 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_CLOSE_DOOR_OUTAGE) {
        result = '锁门+断电 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_REMOTE_LOOK_FOR_CAR) {
        result = '鸣笛 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_RELEASECAR) {
        result = '上电 成功';
      } else if (lastControlCmd == DEFAULT_CONTROL_CMDS.CONTROL_CATCHCAR) {
        result = '断电 成功';
      } else{
        result = '成功';
      }
      break;
    case 0x01:// 总线忙
      result = "设备忙!";
      break;
    case 0x02:// 不支持
      result = "不支持当前指令!";
      break;
    case 0x04:// 收到控制时间超过有效期(10分钟)
      result = "时间不一致!";
      break;
    case 0x06:// 无效授权
      //TODO 重新获取控制密码
      result = "无效授权";
      break;
    case 0x19:// ON状态不执行（开门、锁门、寻车都有）
      result = "ON状态不执行!";
      break;
    case 0x1A:// 原车PKE操作退出执行（仅开门有）
      result = "车辆已被原车接管,请拨掉钥匙重试!";
      break;
    case 0x1B:// 门未关（仅锁门有）
      result = "锁车失败(门未关)!";
      break;
    case 0x1C:// 动作执行前执行失败
      result = "前置动作失败!";
      break;
    case 0x1D:// 中控锁未锁（仅锁门有）
      result = "关锁失败,请重试!";
      break;
    case 0x1E:// 开锁后中控锁为锁状态 (开锁门不成功)
      result = "开锁失败,请重试!";
      break;
    case 0x38:
      result = "控制失败,请关闭车灯和ACC!";
      break;
    default:
      result = "控制失败(代码:" + resultCode + "),请重试!";
      break;
  }
  return result;
}

/**
 * 解析gps
 */
function parseZisGps(data) {
  var bytes = utils.hexStringToArray(data);
  var gpsBean = new Object();
  var n = 9;
  n += 4;

  gpsBean.Longitude = utils.converTude2Double(bytes, n);
  n += 4;
  gpsBean.Latitude = utils.converTude2Double(bytes, n);
  n += 4;

  gpsBean.Speed = utils.bytesToShort(bytes[n], bytes[n + 1]) / 10;
  n += 2;

  gpsBean.Direction = bytes[n++] & 0xff;
  gpsBean.Altitude = Math.min(30000, utils.bytesToShort(bytes[n], bytes[n + 1]));
  n += 2;

  gpsBean.SalState = -1;
  gpsBean.BindState = bytes[n++] & 0xff;
  gpsBean.SalCount = bytes[n++] & 0xff;

  return gpsBean;
}

/**
 * 解析续航里程、电量等
 */
function parseZisMileRange(data) {
  var bytes = utils.hexStringToArray(data);
  var mileBean = new Object();
  var n = 10;
  if (bytes[n] == 0x01)
    mileBean.RemainBattery = bytes[n + 1];
  else if (bytes[n] == 0x02)
    mileBean.RemainBattery = -1;
  else if (bytes[n] == 0x03)
    mileBean.RemainBattery = -2;
  else
    mileBean.RemainBattery = '';
  n += 2;

  if (bytes[n] == 0x01)
    mileBean.MileRange = utils.bytesToShort(bytes[n + 1], bytes[n + 2]);
  else if (bytes[n] == 0x02)
    mileBean.MileRange = -1;
  else if (bytes[n] == 0x03)
    mileBean.MileRange = -2;
  else
    mileBean.MileRange = '';
  n += 3;

  if (bytes[n] == 0x01)
    mileBean.TotalMileage = utils.bytesToInt(bytes[n + 1], bytes[n + 2], bytes[n + 3], bytes[n + 4]);
  else if (bytes[n] == 0x02)
    mileBean.TotalMileage = -1;
  else if (bytes[n] == 0x03)
    mileBean.TotalMileage = -2;
  else
    mileBean.TotalMileage = '';
  n += 5;


  if (bytes[n] == 0x01)
    mileBean.Rpm = utils.bytesToShort(bytes[n + 1], bytes[n + 2]);
  else if (bytes[n] == 0x02)
    mileBean.Rpm = -1;
  else if (bytes[n] == 0x03)
    mileBean.Rpm = -2;
  else
    mileBean.Rpm = '';
  n += 3;

  if (bytes[n] == 0x01)
    mileBean.Speed = utils.bytesToShort(bytes[n + 1], bytes[n + 2]);
  else if (bytes[n] == 0x02)
    mileBean.Speed = -1;
  else if (bytes[n] == 0x03)
    mileBean.Speed = -2;
  else
    mileBean.Speed = '';
  n += 3;

  mileBean.CmdID = utils.bytesToInt(bytes[n], bytes[n + 1], bytes[n + 2], bytes[n + 3]);
  n += 4;

  return mileBean;
}

/**
 * 解析VIN
 */
function parseZisVIN(data) {
  var bytes = utils.hexStringToArray(data);
  var VINBean = new Object();
  var n = 8;
  if ( 
       bytes[n] != 0x00
    && bytes[n+1] != 0x00
    && bytes[n+2] != 0x00
    && bytes[n+3] != 0x00
    && bytes[n+4] != 0x00
    && bytes[n+5] != 0x00
    && bytes[n+6] != 0x00
    && bytes[n+7] != 0x00
    && bytes[n+8] != 0x00
    && bytes[n+9] != 0x00
    && bytes[n+10] != 0x00
    && bytes[n+11] != 0x00
    && bytes[n+12] != 0x00
    && bytes[n+13] != 0x00
    && bytes[n+14] != 0x00
    && bytes[n+15] != 0x00
    && bytes[n+16] != 0x00
  )
  {
    VINBean.VIN=utils.buf2string(bytes).substr(8,17);
    VINBean.VIN=VINBean.VIN.toUpperCase();
  }
  else
    VINBean.VIN = -1;
  return VINBean;
}

/**
 * 解析油量
 */
function parseZisOIL(data) {
  var bytes = utils.hexStringToArray(data);
  var OilBean = new Object();

  var num=13;
  if(bytes[num]==0x01){
    var n = 16;
    if (bytes[n]==0xff)
    {
      OilBean.OilPst = -1;
      OilBean.OilVal = -1;
    }
    else if(bytes[n]==0x01)
    {
      OilBean.OilPst = bytes[n+4];
      OilBean.OilVal = -1;
    }
    else if(bytes[n]==0x00)
    {
      OilBean.OilPst = -1;
      OilBean.OilVal = utils.bytesToInt(bytes[n+1],bytes[n+2],bytes[n+3],bytes[n+4])/1000;
    }
  }
  else if(bytes[num]==0x02){
    var n = 16;
    if(bytes[n]==0x01)
    {
      OilBean.OilPst = bytes[n+4];
      OilBean.OilVal = utils.bytesToInt(bytes[n+8],bytes[n+9],bytes[n+10],bytes[n+11])/1000;
    }
    else if(bytes[n]==0x00)
    {
      OilBean.OilPst = bytes[n+11];
      OilBean.OilVal = utils.bytesToInt(bytes[n+1],bytes[n+2],bytes[n+3],bytes[n+4])/1000;
    }
    
  }
  return OilBean;
}

/**
 * 解析胎压
 */
function parseZisTIRE(data) {
  var bytes = utils.hexStringToArray(data);
  var TireBean = new Object();

  var num=13;
  if(bytes[num]==0x01){
    var n = 16;
    if(bytes[n]==0x01)
    {
      TireBean.TireSta = '支持胎压';
      TireBean.LFTire = bytes[n+1]/10;
      TireBean.RFTire = bytes[n+2]/10;
      TireBean.LRTire = bytes[n+3]/10;
      TireBean.RRTire = bytes[n+4]/10;
    }
    else if(bytes[n]==0x00)
    {
      TireBean.TireSta = '不支持胎压';
      TireBean.LFTire = -1;
      TireBean.RFTire = -1;
      TireBean.LRTire = -1;
      TireBean.RRTire = -1;
    }
  }
  return TireBean;
}

/**
 * 解析原车保养参数
 */
function parseZisCarMAIN(data) {
  var bytes = utils.hexStringToArray(data);
  var MainBean = new Object();

  var num=13;
  if(bytes[num]==0x01){
    var n = 16;
    if (bytes[n]==0x01){
      MainBean.BigSetMainDate = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]);
      MainBean.SmallSetMainDate = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]);
    }
    else {
      MainBean.BigSetMainDate = -1;
      MainBean.SmallSetMainDate = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.BigSetMainMile = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]) * 100;
      MainBean.SmallSetMainMile = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]) * 100;
    }
    else{
      MainBean.BigSetMainMile = -1;
      MainBean.SmallSetMainMile = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.MainSetOil = utils.bytesToInt(0,0,0,bytes[n+1]) / 256 * 100;
    }
    else{
      MainBean.MainSetOil = -1;
    }
    n+=2;
    if (bytes[n]==0x01){
      MainBean.BigRunMainDate = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]);
      MainBean.SmallRunMainDate = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]);
    }
    else {
      MainBean.BigRunMainDate = -1;
      MainBean.SmallRunMainDate = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.BigRunMainMile = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]) * 100;
      MainBean.SmallRunMainMile = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]) * 100;
    }
    else{
      MainBean.BigRunMainMile = -1;
      MainBean.SmallRunMainMile = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.MainRunOil = utils.bytesToInt(0,0,0,bytes[n+1]);
    }
    else{
      MainBean.MainRunOil = -1;
    }
    n+=2;
    if (bytes[n]==0x01){
      MainBean.BigRemMainDate = -1;
      MainBean.SmallRemMainDate = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]);
    }
    else {
      MainBean.BigRemMainDate = -1;
      MainBean.SmallRemMainDate = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.BigRemMainMile = -1;
      MainBean.SmallRemMainMile = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]) * 100;
    }
    else{
      MainBean.BigRemMainMile = -1;
      MainBean.SmallRemMainMile = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.MainRemOil = utils.bytesToInt(0,0,0,bytes[n+1]);
    }
    else{
      MainBean.MainRemOil = -1;
    }
  }
  return MainBean;
}

/**
 * 解析设备保养参数
 */
function parseZisDevMAIN(data) {
  var bytes = utils.hexStringToArray(data);
  var MainBean = new Object();

  var num=13;
  if(bytes[num]==0x01){
    var n = 16;
    if (bytes[n]==0x01){
      MainBean.BigMainDate = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]);
      MainBean.SmallMainDate = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]);
    }
    else {
      MainBean.BigMainDate = -1;
      MainBean.SmallMainDate = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.BigMainMile = utils.bytesToInt(0,0,bytes[n+1],bytes[n+2]) * 100;
      MainBean.SmallMainMile = utils.bytesToInt(0,0,bytes[n+3],bytes[n+4]) * 100;
    }
    else{
      MainBean.BigMainMile = -1;
      MainBean.SmallMainMile = -1;
    }
    n+=5;
    if(bytes[n]==0x01){
      MainBean.MainOil = utils.bytesToInt(0,0,0,bytes[n+1]) / 256 * 100;
    }
    else{
      MainBean.MainOil = -1;
    }
    n+=3;
    if(bytes[n]==0x01){
      MainBean.Dev = "准备执行";
    }
    else if(bytes[n]==0x00){
      MainBean.Dev = "初始化";
    }
    else if(bytes[n]==0x02){
      MainBean.Dev = "执行完毕";
    }
    else{
      MainBean.Dev = -1;
    }
  }
  return MainBean;
}

/**
 * 解析特殊数据
 */
function parseZisDevSPINFO(data) {
  var bytes = utils.hexStringToArray(data);
  var SPINFOBean = new Object();

  var num=16;
  SPINFOBean.SPReady=utils.bytesToInt(0,0,0,bytes[num]);
  num++;
  SPINFOBean.SPType=utils.bytesToInt(0,0,0,bytes[num]);
  num++;
  SPINFOBean.fourdoor=utils.bytesToInt(0,0,0,bytes[num]);
  num++;
  SPINFOBean.keynum=utils.bytesToInt(0,0,0,bytes[num]);
  num++;  
  return SPINFOBean;
}

/**
 * 解析debug
 */
function parseZisDebug(data) {
  var bytes = utils.hexStringToArray(data);
  var DebugBean = new Object();
  var n = 8;
  if(bytes[n]==0x00){
    DebugBean.DebugType="复位指令";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="成功";
    else DebugBean.DebugRes="失败";
  }
  else if(bytes[n]==0x01){
    DebugBean.DebugType="修改IDC指令";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="成功";
    else DebugBean.DebugRes="失败";
  }
  else if(bytes[n]==0x02){
    if(bytes[n+1]==0x01) {
      DebugBean.DebugType="修改IP指令";
      DebugBean.DebugRes="成功";
    }
    else if((bytes[n+1]&0xf0)==0xf0){
      DebugBean.DebugType="查询IP指令";
      if((bytes[n+1]&0x0f)==0x01)
        DebugBean.DebugRes="ZXT IP";
      else if((bytes[n+1]&0x0f)==0x02)
        DebugBean.DebugRes="SZ IP";
      else if((bytes[n+1]&0x0f)==0x03)
        DebugBean.DebugRes="HL IP";
    }
    else {
      DebugBean.DebugType="失败";
      DebugBean.DebugRes="失败";
    }
  }
  else if(bytes[n]==0x03){
    DebugBean.DebugType="匹配模式指令";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="3V3打开成功";
    else if(bytes[n+1]==0x00) DebugBean.DebugRes="3V3关闭成功";
    else DebugBean.DebugRes="失败";
  } 
  else if(bytes[n]==0x04){
    DebugBean.DebugType="复合修改指令";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="成功";
    else if(bytes[n+1]==0x00) DebugBean.DebugRes="失败";
    else DebugBean.DebugRes="失败";
  } 
  else if(bytes[n]==0xA0){
    DebugBean.DebugType="设置保养时间里程百分比参数";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="成功";
    else if(bytes[n+1]==0x00) DebugBean.DebugRes="失败";
    else DebugBean.DebugRes="失败";
  } 
  else if(bytes[n]==0xA1){
    DebugBean.DebugType="设置保养执行参数";
    if(bytes[n+1]==0x01) DebugBean.DebugRes="成功";
    else if(bytes[n+1]==0x00) DebugBean.DebugRes="失败";
    else DebugBean.DebugRes="失败";
  } 
  else if(bytes[n]==0xf0){
    DebugBean.DebugType="CAN数据透传";
    if(bytes[n+1]==0x01) {
      DebugBean.DebugRes="成功";
      n+=2;
      // DebugBean.DebugSType=utils.bytesToInt(0,0,bytes[n],bytes[n+1]);
      // n+=2;
      DebugBean.DebugRLen=bytes[n];
      n++;
      var tmpRID=utils.bytesToInt(bytes[n],bytes[n+1],bytes[n+2],bytes[n+3]);
      DebugBean.DebugRIDArray=utils.intToBytes(tmpRID,true);
      DebugBean.DebugRID=utils.buf2hex(DebugBean.DebugRIDArray)+'';
      DebugBean.DebugRID=DebugBean.DebugRID.toUpperCase();
      n+=4;
      var tmpRData=[];
      for(var i=0;i<DebugBean.DebugRLen;i++)
      {
        tmpRData.push(bytes[n]);
        n++;
      }
      DebugBean.DebugRData=utils.buf2hex(tmpRData)+'';
      DebugBean.DebugRData=DebugBean.DebugRData.toUpperCase();
      DebugBean.DebugRDataArray=tmpRData;

    }
    else if(bytes[n+1]==0x00) {
      DebugBean.DebugRes="失败";
    }
    else DebugBean.DebugRes="失败";
  } 
  return DebugBean;
}

/**
 * 解析车辆状态
 */
function parseZisCarStatus(data) {
  var bytes = utils.hexStringToArray(data);
  var arr = new Array(4);
  var n = 10;
  arr[0] = utils.bytesToInt(bytes[n], bytes[n + 1], bytes[n + 2], bytes[n + 3]);
  n += 4;
  var len = bytes[n++];
  if (len >= 3) {
    for (var i = 0; i < len; i++) {
      switch (bytes[n++]) {
        case 1:
          if (bytes[n] >= 2) {
            var lightState = bytes.slice(n + 1, n + 1 + bytes[n]);
            arr[1] = utils.buf2hex(lightState);
          }
          break;
        case 2:
          if (bytes[n] >= 2) {
            var doorState = bytes.slice(n + 1, n + 1 + bytes[n]);
            arr[2] = utils.buf2hex(doorState);
          }
          break;
        case 3:
          if (bytes[n] >= 3) {
            console.log(bytes);
            var otherState = bytes.slice(n + 1, n + 1 + bytes[n]);
            arr[3] = utils.buf2hex(otherState);
          }
          break;
      }
      n += 1 + bytes[n];
    }
  }
  return arr;
}

/**
 * 解析车辆状态
 */
function analyticStatusNew(lightState, doorState, otherState) {
  var cr = new Object();

  var shikuoLight = -1;//示廓灯
  cr.shikuoLightValue = shikuoLight;
  var dippedHeadlight = -1;//近光灯
  cr.dippedHeadlightValue = dippedHeadlight;
  var highbeam = -1;//远光灯
  cr.highbeamValue = highbeam;
  var foglight = -1;//雾灯
  cr.foglightValue = foglight;

  var rightflash = -1;//左转
  cr.rightflashValue = rightflash;
  var leftflash = -1;//右转
  cr.leftflashValue = leftflash;
  var dangerflash = -1;//危险
  cr.dangerflashValue = dangerflash;
  var faultlight = -1;//故障
  cr.faultlightValue = faultlight;

  var rearRight = -1;//右后门
  cr.rearRightValue = rearRight;
  var rearLeft = -1;//左后门
  cr.rearLeftValue = rearLeft;
  var frontRight = -1;//右前门
  cr.frontRightValue = frontRight;
  var frontLeft = -1;//左前门
  cr.frontLeftValue = frontLeft;
  var boot = -1;//后备箱
  cr.bootValue = boot;
  var engine = -1;//发动机状态
  cr.engineValue = engine;
  var acc = -1;//acc状态
  cr.accValue = acc;
  var on = -1;//on状态
  cr.onValue = on;


  var belt = -1;//安全带
  cr.beltValue = belt
  var handbreak = -1;//手刹
  cr.handbreakValue = handbreak
  var footbreak = -1;//脚刹
  cr.footbreakValue = footbreak
  var hood = -1;//机盖
  cr.hoodValue = hood;
  var shiftr = -1;//r
  cr.shiftrValue = shiftr;
  var shiftp = -1;//p
  cr.shiftpValue = shiftp;
  var shiftn = -1;//n
  cr.shiftnValue = shiftn;
  var shiftd = -1;//d
  cr.shiftdValue = shiftd;
  var ZV = -1;//中控锁
  cr.ZVValue = ZV
  var catchcar = -1;//拦截
  cr.catchcarValue = catchcar
  var charge = -1;//充电状态
  cr.chargeValue = charge;
  var chargefast = -1;//快充慢充
  cr.chargefastValue = chargefast;
  var chargeslow = -1;//快充慢充
  cr.chargeslowValue = chargeslow;



  try {

    if (lightState.length <= 0) lightState = "0000";
    if (doorState.length <= 0) doorState = "0000";
    if (otherState.length <= 0) otherState = "0000000000";

    var lights = utils.hexStringToArray(lightState);
    var doors = utils.hexStringToArray(doorState);
    var others = utils.hexStringToArray(otherState);

    shikuoLight = (((lights[0] & 0x40) >> 6));//是否支持示廓灯
    var shikuoLightValue = (((lights[0] & 0x80) >> 7));//示廓灯
    if (shikuoLight == 1){
        if(shikuoLightValue == 1){
          cr.shikuoLightValue = "开启";}
        else{
          cr.shikuoLightValue = "关闭";}}
      else{
        cr.shikuoLightValue = "不支持";}
    
    dippedHeadlight = (((lights[0] & 0x10) >> 4));//是否支持近光灯
    var dippedHeadlightValue = (((lights[0] & 0x20) >> 5));//近光灯
    if (dippedHeadlight == 1){
      if(dippedHeadlightValue == 1){
        cr.dippedHeadlightValue = "开启";}
      else{
        cr.dippedHeadlightValue = "关闭";}}
    else{
      cr.dippedHeadlightValue = "不支持";}

    highbeam = (((lights[0] & 0x04) >> 2));//是否支持远光灯
    var highbeamValue = (((lights[0] & 0x08) >> 3));//远光灯
    if (highbeam == 1){
      if(highbeamValue == 1){
        cr.highbeamValue = "开启";}
      else{
        cr.highbeamValue = "关闭";}}
    else{
      cr.highbeamValue = "不支持";}

    foglight = (((lights[0] & 0x01)));//是否支持雾灯
    var foglightValue = (((lights[0] & 0x02) >> 1));//雾灯
    if (foglight == 1){
      if(foglightValue == 1){
        cr.foglightValue = "开启";}
      else{
        cr.foglightValue = "关闭";}}
    else{
      cr.foglightValue = "不支持";}

    rightflash = (((lights[1] & 0x04) >> 6));//是否支持右转向
    var rightflashValue = (((lights[1] & 0x08) >> 7));//右转向
    if (rightflash == 1){
      if(rightflashValue == 1){
        cr.rightflashValue = "开启";}
      else{
        cr.rightflashValue = "关闭";}}
    else{
      cr.rightflashValue = "不支持";}
  
    leftflash = (((lights[1] & 0x01) >> 4));//是否支持左转向
    var leftflashValue = (((lights[1] & 0x02) >> 5));//左转向
    if (leftflash == 1){
      if(leftflashValue == 1){
        cr.leftflashValue = "开启";}
      else{
        cr.leftflashValue = "关闭";}}
    else{
      cr.leftflashValue = "不支持";}

    dangerflash = (((lights[1] & 0x04) >> 2));//是否支持危险报警灯
    var dangerflashValue = (((lights[1] & 0x08) >> 3));//危险报警灯
    if (dangerflash == 1){
      if(dangerflashValue == 1){
        cr.dangerflashValue = "开启";}
      else{
        cr.dangerflashValue = "关闭";}}
    else{
      cr.dangerflashValue = "不支持";}
    
    faultlight = (((lights[1] & 0x01)));//是否支持故障灯
    var faultlightValue = (((lights[1] & 0x02) >> 1));//故障灯
    if (faultlight == 1){
      if(faultlightValue == 1){
        cr.faultlightValue = "开启";}
      else{
        cr.faultlightValue = "关闭";}}
    else{
      cr.faultlightValue = "不支持";}

    rearRight = (((doors[0] & 0x40) >> 6));//右后门
    var rearRightValue = (((doors[0] & 0x80) >> 7));
    if (rearRight == 1){
      if(rearRightValue == 1){
        cr.rearRightValue = "开启";}
      else{
        cr.rearRightValue = "关闭";}}
    else{
      cr.rearRightValue = "不支持";}

    rearLeft = (((doors[0] & 0x10) >> 4));//左后门
    var rearLeftValue = (((doors[0] & 0x20) >> 5));
    if (rearLeft == 1){
      if(rearLeftValue == 1){
        cr.rearLeftValue = "开启";}
      else{
        cr.rearLeftValue = "关闭";}}
    else{
      cr.rearLeftValue = "不支持";}

    frontRight = (((doors[0] & 0x4) >> 2));//右前门
    var frontRightValue = (((doors[0] & 0x8) >> 3));
    if (frontRight == 1){
      if(frontRightValue == 1){
        cr.frontRightValue = "开启";}
      else{
        cr.frontRightValue = "关闭";}}
    else{
      cr.frontRightValue = "不支持";}

    frontLeft = (doors[0] & 0x1);//左前门
    var frontLeftValue = (((doors[0] & 0x2) >> 1));
    if (frontLeft == 1){
      if(frontLeftValue == 1){
        cr.frontLeftValue = "开启";}
      else{
        cr.frontLeftValue = "关闭";}}
    else{
      cr.frontLeftValue = "不支持";}

    boot = (((doors[1] & 0x40) >> 6));//后备箱
    var bootValue = (((doors[1] & 0x80) >> 7));
    if (boot == 1){
      if(bootValue == 1){
        cr.bootValue = "开启";}
      else{
        cr.bootValue = "关闭";}}
    else{
      cr.bootValue = "不支持";}

    engine = (((doors[1] & 0x10) >> 4));//发动机
    var engineValue = (((doors[1] & 0x20) >> 5));
    if (engine == 1){
      if(engineValue == 1){
        cr.engineValue = "开启";}
      else{
        cr.engineValue = "关闭";}}
    else{
      cr.engineValue = "不支持";}

    acc = (((doors[1] & 0x04) >> 2));//acc
    var accValue = (((doors[1] & 0x08) >> 3));
    if (acc == 1){
      if(accValue == 1){
        cr.accValue = "开启";}
      else{
        cr.accValue = "关闭";}}
    else{
      cr.accValue = "不支持";}

    on = (doors[1] & 0x1);//ON
    var onValue = (((doors[1] & 0x2) >> 1));
    if (on == 1){
      if(onValue == 1){
        cr.onValue = "开启";}
      else{
        cr.onValue = "关闭";}}
    else{
      cr.onValue = "不支持";}

    belt = (((others[0] & 0x40) >> 6));//安全带
    var beltValue = (((others[0] & 0x80) >> 7));
    if (belt == 1){
      if(beltValue == 1){
        cr.beltValue = "开启";}
      else{
        cr.beltValue = "关闭";}}
    else{
      cr.beltValue = "不支持";}

    handbreak = (((others[0] & 0x04) >> 2));//手刹
    var handbreakValue = (((others[0] & 0x08) >> 3));
    if (handbreak == 1){
      if(handbreakValue == 1){
        cr.handbreakValue = "开启";}
      else{
        cr.handbreakValue = "关闭";}}
    else{
      cr.handbreakValue = "不支持";}
    
    footbreak = (((others[0] & 0x01) ));//脚刹
    var footbreakValue = (((others[0] & 0x02) >> 1));
    if (footbreak == 1){
      if(footbreakValue == 1){
        cr.footbreakValue = "开启";}
      else{
        cr.footbreakValue = "关闭";}}
    else{
      cr.footbreakValue = "不支持";}  

    hood = (((others[1] & 0x01) ));//机盖
    var hoodValue = (((others[1] & 0x02) >> 1));
    if (hood == 1){
      if(hoodValue == 1){
        cr.hoodValue = "开启";}
      else{
        cr.hoodValue = "关闭";}}
    else{
      cr.hoodValue = "不支持";}  

    if(others[2] == 0x50){
      cr.shiftpValue="开启";
      cr.shiftnValue="关闭";
      cr.shiftrValue="关闭";
      cr.shiftdValue="关闭";
    }
    else if(others[2] == 0x52){
      cr.shiftpValue="关闭";
      cr.shiftnValue="关闭";
      cr.shiftrValue="开启";
      cr.shiftdValue="关闭";
    }
    else if(others[2] == 0x4e){
      cr.shiftpValue="关闭";
      cr.shiftnValue="开启";
      cr.shiftrValue="关闭";
      cr.shiftdValue="关闭";
    }
    else if(others[2] == 0x44){
      cr.shiftpValue="关闭";
      cr.shiftnValue="关闭";
      cr.shiftrValue="关闭";
      cr.shiftdValue="开启";
    }
    else
    {
      cr.shiftpValue="关闭";
      cr.shiftnValue="关闭";
      cr.shiftrValue="关闭";
      cr.shiftdValue="关闭";
    }



    ZV = (((others[4] & 0x10) >> 4));//中控锁
    var ZVValue = ((others[4] & 0x20) >> 5);
    if (ZV == 1){
      if(ZVValue == 1){
        cr.ZVValue = "开启";}
      else{
        cr.ZVValue = "关闭";}}
    else{
      cr.ZVValue = "不支持";}  

    catchcar = (((others[4] & 0x04) >> 2));//拦截
    var catchcarValue = ((others[4] & 0x08) >> 3);
    if (catchcar == 1){
      if(catchcarValue == 1){
        cr.catchcarValue = "开启";}
      else{
        cr.catchcarValue = "关闭";}}
    else{
      cr.catchcarValue = "不支持";}  

    charge = others[4] & 0x1;//充电
    var chargeValue = (others[4] & 0x2) >> 1;
    if (charge == 1){
      if(chargeValue == 1){
        cr.chargeValue = "开启";}
      else{
        cr.chargeValue = "关闭";}}
    else{
      cr.chargeValue = "不支持";}  

    if(others.length>5){
      chargefast = (((others[5] & 0x40) >> 6));//快充
      var chargefastValue = ((others[5] & 0x80) >> 7);
      if (chargefast == 1){
        if(chargefastValue == 1){
          cr.chargefastValue = "开启";}
        else{
          cr.chargefastValue = "关闭";}}
      else{
        cr.chargefastValue = "不支持";}  

      chargeslow = (((others[5] & 0x10) >> 4));//慢充
      var chargeslowValue = ((others[5] & 0x20) >> 5);
      if (chargeslow == 1){
        if(chargeslowValue == 1){
          cr.chargeslowValue = "开启";}
        else{
          cr.chargeslowValue = "关闭";}}
      else{
        cr.chargeslowValue = "不支持";}        
    }
    else{
      cr.chargefastValue = "不支持";
      cr.chargeslowValue = "不支持";
    }


    return cr;
    // return JSON.stringify(cr);;
  } catch (err) {
    return '';
  }
}

module.exports = {
  //粘包处理
  filterOnePage: filterOnePage,
  //解析一个完整包的数据
  receiveData: receiveData,
  //解析车状态
  parseZisCarStatus: parseZisCarStatus,
  //解析车状态
  analyticStatusNew: analyticStatusNew,
  //解析电量、里程
  parseZisMileRange: parseZisMileRange,
  //解析gps
  parseZisGps: parseZisGps,
  //解析VIN
  parseZisVIN: parseZisVIN,
  //解析油量
  parseZisOIL: parseZisOIL,
}

