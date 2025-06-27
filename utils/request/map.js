const fin3plusUrl = '';
// 获取车辆状态
const u_getCarStatus = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getCarStatus',
  sn: 'sn'
}

// 远程控车

const u_operation = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/operation',
  operationType: 'operationType',
  sn: 'sn',
  code: 'code',
}
// 当前位置
const u_getCarPoisiton = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getCarPoisiton',
  sn: 'sn'
}
const u_getTrackPlayback = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getTrackPlayback',
  sn: 'sn',
  startDate: 'startDate',
  endDate: 'endDate'
}

// 获取openID
const u_getOpenIdUrl = {
  URL: fin3plusUrl + "wx/getOpenId",
  CODE: 'code',
  APP: 'app'
}
// 请求车辆位置
const u_RequestCarList = {
  REQUEST_API: fin3plusUrl + 'renterApi/getCarPoisitonByCode',
  MANAGERID: 'managerId',
  CODE: 'code',
  OPENID: 'openId',
}
// 获取当前账号所有车辆
const u_getAllCarPoisiton = {
  URL: fin3plusUrl + "carapi/getAllCarPoisiton",
}
module.exports = {
  u_getCarStatus,
  u_operation,
  u_getCarPoisiton,
  u_getTrackPlayback,
  u_RequestCarList,
  u_getOpenIdUrl,
  u_getAllCarPoisiton
}