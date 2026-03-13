const {
  u_carList, u_maintained, u_calibrateTotalMileage
} = require('../../../utils/request/car')
const {
  byGet, byPost
} = require('../../../utils/request/http')
Page({
  data: {
    totalCount: 0, // 车辆总数
    todayCount: 0,  // 需要保养车辆数

    // 保养状态选项
    maintenanceStatusOptions: [
      { name: '全部', value: 'all' },
      { name: '待保养', value: 'pending' },
      { name: '已保养', value: 'done' }
    ],
    selectedStatusIndex: 0, // 默认选中全部
    selectedStatus: { name: '全部', value: 'all' },


    // 筛选相关数据
    showFilterModal: false,
    inputCarNumber: '',
    carCandidateList: [],
    focusCarInput: false,
    filteredRecords: [],

    // 里程校准相关
    showCalibrateModal: false,
    calibrateValue: '',
    currentCalibrateRecord: null
  },

  onLoad() {
    this.initList()
  },
  /**
   * 初始化车辆列表数据
   * @description 获取车辆列表接口数据，处理并更新页面数据
   */
  initList() {
    // 提前定义常量，增强可读性
    const baseUrl = getApp().data.k1swUrl;
    const requestUrl = `${baseUrl}${u_carList.URL}`;

    // 空值保护 + 加载状态（可选，提升用户体验）
    if (!baseUrl || !u_carList?.URL) {
      console.warn('车辆列表接口地址配置异常');
      return;
    }

    // 发起请求
    byGet(requestUrl, {}).then(response => {
      if (!response || response.statusCode !== 200) {
        console.error('车辆列表接口请求失败', response);
        return;
      }
      const { data: { content = [] } = {} } = response;
      console.log(content, '车辆列表原始数据');
      let pendingMaintenanceCount = 0;
      const carList = content.map(ele => {
        if (!ele) return {};
        if (Number(ele.distanceMaintainMileage) < 0) {
          pendingMaintenanceCount += 1;
        }
        return {
          sn: ele?.sn || '',
          carNumber: ele.platenumber || '-',
          carModel: `${ele.vehicleSerialName || ''}${ele.vehicleModeName || ''}` || '-',
          warningTime: ele?.mileageTime,
          remainingMileage: ele?.distanceMaintainMileage || 0, // 离保养里程
          totalMileage: ele?.totalMileage || 0,    // 总里程
          maintenanceCycle: ele?.maintainMileageInterval || 0, // 保养周期
          maintenanceStatus: ele?.distanceMaintainMileage > 0 ? 'done' : 'pending' // 保养状态：pending(待保养)/done(已保养)
        };
      });

      this.setData({
        filteredRecords: carList,
        carList:carList,
        totalCount: content.length, // 车辆总数
        todayCount: pendingMaintenanceCount, // 保持原有字段名，避免页面引用报错
      });
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

  // 保养状态选择事件
  onStatusChange(e) {
    const index = e.detail.value;
    const selectedStatus = this.data.maintenanceStatusOptions[index];
    this.setData({
      selectedStatusIndex: index,
      selectedStatus: selectedStatus
    });
  },

  // 车牌号实时输入搜索
  onCarNumberInput(e) {
    const inputVal = e.detail.value.trim().toUpperCase();
    this.setData({
      inputCarNumber: inputVal
    });

    if (!inputVal) {
      this.setData({ carCandidateList: [] });
      return;
    }

    const { carList } = this.data;
    const candidateList = carList.filter(item => {
      return item.carNumber.toUpperCase().includes(inputVal) ||
        item.carModel.includes(inputVal);
    }).map(item => ({
      carModel: item.carModel,
      carNumber: item.carNumber
    }));

    const uniqueList = Array.from(new Set(candidateList.map(item => item.carNumber)))
      .map(carNumber => candidateList.find(item => item.carNumber === carNumber));

    this.setData({
      carCandidateList: uniqueList
    });
  },

  // 选中候选列表中的车牌号
  selectCarNumber(e) {
    const selectedCarNum = e.currentTarget.dataset.carnumber;
    this.setData({
      inputCarNumber: selectedCarNum,
      carCandidateList: []
    });
  },

  // 重置筛选条件
  resetFilter() {
    this.setData({
      selectedStatusIndex: 0,
      selectedStatus: { name: '全部', value: 'all' },
      inputCarNumber: '',
      carCandidateList: [],
      filteredRecords: [...this.data.carList],
      showFilterModal:false
    });
  },

  // 确认筛选
  confirmFilter() {
    const {carList, selectedStatus, inputCarNumber } = this.data;
    let result = [...carList];
    // 保养状态筛选
    if (selectedStatus.value !== 'all') {
      result = result.filter(item => item.maintenanceStatus === selectedStatus.value);
    }

    // 车牌号筛选
    if (inputCarNumber) {
      const carNum = inputCarNumber.trim().toUpperCase();
      result = result.filter(item => {
        return item.carNumber.toUpperCase().includes(carNum);
      });
    }

    this.setData({
      filteredRecords: result,
      showFilterModal: false,
      carCandidateList: []
    });

    wx.showToast({
      title: `筛选出${result.length}条记录`,
      icon: 'none'
    });
  },



  // 保养状态切换
  handleNavToRecord(e) {
    console.log(e)
    const currentCalibrateRecord = e?.currentTarget.dataset?.record
    wx.showModal({
      title: '温馨提示',
      content: '您确认已经对该车进行保养了吗？',
      complete: (res) => {
        if (res.confirm) {
          const requestParams = {
            sn: currentCalibrateRecord.sn,
            totalMileage: currentCalibrateRecord?.totalMileage
          };

          wx.showLoading({ title: '数据上传中...' });
          const baseUrl = getApp().data.k1swUrl;
          byPost(`${baseUrl}${u_maintained.URL}`, requestParams, (res) => {
            wx.hideLoading();
            if (res?.data?.code === 1000) {
              wx.showToast({
                title: `已标记此车为已保养状态`,
                icon: 'none'
              });
              this.initList()
            } else {
              wx.showToast({ title: res?.data?.msg || '标记失败', icon: 'none' });
            }
          })
        }
      }
    })

  },

  // 打开里程校准弹窗
  openCalibrateModal(e) {
    const record = e.currentTarget.dataset.record;
    this.setData({
      showCalibrateModal: true,
      calibrateValue: record.totalMileage.toString(),
      currentCalibrateRecord: record
    });
  },

  // 关闭里程校准弹窗
  closeCalibrateModal() {
    this.setData({
      showCalibrateModal: false,
      calibrateValue: '',
    });
  },

  // 校准里程输入
  onCalibrateInput(e) {
    this.setData({
      calibrateValue: e.detail.value
    });
  },

  // 确认校准里程
  confirmCalibrate() {
    const { calibrateValue, currentCalibrateRecord } = this.data;
    if (!currentCalibrateRecord) return wx.showToast({ title: '数据异常', icon: 'none' });
    const newMileage = Number(calibrateValue);
    if (!calibrateValue || isNaN(newMileage) || newMileage < 0) {
      return wx.showToast({
        title: '请输入≥0的有效里程数',
        icon: 'none'
      });
    }
    const requestParams = {
      sn: currentCalibrateRecord.sn,
      totalMileage: newMileage
    };

    wx.showLoading({ title: '校准中...' });
    const baseUrl = getApp().data.k1swUrl;
    byPost(`${baseUrl}${u_calibrateTotalMileage.URL}`, requestParams, (res) => {
      wx.hideLoading();
      if (res?.data?.code === 1000) {

        wx.showToast({ title: '里程校准成功',icon:'none' });
        this.setData({
          showCalibrateModal: false,
          calibrateValue: '',
          currentCalibrateRecord: null
        }, () => {
          this.initList();
        });

      } else {
        wx.showToast({ title: res?.data?.msg || '校准失败', icon: 'none' });
      }
    })
  }
});