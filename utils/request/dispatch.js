const fin3plusUrl = '';
// 派工消息总列表
const u_nodeDetailGroupList = {
  URL: fin3plusUrl + "addressapi/nodeDetailGroupList",
  comParam: 'comParam',
  page: 'page'
}
// 客户列表
const u_companyList = {
  URL: fin3plusUrl + "addressapi/companyList",
  name: 'name',
  page: 'page'
}
// BD列表
const u_bDList = {
  URL: fin3plusUrl + "addressapi/bDList",
  name: 'name',
  page: 'page'
}
// 派工
const u_dispatchWork = {
  URL: fin3plusUrl + "addressapi/dispatchWork",
  companyType: 'companyType',
  companyId: 'companyId',
  companyName: 'companyName',
  content: 'content',
  bdId: 'bdId',
}
// 派工信息
const u_nodeDetailList = {
  URL: fin3plusUrl + "addressapi/nodeDetailList",
  read: 'read',
  companyId: 'companyId',
}
// 发送消息
const u_nodeSubmit = {
  URL: fin3plusUrl + "addressapi/nodeSubmit",
  read: 'read',
  companyId: 'companyId',
}
// 我的二维码
const u_qrcode = {
  URL: fin3plusUrl + "companyapi/qrcode",
}
module.exports = {
  u_qrcode,
  u_nodeSubmit,
  u_nodeDetailList,
  u_dispatchWork,
  u_bDList,
  u_companyList,
  u_nodeDetailGroupList,
}