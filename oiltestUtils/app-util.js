


/**
 * 授权类型
 */
var SCOPE_TYPE = {
  SCOPE_LOCATION: 'scope.userLocation'
};


/**
 * 显示吐司
 */
function showToast(msg) {
  wx.showToast({
    title: msg,
    icon: 'none'
  })
}

/**
 * 显示'success'图标的吐司
 */
function showSucessToast(msg) {
  wx.showToast({
    title: msg,
    icon: 'success'
  })
}

/**
 * 显示加载框
 */
function showLoading(msg) {
  wx.showLoading({
    title: msg,
    mask: true
  })
}

/**
 * 关闭加载框
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确定取消对话框
 */
function showModal(msg, showCancel, behavior) {
  wx.showModal({
    title: '提示',
    content: msg,
    showCancel: showCancel,
    success: function (res) {
      if (res.confirm) {
        behavior(true);
      } else if (res.cancel) {
        behavior(false);
      }
    }
  })
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTimeTwo(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
      format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
/**
 * 获取系统信息
 */
function getSystemInfo(systemInfo) {
  wx.getSystemInfo({
    success: function (res) {
      systemInfo(res);
    }
  })
}

function getSystemInfoComplete(systemInfo, complete) {
  wx.getSystemInfo({
    success: function (res) {
      systemInfo(res);
    }, complete: function () {
      complete();
    }
  })
}

/**
 * 获取腾讯地图坐标
 */
function getWXLocation(location) {
  // wx.getLocation({
  //   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
  //   success: function (res) {
  //     location(res);
  //   }, fail: function (res) {
  //     location(res);
  //   }
  // })
}

/**
 * 是否授权
 */
function getAuthState(scope, auth) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting[scope]) {
        //未授权
        auth(false);
      } else {
        //已授权
        auth(true);
      }
    }
  })
}

/**
 * 开始授权
 */
function authorize(scope, authorize) {
  wx.authorize({
    scope: scope,
    success() {
      //授权成功
      authorize(true);
    }, fail() {
      //授权失败
      authorize(false);
    }
  })
}

/**
 * get请求
 */
function byGet(url, param, result) {
  return wx.request({
    url: url,
    data: param,
    success: function (res) {
      result(res);
      // console.log(res.data)
    }, fail: function (res) {
      result(res);
    }
  })
}

/**
 * post请求
 */
function byPost(url, param, result) {
  return wx.request({
    url: url, //仅为示例，并非真实的接口地址
    data: param,
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    method: 'POST',
    success: function (res) {
      result(res);
      // console.log(res.data)
    }, fail: function (res) {
      result(res);
    }
  })
}

/**
 * 获取本地数据,异步
 */
function getStorage(key, data) {
  if (key) {
    wx.getStorage({
      key: key,
      success: function (res) {
        data(res.data);
      }, fail: function (res) {
        data(res.data);
      }
    })
  } else {
    data('');
  }
}

/**
 * 保存本地数据,异步
 */
function setStorage(key, value) {
  wx.setStorage({
    key: key,
    data: value
  })
}

/**
 * 清缓存
 */
function clearStorage() {
  wx.clearStorage();
}

/**
 * 获取网络状态
 */
function getNetworkType(getNetworkType) {
  wx.getNetworkType({
    success: function (res) {
      // 返回网络类型, 有效值：
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      // var networkType = res.networkType
      getNetworkType(res.networkType != 'none');
    }, fail: function (res) {
      getNetworkType(true);
    }
  })
}

/**
 * 监听网络状态变化
 */
function onNetworkStatusChange(onNetworkStatusChange) {
  wx.onNetworkStatusChange(function (res) {
    // console.log(res.isConnected);
    // console.log(res.networkType);
    onNetworkStatusChange(res);
  })
}

/**
 * 打开地图导航
 */
function openLocation(latitude, longitude, scale) {
  wx.openLocation({
    latitude: latitude,
    longitude: longitude,
    scale: scale ? scale : 18
  })
}

//判断变量性质
function isEmpty(obj) {
    if (typeof obj == "undefined" || obj == null || obj == "" || !obj) {
      return true;
    } else {
      return false;
    }
  }

//DES加密
function encryptByDES(message, key){
  var keyHex = CryptoJS.enc.Utf8.parse(key);
  var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
  });
  return encrypted.ciphertext.toString();
}

//DES解密
function decryptByDES(ciphertext, key){
  var keyHex = CryptoJS.enc.Utf8.parse(key);
  var decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
  }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
  });
  var result_value = decrypted.toString();
  return result_value;
}

//AES加密
function encryptByAES(message, key){
  var messageHex = CryptoJS.enc.Hex.parse(message);
  var keyHex = CryptoJS.enc.Utf8.parse(key);
  var encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.ZeroPadding
  });
  return encrypted.ciphertext.toString();
}

module.exports = {
  showToast: showToast,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showSucessToast: showSucessToast,
  showModal: showModal,
  getSystemInfo: getSystemInfo,
  getSystemInfoComplete: getSystemInfoComplete,
  byGet: byGet,
  byPost: byPost,
  SCOPE_TYPE: SCOPE_TYPE,
  getAuthState: getAuthState,
  authorize: authorize,
  getStorage: getStorage,
  setStorage: setStorage,
  clearStorage: clearStorage,
  getNetworkType: getNetworkType,
  onNetworkStatusChange: onNetworkStatusChange,
  openLocation: openLocation,
  isEmpty: isEmpty,
  formatTimeTwo: formatTimeTwo,
  encryptByDES: encryptByDES,
  decryptByDES: decryptByDES,
  encryptByAES: encryptByAES
}