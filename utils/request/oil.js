const fin3plusUrl = '';

const u_dipsticHistory = {
  URL: fin3plusUrl + 'oilDipstickapi/dipsticHistory',
  chargeStatus: 'chargeStatus', //收费状态 【全部 '' 未收费-1  不收费 0 已收费1】
  days: 'days',
  param: 'param',
  vehId: 'vehId',
  rentStatus: 'rentStatus', //【全部 ''  起租0  还租1 】
  page: 'page'
}
const u_setChargeStatus = {
  URL: fin3plusUrl + 'oilDipstickapi/setChargeStatus',
  oilRecordId:'oilRecordId',
  chargeStatus:'chargeStatus',
  realCost:'realCost'
}





module.exports = {
  u_dipsticHistory,
  u_setChargeStatus
}