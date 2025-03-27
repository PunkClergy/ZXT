const appUtil = require('app-util.js');
const writeToLogFile = true;

function e(tag, msg) {
  if (msg) {
    console.log(tag, msg);
  } else {
    console.log(tag);
  }
  if (writeToLogFile) {
    if (msg) {
      writeLogFile(getDataString(tag + " " + msg));
    } else {
      writeLogFile(getDataString(tag));
    }
  }
}

function clear() {
  wx.setStorage({
    key: 'log',
    data: ''
  })
}

function upload() {
  wx.uploadFile({
    url: 'https://cloud.wiselink.net.cn:8805/ErrorReport.ashx', //仅为示例，非真实的接口地址
    filePath: tempFilePaths[0],
    name: 'file',
    formData: {
      'user': 'test'
    },
    success: function (res) {
      var data = res.data
      //do something
    }
  })
}

function getDataString(msg) {
  var d = new Date();
  var formatData = 'MM-dd HH:mm:ss SSS ' + msg + '\n';
  var data = formatData.replace("yyyy", d.getFullYear()).replace("MM", fillZero(d.getMonth() + 1)).replace("dd", fillZero(d.getDate())).replace("HH", fillZero(d.getHours())).replace("mm", fillZero(d.getMinutes())).replace("ss", fillZero(d.getSeconds())).replace("SSS", d.getMilliseconds());
  return data;
}

function getDateString(timestamp) {
  var d = new Date(timestamp);
  var formatData = 'yyyy-MM-dd HH:mm:ss';
  var data = formatData.replace("yyyy", d.getFullYear()).replace("MM", fillZero(d.getMonth() + 1)).replace("dd", fillZero(d.getDate())).replace("HH", fillZero(d.getHours())).replace("mm", fillZero(d.getMinutes())).replace("ss", fillZero(d.getSeconds())).replace("SSS", d.getMilliseconds());
  return data;
}

//填充0    
function fillZero(value) {
  if (value.toString().length < 2) {
    return "0" + value;
  }
  return value;
}

function writeLogFile(msg) {
  try {
    var value = wx.getStorageSync('log')
    if (value) {
      try {
        var data = value + msg;
        var length = data.length;
        if (length > 5 * 1024) {
          wx.setStorageSync('log', data.substring(4 * 1024));
        } else {
          wx.setStorageSync('log', data);
        }
      } catch (e) {
      }
    } else {
      try {
        wx.setStorageSync('log', msg)
      } catch (e) {
      }
    }
  } catch (e) {

  }
}

module.exports = {
  e: e,
  clear: clear,
  getDateString: getDateString,
}