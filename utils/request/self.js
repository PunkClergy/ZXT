const fin3plusUrl = '';
// 电子钥匙发送记录
const u_rentRecord = {
  URL: fin3plusUrl + 'rentKeyApi/rentRecord',
  vehId: 'vehId',
  page: 'page',
  comParam: 'comParam'
}
// 派发记录
const u_keyListKey={
  URL: fin3plusUrl + "keyLendReturnApi/keyList",
}
const u_sendRentKey = {
  URL: fin3plusUrl + "rentKeyApi/sendRentKey",
}
const u_bindOrUpdateDriver = {
  URL: fin3plusUrl + "rentKeyApi/bindOrUpdateDriver",
}
// 解绑车辆和司机关系
const u_unBindDriver={
  URL: fin3plusUrl + "rentKeyApi/unBindDriver",
}
// 取消电子钥匙
const u_cancelRentKey = {
  URL: fin3plusUrl + "rentKeyApi/cancelRentKey",
  controlCode: 'controlCode'
}
// 归还物理钥匙
const u_employeeReturn = {
  URL: fin3plusUrl + "/keyLendReturnApi/employeeReturn",
}

const u_addOrUpdateKey ={
  URL: fin3plusUrl + "keyLendReturnApi/addOrUpdate",
  controlCode: 'controlCode'
}
// 派发钥匙
module.exports = {
  u_employeeReturn,
  u_unBindDriver,
  u_bindOrUpdateDriver,
  u_cancelRentKey,
  u_rentRecord,
  u_sendRentKey,
  u_addOrUpdateKey,
  u_keyListKey
}