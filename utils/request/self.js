const fin3plusUrl = '';
// 电子钥匙发送记录
const u_rentRecord = {
  URL: fin3plusUrl + 'rentKeyApi/rentRecord',
  vehId: 'vehId',
  page: 'page'
}
const u_sendRentKey = {
  URL: fin3plusUrl + "rentKeyApi/sendRentKey",
}
// 取消电子钥匙
const u_cancelRentKey = {
  URL: fin3plusUrl + "rentKeyApi/cancelRentKey",
  controlCode: 'controlCode'
}

module.exports = {
  u_cancelRentKey,
  u_rentRecord,
  u_sendRentKey
}