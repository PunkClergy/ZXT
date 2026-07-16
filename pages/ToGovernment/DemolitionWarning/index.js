const {
  byGet,
  byPost
} = require('../../../utils/request/http');
const {
  u_dismantleAlarmList
} = require('../../../utils/request/data_info');
const {
  showToast
} = require('../../../utils/Inspect/tips');

Page({
  data: {
    isSubscribed: false,
    totalCount: 0,
    todayCount: 0,
    warningRecords: [],
    showFilterModal: false,
    selectedDate: '',
    inputCarNumber: '',
    carCandidateList: [],
    focusCarInput: false,
    filteredRecords: []
  },

  onLoad() {
    this.handleCarList();
  },

  // 请求数据列表
  handleCarList(inputCarNumber, selectedDate) {
    const _this = this;
    const temp = {
      plateNumber: inputCarNumber || '',
      startDate: selectedDate || ''
    };
    byGet(`${getApp().data.k1swUrl}${u_dismantleAlarmList.URL}`, {
        ...temp
      })
      .then(response => {
        if (response.data.code == 1000) {
          const list = response.data.content || [];
          const today = new Date().toLocaleDateString();
          const todayCount = list.filter(item => {
            if (!item.alarmtime) return false;
            const itemDate = new Date(item.alarmtime).toLocaleDateString();
            return itemDate == today;
          }).length;
          const isAllEmpty = !inputCarNumber && !selectedDate;

          this.setData({
            warningRecords: list,
          }, () => {
            _this.setData({
              filteredRecords: [..._this.data.warningRecords],
              inputCarNumber: '',
              selectedDate: '',
              totalCount: isAllEmpty ? response.data?.count : _this.data.totalCount,
              todayCount: isAllEmpty ? todayCount : _this.data.todayCount
            });
            _this.closeFilterModal();
          });
        }
      })
      .catch(err => {
        console.error('请求失败', err);
        showToast('数据加载失败');
      });
  },

  // 打开筛选弹窗
  openFilterModal() {
    this.setData({
      showFilterModal: true,
      focusCarInput: true
    });
  },

  // 关闭筛选弹窗
  closeFilterModal() {
    this.setData({
      showFilterModal: false,
      carCandidateList: []
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    });
  },

  // 车牌号实时输入
  onCarNumberInput(e) {
    const inputVal = e.detail.value?.trim()?.toUpperCase();
    this.setData({
      inputCarNumber: inputVal
    });

    if (!inputVal) {
      this.setData({
        carCandidateList: []
      });
      return;
    }

    const {
      warningRecords
    } = this.data;
    const candidateList = warningRecords.filter(item => {
      return item.platenumber?.toUpperCase()?.includes(inputVal) ||
        item.vehicleSerialName?.includes(inputVal);
    }).map(item => ({
      vehicleSerialName: item.vehicleSerialName,
      platenumber: item.platenumber
    }));

    const uniqueList = Array.from(
      new Set(candidateList.map(item => item.platenumber))
    ).map(platenumber => candidateList.find(item => item.platenumber === platenumber));

    this.setData({
      carCandidateList: uniqueList
    });
  },

  // 选择候选车牌
  selectCarNumber(e) {
    const selectedCarNum = e.currentTarget.dataset.carnumber;
    this.setData({
      inputCarNumber: selectedCarNum,
      carCandidateList: []
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedDate: '',
      inputCarNumber: '',
      carCandidateList: [],
      filteredRecords: [...this.data.warningRecords]
    });
  },

  // 确认筛选
  confirmFilter() {
    const {
      selectedDate,
      inputCarNumber
    } = this.data;
    this.handleCarList(inputCarNumber, selectedDate);
  },

  // 进入记录详情
  goRecordDetail(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?recordId=${record.recordId}`
    });
  },

  // 查看位置
  handleNavToRecord(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({ 
      url: `/pages/riskControl/GPSPosition/index?datails=${JSON.stringify(record)}`
    })
    return
    const {
      latitude,
      longitude,
      vehicleSerialName,
      vehicleModeName,
      platenumber
    } = record;
    wx.openLocation({
      latitude: Number(latitude),
      longitude: Number(longitude),
      name: `${vehicleSerialName}${vehicleModeName}（${platenumber}）疑似拆除`,
      address: `${vehicleSerialName}${vehicleModeName}（${platenumber}）疑似拆除异常位置`,
      scale: 18,
      success: () => console.log('打开地图成功'),
      fail: (err) => {
        console.error('导航失败', err);
        wx.showModal({
          title: '导航失败',
          content: `无法打开地图，位置：${vehicleSerialName}${vehicleModeName}（${platenumber}）`,
          showCancel: false
        });
      }
    });
  }
});