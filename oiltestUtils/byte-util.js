/**
 * 工具,一些数组和字符串的转换
 */
const app = getApp();
const logger = require('logger.js');
/**
 * 十六进制转化Array()
 */
function hexStringToArray(s) {
  var typedArray = new Uint8Array(s.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }));
  if(typedArray.length>1)
    return Array.apply(new Array(), typedArray);
  else
    return typedArray
}

function string2buffer(str) {
  // 首先将字符串转为16进制
  let val = ""
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16)
    } else {
      val += str.charCodeAt(i).toString(16)
    }
  }
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}

/**
 * 十六进制转化ArrayBuffer
 */
function hexStringToArrayBuffer(s) {
  var typedArray = new Uint8Array(s.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }));
  return typedArray;
}

/**
 * 字符串转字节数组
 */
function stringToBytes(str) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);  // get char  
    st = [];                 // set up "stack"  
    do {
      st.push(ch & 0xFF);  // push byte to stack  
      ch = ch >> 8;          // shift value down by 1 byte  
    }
    while (ch);
    // add stack contents to result  
    // done because chars have "wrong" endianness  
    re = re.concat(st.reverse());
  }
  // return an array of bytes  
  return re;
}

/**
* 转化一个字节的数组
*/
function shortToSingleBytes(s, asc) {
  var buf = new Array(1);
  buf[0] = s & 0xff;
  return buf;
}

/**
* 转化两个字节的数组
*/
function shortToBytes(s, asc) {
  var buf = new Array(2);
  if (asc)// 高位在前
    for (var i = buf.length - 1; i >= 0; i--) {
      buf[i] = s & 0x00ff;
      s >>= 8;
    }
  else
    for (var i = 0; i < buf.length; i++) {
      buf[i] = s & 0x00ff;
      s >>= 8;
    }
  return buf;
}

/**
 * 转化4个字节数组
 */
function intToBytes(s, asc) {
  var buf = new Array(4);
  if (asc)// 高位在前
    for (var i = buf.length - 1; i >= 0; i--) {
      buf[i] = s & 0x000000ff;
      s >>= 8;
    }
  else
    for (var i = 0; i < buf.length; i++) {
      buf[i] = s & 0x000000ff;
      s >>= 8;
    }
  return buf;
}

/**
  * crc校验
  * CRC_TABLE_XW:CRC余式表
  */
function checkCRC_XW(CRC_TABLE_XW, buff, start, length) {
  var crc = 0xffff;
  for (var i = 0; i < length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE_XW[(crc ^ buff[start + i]) & 0xff];
  }
  return crc;
}


/**
  * crc加密
  * CRC_TABLE_XW:CRC余式表
  */
function crcEncrypt(CRC_TABLE_XW, content, header) {
  var crc = checkCRC_XW(CRC_TABLE_XW, content, 0,
    content.length);
  var crcByte = shortToBytes(crc, false);
  var len = content.length + crcByte.length;
  var lenByte = shortToBytes(len, true);
  return header.concat(lenByte).concat(content).concat(crcByte);
}

/**
  * crc加密
  * CRC_TABLE_XW:CRC余式表
  */
 function crcEncrypt_KTQUpgrade(content) {
  var crc = 0x0000;
  for (var i = 0; i < 128; i++) {
    //crc = (crc >>> 8) ^ app.CRC_TABLE_XW2[(crc ^ content[3 + i]) & 0xff];
    crc = crc ^content[3+i]<< 8;
    for (var j = 0; j < 8; j++)
      if (crc & 0x8000)
          crc = crc << 1 ^ 0x1021;
      else
          crc = crc << 1; 
  }
  var crcByte = shortToBytes(crc, true);
  return crcByte;
}

/**
 * ArrayBuffer转换为Hex
 */
function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * 数组转化int
 */
function bytesToInt(b1, b2, b3, b4) {
  return ((b4 & 0xff) | (b3 & 0xff) << 8 | (b2 & 0xff) << 16 | (b1 & 0xff) << 24);
}

/**
 * 转经纬度
 */
function converTude2Double(bytes, start) {
  var londu = bytes[start] & 0xff;
  var lonfen1 = bytes[start + 1] & 0xff;
  var lonfen2 = (bytes[start + 2] & 0xff) / 100.0;
  var lonfen3 = (bytes[start + 3] & 0xff) / 10000.0;
  var lond = (lonfen1 + lonfen2 + lonfen3) / 60.0;
  return londu + lond;
}

/**
 * 数组转化int
 */
function bytesToShort(b1, b2) {
  return bytesToInt(0, 0, b1, b2);
}

//获取crc值传NO  其它传YES
function getShortWith(data, asc) {
  if (data == null) {
    return 0;
  }
  //Byte* buf = (Byte *)[data bytes];
  var length = data.length;
  var r = 0;

  if (!asc)
    for (var i = length - 1; i >= 0; i--) {
      r <<= 8;
      r |= (data[i] & 0x00ff);
    }
  else
    for (var i = 0; i < length; i++) {
      r <<= 8;
      r |= (data[i] & 0x00ff);
    }
  return r;
}

/**
 * 十六进制字符串转字符串
 */
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x"
      ?
      trimedStr.substr(2)
      :
      trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    console.log("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}

/**
 * arraybuffer 转 string
 */
function buf2string(buffer) {
  var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
  var str = ''
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i])
  }
  return str
}


module.exports = {
  // 十六进制转化Array()
  hexStringToArrayBuffer: hexStringToArrayBuffer,
  // 十六进制转化ArrayBuffer
  hexStringToArray: hexStringToArray,
  // 字符串转ArrayBuffer
  string2buffer: string2buffer,
  // 字符串转字节数组
  stringToBytes: stringToBytes,
  // 转化一个字节的数组
  shortToSingleBytes: shortToSingleBytes,
  // 转化两个字节的数组
  shortToBytes: shortToBytes,
  // 转化4个字节数组
  intToBytes: intToBytes,
  // crc加密
  crcEncrypt: crcEncrypt,
  // ArrayBuffer转换为Hex
  buf2hex: buf2hex,
  //数组转化int
  bytesToInt: bytesToInt,
  //数组转化short
  bytesToShort: bytesToShort,
  //转经纬度
  converTude2Double: converTude2Double,
  //数组转化short
  getShortWith: getShortWith,
  //十六进制转字符串
  hexCharCodeToStr: hexCharCodeToStr,
  //arraybuffer 转 string
  buf2string: buf2string,
  // crc加密(开通器升级)
  crcEncrypt_KTQUpgrade: crcEncrypt_KTQUpgrade,
}
