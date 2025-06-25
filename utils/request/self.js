const fin3plusUrl = '';
// 电子钥匙发送记录
const u_rentRecord = {
  URL: fin3plusUrl + 'rentKeyApi/rentRecord',
  vehId: 'vehId',
  page: 'page',
  comParam: 'comParam'
}
const u_sendRentKey = {
  URL: fin3plusUrl + "rentKeyApi/sendRentKey",
}
const u_bindOrUpdateDriver = {
  URL: fin3plusUrl + "rentKeyApi/bindOrUpdateDriver",
}
// 取消电子钥匙
const u_cancelRentKey = {
  URL: fin3plusUrl + "rentKeyApi/cancelRentKey",
  controlCode: 'controlCode'
}

module.exports = {
  u_bindOrUpdateDriver,
  u_cancelRentKey,
  u_rentRecord,
  u_sendRentKey
}