// 辅助函数：检查对象是否为空
function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function isLogin() {
  const userInfo = getApp().data.userInfo;
  if (isEmpty(userInfo)) {
    return false;
  } else {
    return true;
  }

}
/**
 * 发送GET请求
 * @param {string} url - 请求的URL
 * @param {Object} param - 请求参数
 * @returns {Promise} - 返回一个Promise对象
 */
function byGet(url, param) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL'));
      return;
    }
    if (typeof param !== 'object') {
      param = {};
    }
    const header = {
      'content-type': 'application/x-www-form-urlencoded'
    };
    const appInstance = getApp();
    const userInfo = appInstance.data.userInfo;
    header['funAreaId'] = appInstance?.data?.funAreaId
    if (userInfo && !isEmpty(userInfo)) {
      header['username'] = userInfo.username;
      header['token'] = userInfo.token;
      header['timestamp'] = Date.now();
    }
    param.version = appInstance.data.version;
    wx.request({
      url: url,
      data: param,
      header: header,
      method: 'GET',
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        console.error('Request failed:', err);
        reject(err);
      }
    });
  });
}

/**
 * 发起POST请求，并添加公共参数
 * @param {string} url - 请求的URL
 * @param {Object} param - 请求的数据
 * @param {Function} resultCallback - 请求成功或失败后的回调函数
 * @param {Object} [customHeaders] - 自定义请求头（可选）
 */
function byPost(url, param, resultCallback, customHeaders = {}) {
  const userInfo = getApp().data.userInfo;
  const defaultHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
  };
  if (userInfo && !isEmpty(userInfo)) {
    Object.assign(defaultHeaders, {
      username: userInfo.username,
      token: userInfo.token,
      timestamp: Date.now(),
      funAreaId: getApp()?.data?.funAreaId
    });
  }
  const headers = {
    ...defaultHeaders,
    ...customHeaders
  };
  wx.request({
    timeout: 20000,
    url: url,
    data: param,
    header: headers,
    method: 'POST',
    success: function (res) {
      resultCallback(res);
    },
    fail: function (err) {
      resultCallback({
        success: false,
        error: err
      });
    }
  });
}


function byPostJson(url, param, result) {
  //添加公共参数
  var header = {};
  header['content-type'] = 'application/json';
  var userInfo = getApp().data.userInfo;
  if (!isEmpty(userInfo)) {
    header['username'] = userInfo.username;
    header['token'] = userInfo.token;
    header['timestamp'] = Date.parse(new Date());
  }
  return wx.request({
    timeout: 20000,
    url: url, //仅为示例，并非真实的接口地址
    data: param,
    header: header,
    method: 'POST',
    success: function (res) {
      result(res);

    },
    fail: function (res) {

      result(false);

    }
  })
}


module.exports = {
  isEmpty: isEmpty,
  isLogin: isLogin,
  byGet: byGet,
  byPost: byPost,
  byPostJson: byPostJson,

}