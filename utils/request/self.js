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
module.exports = {
  u_rentRecord,
  u_sendRentKey
}