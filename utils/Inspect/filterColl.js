/**
 * 定义工单状态的常量值
 */
const STATUS = {
  ALL: null,
  PENDING_ACCEPTANCE: 1,
  AWAITING_CONFIRMATION: 2,
  ACCEPTED: 3,
  IN_PROGRESS: 4,
  AWAITING_INSPECTION: 5,
  COMPLETED: 6,
  CANCELLED: 7
};

/**
 * 工单委托所有状态
 */
const filterWorkStatus = [
  { value: STATUS.ALL, name: '全部' },
  { value: STATUS.PENDING_ACCEPTANCE, name: '待接单' },
  { value: STATUS.AWAITING_CONFIRMATION, name: '待确认' },
  { value: STATUS.ACCEPTED, name: '已接单' },
  { value: STATUS.IN_PROGRESS, name: '进行中' },
  { value: STATUS.AWAITING_INSPECTION, name: '待验收' },
  { value: STATUS.COMPLETED, name: '已完结' },
  { value: STATUS.CANCELLED, name: '已取消' }
];

/**
 * 工单时间筛选选项
 */
const filterWorkTime = [
  { value: '', name: '全部' },
  { value: 1, name: '1天' },
  { value: 3, name: '3天' },
  { value: 7, name: '7天' },
  { value: 30, name: '1个月' },
  { value: 90, name: '3个月' },
  { value: 180, name: '6个月' },
  { value: 365, name: '1年' }  
];
const orderStatus = [
  { status: 1, text: '待接单', colorClass: 'color-F56F48' },
  { status: 2, text: '进行中', colorClass: 'color-4587FD' },
  { status: 3, text: '待验收', colorClass: 'color-FBA851' },
  { status: 4, text: '已完结', colorClass: 'color-20C609' },
  { status: 5, text: '已取消', colorClass: 'color-797979' }
]
const macckStatus=[
    { status: 1, text: '待发货', color: '#1890FF' },      // 科技蓝 - 表示进行中的标准状态
    { status: 2, text: '待收货', color: '#52C41A' },      // 活力绿 - 表示即将完成的积极状态
    { status: 3, text: '已完成', color: '#2D8E00' },      // 深绿色 - 表示最终完成的稳定状态
    { status: 4, text: '已取消', color: '#909399' },      // 中性灰 - 表示失效/终止状态
    { status: 5, text: '待适配确认', color: '#722ED1' },  // 典雅紫 - 表示特殊流程状态
    { status: 6, text: '待支付', color: '#F5222D' },      // 警示红 - 强调需要立即操作
    { status: 7, text: '待安装', color: '#722ED1' }       // 与适配确认保持同色系，表示关联流程
]
/**
 * 导出过滤器配置
 */
export default {
  STATUS,        
  filterWorkStatus, 
  filterWorkTime,
  orderStatus,
  macckStatus
};