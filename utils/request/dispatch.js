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
module.exports = {
  u_dispatchWork,
  u_bDList,
  u_companyList,
  u_nodeDetailGroupList,
}