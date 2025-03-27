//获取工具类
const utils = require('byte-util.js');
//系统api
const appUtil = require('app-util.js');
//日志
const logger = require('logger.js');

var gWriteService = '';
const WRITE_SERVICE_SHORTHAND = 'FFE5';
var gReadService = '';
const READ_SERVICE_SHORTHAND = 'FFE0';
var gWriteCharacteristic = '';
const WIRTE_CHARACTERISTIC_SHORTHAND = 'FFE9';
var gReadCharacteristic = '';
const READ_CHARACTERISTIC_SHORTHAND = 'FFE4';
//上次执行的时间
var lastExecuteTime = 0;
//设备号
var gIdc = '';
//控制密码
var gPwd = '';
// 当前发送的数据类型
var gSendType = '';
// 蓝牙状态的回调
var gBluetoothState;
// 设备返回数据的回调
var gOnReceiveValue;
//设备idc
var deviceId = '';
//蓝牙适配器是否可用
var available = false;
//是否正在搜索
var discovering = false;
//蓝牙适配器是否已经打开
var isBLEAdapterOpen = false;
//最后一次发送的控制指令
var lastControlCmd = '';
//最后一次发送的指令
var lastSendData = '';
//连接状态
var connected = false;
//所有请求类型
const equireTypeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
//扫描超时时间
const devicesDiscoveryTimeOut = 15000;
//最后一次点击的名称
var lastClickName;
//系统，Android IOS
var systemType = '';
//系统版本
var systemVersion = '';
//重复发送
var sendRepetTimeOut;
//每条指令最大重复发送4次,共发送5次
var sendMaxTime = 4;
//重复发送间隔时间
const repeatSendTime = 100;
//最后一次接受到的数据
var lastReceiverData;
//搜索设备超时
var discoverTimeout

/**
 * 蓝牙状态
 */
var DEFAULT_BLUETOOTH_STATE = {
  //各种错误,可用来关闭dialog
  BLUETOOTH_ERROR: -2,
  //连接失败
  BLUETOOTH_CONNECT_FAILED: -1,
  //连接成功
  BLUETOOTH_CONNECT_SUCESS: 0,
  //蓝牙适配器不可用
  BLUETOOTH_ADAPTER_UNAVAILABLE: 1,
  //打开蓝牙扫描失败
  BLUETOOTH_DEVICES_DISCOVERY_FAILD: 2,
  //频繁调用
  BLUETOOTH_SEND_FREQUENTLY: 3,
  //开始调用senddata发送数据,可以用来显示dialog
  BLUETOOTH_PRE_EXECUTE: 4,
  //没有扫到设备
  BLUETOOTH_NOT_FOUND: 5,
  //不支持BLE
  BLUETOOTH_UNSUPPORTED: 6,
  //发送失败
  BLUETOOTH_SEND_FAILED: 7,
  //无响应
  BLUETOOTH_NO_RESPONSE: 8
};

/**
 * 返回连接状态
 */
function getBLEConnectionState() {
  return connected;
}

/**
 * 返回连接名称
 */
function getBLEConnectionID() {
  return gIdc;
}

/**
 * 监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
 */
function onBLEConnectionStateChange(onStateChanged) {
  wx.onBLEConnectionStateChange(function (res) {
    logger.e(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    onStateChanged(res.connected);
  });
}

/**
 * 停止蓝牙扫描
 */
function stopScanBle() {
  wx.stopBluetoothDevicesDiscovery({
    success: function (res) {
      console.log(res);
      discovering = false;
      logger.e('stopScanBle-true discovering:' + discovering);
    },
    fail: function (res) {
      console.log(res);
      discovering = false;
      logger.e('stopScanBle-false discovering:' + discovering);
    }
  })
}

/**
 * 监听蓝牙适配器状态变化事件
 */
function onBluetoothAdapterStateChange() {
  wx.onBluetoothAdapterStateChange(function (res) {
    logger.e(`adapterState changed, now is`, res);
    setBLEAdapterState(res.available, res.discovering);
  })
}

/**
 * 设置adapter状态
 */
function setBLEAdapterState(ava, discovery) {
  available = ava;
  discovering = discovery;
}

/**
 * 打开蓝牙适配器
 */
function openBluetoothAdapter(cOpenBluetoothAdapter) {
  wx.openBluetoothAdapter({
    success: function (res) {
      console.log(res);
      isBLEAdapterOpen = true;
      cOpenBluetoothAdapter(true);
    },
    fail: function (res) {
      console.log(res);
      isBLEAdapterOpen = false;
      setBLEAdapterState(false, false);
      cOpenBluetoothAdapter(false);
    }
  })
}

/**
 * 蓝牙适配器是否可用
 */
function isBLEAdapterAvailable(onResult) {
  if (isBLEAdapterOpen) {
    //适配器已经打开
    //获取适配器状态
    if (!available) {
      getBluetoothAdapterState(function (res) {
        setBLEAdapterState(res.available, res.discovering);
        onResult(res.available);
      });
    } else {
      onResult(available);
    }
  } else {
    //打开适配器
    openBluetoothAdapter(function (openSuccess) {
      if (openSuccess) {
        getBluetoothAdapterState(function (res) {
          setBLEAdapterState(res.available, res.discovering);
          onResult(res.available);
        });
      } else {
        onResult(openSuccess);
      }
    });
  }
}

/**
 * 开始搜索
 */
function startBluetoothDevicesDiscovery() {
  //开始搜索
  wx.startBluetoothDevicesDiscovery({
    //services: [WRITE_SERVICE_SHORTHAND],
    success: function (res) {
      console.log(res);
      discovering = res.isDiscovering;
    },
    fail: function (res) {
      console.log(res);
      discovering = res.isDiscovering;
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_DEVICES_DISCOVERY_FAILD);
    }
  });
  discoverTimeout = setTimeout(function () {
    if (discovering) {
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND);
      stopScanBle();
      if (isBLEAdapterOpen) {
        logger.e('关闭适配器');
        closeBluetoothAdapter();
      }
    }
  }, devicesDiscoveryTimeOut);
}

/**
 * 获取BleAdapter状态
 */
function getBluetoothAdapterState(onBleAdapterState) {
  wx.getBluetoothAdapterState({
    success: function (res) {
      onBleAdapterState(res);
    }, fail: function (res) {
      onBleAdapterState(res);
    }
  })
}

/**
 * 断开蓝牙连接
 */
function disConnect() {
  wx.closeBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      console.log(res);
      connected = false;
    },
    fail: function (res) {
      console.log(res);
    }
  })
}

/**
 * 关闭蓝牙模块，使其进入未初始化状态
 */
function closeBluetoothAdapter() {
  wx.closeBluetoothAdapter({
    success: function (res) {
      console.log(res);
      isBLEAdapterOpen = false;
    }, fail: function (res) {
      console.log(res)
    }
  })
}

/**
 * 向低功耗蓝牙设备特征值中写入二进制数据
 */
function writeBLECharacteristicValue(buffer, writeBLECharacteristicValue) {
  wx.writeBLECharacteristicValue({
    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
    deviceId: deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: gWriteService,
    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
    characteristicId: gWriteCharacteristic,
    // 这里的value是ArrayBuffer类型
    value: buffer,
    success: function (res) {
      writeBLECharacteristicValue(true);
    },
    fail: function (res) {
      console.log(res);
      writeBLECharacteristicValue(false);
    }
  });
}

/**
 * 开始连接
 */
function startConnect() {
  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      /**
      * 连接成功，后开始获取设备的服务列表
      */
      gWriteService = '';
      gWriteCharacteristic = '';
      gReadService = '';
      gReadCharacteristic = '';
      getBLEDeviceServices();
    },
    fail: function (res) {
      //连接失败
      console.log(res);
    }
  })
}

/**
 * 获取设备的服务列表
 */
function getBLEDeviceServices() {
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      for (var i = 0; i < res.services.length; i++) {
        if (res.services[i].uuid.indexOf(WRITE_SERVICE_SHORTHAND) != -1) {
          gWriteService = res.services[i].uuid;
        }
        if (res.services[i].uuid.indexOf(READ_SERVICE_SHORTHAND) != -1) {
          gReadService = res.services[i].uuid;
        }
      }
      logger.e('device设备的读服务id:', gWriteService);
      logger.e('device设备的写服务id:', gReadService);
      if (gWriteService != '' && gReadService != '' && (gWriteCharacteristic == '' || gReadCharacteristic == '')) {
        getBLEDeviceReadCharacteristics();
      }
    }
  })
}

/**
 * 获取蓝牙设备某个服务中的所有 characteristic（特征值）
 */
function getBLEDeviceReadCharacteristics() {
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: gReadService,
    success: function (res) {
      for (var i = 0; i < res.characteristics.length; i++) {
        if (res.characteristics[i].uuid.indexOf(READ_CHARACTERISTIC_SHORTHAND) != -1) {
          gReadCharacteristic = res.characteristics[i].uuid;
        }
      }
      logger.e('device设备的读特征值id:' + gReadCharacteristic);
      if (gReadCharacteristic != '') {
        notifyBLECharacteristicValueChange();
      }

    }, fail: function (res) {
      console.log(res);
    }
  })
}

/**
 * 启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
 */
function notifyBLECharacteristicValueChange() {
  wx.notifyBLECharacteristicValueChange({
    deviceId: deviceId,
    serviceId: gReadService,
    characteristicId: gReadCharacteristic,
    state: true,
    success: function (res) {
      console.log(res);
      if (gWriteCharacteristic == '') {
        getBLEDeviceWriteCharacteristics();
      }
      appUtil.getSystemInfoComplete(function (res) {
        var system = res.system;
        var blankIndex = system.indexOf(' ');
        var pointIndex = system.indexOf('.');
        if (blankIndex != -1 && pointIndex != -1) {
          systemType = system.substring(0, blankIndex);
          systemVersion = system.substring(blankIndex + 1, pointIndex + 2);
        }
      }, function () {
        //判断版本是否支持
        console.log(
          wx.getBLEMTU({
            deviceId: deviceId,
          }));
          wx.setBLEMTU({
            deviceId: deviceId,
            mtu: 240,
            success: function(res){
              console.log("MTU modify success");
            },
            fail: function(res){
              console.log("MTU modify fail");
            }
          })
        // if (systemType.toLowerCase() == 'android' && systemVersion > 8) {
        //   wx.setBLEMTU({
        //     deviceId: 'deviceId',
        //     mtu: 23,
        //     success: function(res){
        //       console.log(res);
        //     },
        //     fail: function(res){
        //       console.log(res);
        //     }
        //   })
        // } 
      })
      
    },
    fail: function (res) {
      console.log(res);
    },
  });
}

/**
 * 获取写的特征值
 */
function getBLEDeviceWriteCharacteristics() {
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: gWriteService,
    success: function (res) {
      for (var j = 0; j < res.characteristics.length; j++) {
        if (res.characteristics[j].uuid.indexOf(WIRTE_CHARACTERISTIC_SHORTHAND) != -1) {
          gWriteCharacteristic = res.characteristics[j].uuid;
          //写出数据
          // if (equireTypeArray.indexOf(gSendType) != -1) {
          //   sendMyData(gIdc, gPwd, gSendType, gBluetoothState, gOnReceiveValue, false);
          // }
        }
      }
      logger.e('device设备的写特征值id:' + gWriteCharacteristic);
    }, fail: function (res) {
      console.log(res);
    }
  })
}

/**
 * 获取设备发过来的数据
 */
function onBLECharacteristicValueChange() {
  wx.onBLECharacteristicValueChange(function (characteristic) {
    var resultArrayBufferData = characteristic.value;
    var receiverHexData = utils.buf2hex(resultArrayBufferData);
    var arrayData = utils.hexStringToArray(receiverHexData);
    logger.e('characteristic array value:', arrayData + "  hex value:" + receiverHexData);
    gOnReceiveValue(utils.hexCharCodeToStr(receiverHexData));
    logger.e('text', utils.hexCharCodeToStr(receiverHexData));
  })
}

/**
 * 监听寻找到新设备的事件
 */
function onBluetoothDeviceFound() {
  //安卓手机6.0系统及以上 必须开启微信定位权限才能使用 蓝牙搜索功能
  wx.onBluetoothDeviceFound(function (devices) {
    logger.e('device found:' + devices.devices[0].name);
    if (gIdc == devices.devices[0].name || gIdc == devices.devices[0].localName ||
      utils.hexCharCodeToStr(utils.buf2hex(devices.devices[0].advertisData)).indexOf(gIdc) != -1) {
      deviceId = devices.devices[0].deviceId;
      //监听连接状态
      onBLEConnectionStateChange(function (connectState) {
        //设置连接状态
        connected = connectState;
        if (connectState) {
          gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS);
        } else {
          gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
          //gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED);
          //releaseBle();
        }
      });
      /**
       * 监听蓝牙适配器状态
       */
      onBluetoothAdapterStateChange();
      /**
       * 获取设备发过来的数据
       */
      onBLECharacteristicValueChange();
      //停止扫描
      stopScanBle();
      clearTimeout(discoverTimeout);
      if (!isQuickStart('onBluetoothDeviceFound')) {
        startConnect(gPwd, gSendType, gBluetoothState, gOnReceiveValue);
      }
    }
  })
}

/**
 * 单位时间内禁止重复操作
 */
function isQuickStart(quickName) {
  var isQuick = false;
  var currentTime = new Date().getTime();
  if (lastClickName == quickName && currentTime - lastExecuteTime < 800) {
    console.log("禁止重复操作");
    isQuick = true;
  }
  lastExecuteTime = currentTime;
  lastClickName = quickName;
  return isQuick;
}

/**
 * 是否需要扫描
 */
function needScan() {
  return deviceId == '';
}

/**
 * 初始化数据
 */
function initSendData(idc, pwd, sendType, bluetoothState, onReceiveValue) {
  if (gPwd != pwd) {
    gPwd = pwd;
  }
  if (gSendType != sendType) {
    gSendType = sendType;
  }
  if (gBluetoothState != bluetoothState) {
    gBluetoothState = bluetoothState;
  }
  if (gOnReceiveValue != onReceiveValue) {
    gOnReceiveValue = onReceiveValue;
  }
  if (gIdc != idc) {
    gIdc = idc;
  }
  onBluetoothDeviceFound();
  sendMaxTime = 4;
}

/**
 * 判断是否支持ble
 */
function isSupportedBLE(isSupported) {
  if (!systemType) {
    appUtil.getSystemInfoComplete(function (res) {
      var system = res.system;
      var blankIndex = system.indexOf(' ');
      var pointIndex = system.indexOf('.');
      if (blankIndex != -1 && pointIndex != -1) {
        systemType = system.substring(0, blankIndex);
        systemVersion = system.substring(blankIndex + 1, pointIndex + 2);
      }
    }, function () {
      //判断版本是否支持
      if (systemType.toLowerCase() == 'android' && systemVersion < 4.3) {
        //不支持
        isSupported(false);
      } else {
        isSupported(true);
      }
    });
  } else {
    //判断版本是否支持
    if (systemType.toLowerCase() == 'android' && systemVersion < 4.3) {
      //不支持
      isSupported(false);
    } else {
      isSupported(true);
    }
  }
}


function connectMyBLE(idc, bluetoothState, onReceiveValue, isIntercept) {
  if (isIntercept && isQuickStart('sendMyData')) {
    console.log('不可以频繁点击');
    bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FREQUENTLY);
    return;
  }
  if (isIntercept) {
    //用户的主动行为
    bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE);
  }
  initSendData(idc, "", "", bluetoothState, onReceiveValue);

  if (connected) {
    // 已连接，发送数据
    // dispatcherSend(parseCmd(), false);
  } else {
    isSupportedBLE(function (isSupported) {
      if (isSupported) {
        isBLEAdapterAvailable(function (ava) {
          if (ava) {
            if (needScan()) {
              //适配器可用，并已经打开适配器
              startBluetoothDevicesDiscovery();
            } else {
              //开始连接
              startConnect();
            }
          } else {
            //适配器不可用
            gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
            gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE);
          }
        });
      } else {
        bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
        bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED);
      }
    });
  }
}
/**
 * 发送数据
 * idc:设备名称
 * pwd:控制密码
 * sendType:发送类型
 * bluetoothState:蓝牙状态
 * onReceiveValue:接收数据
 */
function connectBLE(idc, bluetoothState, onReceiveValue) {
  connectMyBLE(idc, bluetoothState, onReceiveValue, true);
}

/**
 * 最大每次发送20个字节
 * sendData：十六进制字符串
 * noRepeat:6001指令不需要应答
 */
function dispatcherSend(sendData, noRepeat) {
  lastSendData = sendData;
  var dataLength = sendData.length;
  var num = dataLength / 40;
  if (num == 0) {
    send(sendData.substring(num, dataLength));
  } else {
    for (var i = 0; i < num; i++) {
      var start = i * 40;
      var end = start + 40;
      end = end > dataLength ? dataLength : end;
      var data = sendData.substring(start, end);
      delaySend(data, noRepeat);
    }
  }
}

/**
 * 延时发送，不要超过150ms
 */
function delaySend(data, noRepeat) {
  var d = data;
  setTimeout(function () {
    send(d, noRepeat);
  }, 10);
}

/**
 * 发送数据
 * hex:十六进制字符串
 */
function send(hex, noRepeat) {
  //发送数据
  var buffer = utils.string2buffer(hex);
  //var buffer = typedArray.buffer
  logger.e("发送数据：" + hex);
  logger.e(buffer);
  writeBLECharacteristicValue(buffer, function (isSuccess) {
    if (isSuccess) {
      logger.e("指令发送成功:" + (new Date().getTime()));
      // if(noRepeat) 
      //   releaseBle();
      // else
      //   sendRepet(true, noRepeat);
    } else {
      logger.e("指令发送失败:" + (new Date().getTime()));
      // sendRepet(false, noRepeat);
    }
  });
}


/**
 * 释放资源
 */
function releaseBle() {
  //判断是否在扫描
  if (discovering) {
    logger.e('停止扫描');
    stopScanBle();
  };
  //判断是否连接
  if (connected) {
    logger.e('断开连接');
    disConnect();
  };
  if (isBLEAdapterOpen) {
    logger.e('关闭适配器');
    closeBluetoothAdapter();
  }
  releaseData();
}

/**
 * 释放数据
 */
function releaseData() {
  deviceId = '';
}

module.exports = {
  connectBLE: connectBLE,
  releaseBle: releaseBle,
  dispatcherSend: dispatcherSend,
  DEFAULT_BLUETOOTH_STATE: DEFAULT_BLUETOOTH_STATE,
  getBLEConnectionState: getBLEConnectionState,
  getBLEConnectionID: getBLEConnectionID,
}