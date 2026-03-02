Page({
  data: {
    isSubscribed: false,
    totalCount: 20, // 异常记录总数（新增后20条）
    todayCount: 8, // 今日新增异常
    unHandleCount: 20, // 待处理异常数（全部都是）
    warningTemplateId: "你的模板ID",

    // 原始异常记录数据（新增至20条）
    warningRecords: [
      // 原有5条
      {
        recordId: "REC001",
        warningTime: "2026-03-02 09:23:45",
        warningDesc: "疑似拆除",
        carModel: "大众高尔夫",
        carNumber: "京A00293",
        latitude: 30.58804,
        longitude: 114.30554
      },
      {
        recordId: "REC002",
        warningTime: "2026-03-02 08:15:30",
        warningDesc: "疑似拆除",
        carModel: "丰田凯美瑞",
        carNumber: "沪B88765",
        latitude: 30.58921,
        longitude: 114.30687
      },
      {
        recordId: "REC003",
        warningTime: "2026-03-01 16:40:12",
        warningDesc: "疑似拆除",
        carModel: "本田CR-V",
        carNumber: "粤C67890",
        latitude: 30.59015,
        longitude: 114.30723
      },
      {
        recordId: "REC004",
        warningTime: "2026-03-01 14:10:55",
        warningDesc: "疑似拆除",
        carModel: "宝马3系",
        carNumber: "苏D12345",
        latitude: 30.58762,
        longitude: 114.30498
      },
      {
        recordId: "REC005",
        warningTime: "2026-02-29 11:05:20",
        warningDesc: "疑似拆除",
        carModel: "特斯拉Model 3",
        carNumber: "浙E98765",
        latitude: 30.58889,
        longitude: 114.30812
      },
      // 新增15条数据
      {
        recordId: "REC006",
        warningTime: "2026-03-02 10:30:18",
        warningDesc: "疑似拆除",
        carModel: "比亚迪汉",
        carNumber: "京A12345",
        latitude: 30.58854,
        longitude: 114.30584
      },
      {
        recordId: "REC007",
        warningTime: "2026-03-02 11:15:42",
        warningDesc: "疑似拆除",
        carModel: "吉利星越L",
        carNumber: "沪B23456",
        latitude: 30.58981,
        longitude: 114.30717
      },
      {
        recordId: "REC008",
        warningTime: "2026-03-02 12:20:33",
        warningDesc: "疑似拆除",
        carModel: "哈弗H6",
        carNumber: "粤C34567",
        latitude: 30.59065,
        longitude: 114.30753
      },
      {
        recordId: "REC009",
        warningTime: "2026-03-02 13:45:10",
        warningDesc: "疑似拆除",
        carModel: "长安UNI-V",
        carNumber: "苏D45678",
        latitude: 30.58812,
        longitude: 114.30528
      },
      {
        recordId: "REC010",
        warningTime: "2026-03-02 14:50:25",
        warningDesc: "疑似拆除",
        carModel: "五菱宏光MINI",
        carNumber: "浙E56789",
        latitude: 30.58939,
        longitude: 114.30842
      },
      {
        recordId: "REC011",
        warningTime: "2026-03-01 09:10:15",
        warningDesc: "疑似拆除",
        carModel: "奥迪A4L",
        carNumber: "京A67890",
        latitude: 30.58794,
        longitude: 114.30474
      },
      {
        recordId: "REC012",
        warningTime: "2026-03-01 10:25:40",
        warningDesc: "疑似拆除",
        carModel: "奔驰C级",
        carNumber: "沪B78901",
        latitude: 30.58911,
        longitude: 114.30667
      },
      {
        recordId: "REC013",
        warningTime: "2026-03-01 11:30:55",
        warningDesc: "疑似拆除",
        carModel: "日产轩逸",
        carNumber: "粤C89012",
        latitude: 30.59045,
        longitude: 114.30783
      },
      {
        recordId: "REC014",
        warningTime: "2026-03-01 15:15:30",
        warningDesc: "疑似拆除",
        carModel: "朗逸",
        carNumber: "苏D90123",
        latitude: 30.58772,
        longitude: 114.30518
      },
      {
        recordId: "REC015",
        warningTime: "2026-03-01 16:20:18",
        warningDesc: "疑似拆除",
        carModel: "卡罗拉",
        carNumber: "浙E01234",
        latitude: 30.58899,
        longitude: 114.30832
      },
      {
        recordId: "REC016",
        warningTime: "2026-02-29 08:30:45",
        warningDesc: "疑似拆除",
        carModel: "迈腾",
        carNumber: "京A88888",
        latitude: 30.58824,
        longitude: 114.30564
      },
      {
        recordId: "REC017",
        warningTime: "2026-02-29 09:45:20",
        warningDesc: "疑似拆除",
        carModel: "帕萨特",
        carNumber: "沪B99999",
        latitude: 30.58951,
        longitude: 114.30697
      },
      {
        recordId: "REC018",
        warningTime: "2026-02-29 10:50:10",
        warningDesc: "疑似拆除",
        carModel: "雅阁",
        carNumber: "粤C77777",
        latitude: 30.59075,
        longitude: 114.30743
      },
      {
        recordId: "REC019",
        warningTime: "2026-02-29 14:15:55",
        warningDesc: "疑似拆除",
        carModel: "思域",
        carNumber: "苏D66666",
        latitude: 30.58782,
        longitude: 114.30508
      },
      {
        recordId: "REC020",
        warningTime: "2026-02-29 15:30:30",
        warningDesc: "疑似拆除",
        carModel: "雷凌",
        carNumber: "浙E55555",
        latitude: 30.58919,
        longitude: 114.30822
      }
    ],

    // 筛选相关数据
    showFilterModal: false,
    selectedDate: '',
    inputCarNumber: '',
    carCandidateList: [],
    focusCarInput: false,
    filteredRecords: []
  },

  onLoad() {
    this.checkSubscribeStatus();
    // 初始化筛选列表为全部数据
    this.setData({
      filteredRecords: [...this.data.warningRecords]
    });
  },

  // 检查订阅状态
  checkSubscribeStatus() {
    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        const set = res.subscriptionsSetting || {};
        const ok = set.itemSettings && set.itemSettings[this.data.warningTemplateId] === 'accept';
        this.setData({ isSubscribed: ok });
      }
    });
  },

  // 订阅预警通知
  handleSubscribeWarning() {
    if (this.data.isSubscribed) {
      wx.showToast({ title: '已订阅', icon: 'success' });
      return;
    }

    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        const subSet = res.subscriptionsSetting || {};
        if (subSet.mainSwitch === false) {
          wx.showModal({
            title: '通知已关闭',
            content: '请开启订阅消息权限',
            confirmText: '去设置',
            success: (mr) => {
              if (mr.confirm) {
                wx.openSetting({ withSubscriptions: true });
              }
            }
          });
          return;
        }

        wx.requestSubscribeMessage({
          tmplIds: [this.data.warningTemplateId],
          success: (res) => {
            if (res[this.data.warningTemplateId] === 'accept') {
              this.setData({ isSubscribed: true });
              wx.showToast({ title: '订阅成功', icon: 'success' });
            } else {
              wx.showToast({ title: '已拒绝', icon: 'none' });
            }
          }
        });
      }
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

  // 日期选择器改变事件
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
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

    const { warningRecords } = this.data;
    const candidateList = warningRecords.filter(item => {
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
    const targetCar = this.data.warningRecords.find(item => item.carNumber === selectedCarNum);
    
    this.setData({
      inputCarNumber: selectedCarNum,
      carCandidateList: []
    });
  },

  // 重置筛选条件
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
    const { warningRecords, selectedDate, inputCarNumber } = this.data;
    let result = [...warningRecords];

    if (selectedDate) {
      result = result.filter(item => {
        const warningDate = item.warningTime.split(' ')[0];
        return warningDate === selectedDate;
      });
    }

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
      icon: 'success'
    });
  },

  // 进入记录详情页
  goRecordDetail(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?recordId=${record.recordId}`,
    });
  },

  // 导航到异常记录位置
  handleNavToRecord(e) {
    const record = e.currentTarget.dataset.record;
    const { latitude, longitude, carModel, carNumber } = record;

    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: `${carModel}（${carNumber}）疑似拆除`,
      address: `${carModel}（${carNumber}）疑似拆除异常位置`,
      scale: 18,
      success: () => {
        console.log('打开地图导航成功');
      },
      fail: (err) => {
        console.error('导航失败：', err);
        wx.showModal({
          title: '导航失败',
          content: `无法打开地图，位置：${carModel}（${carNumber}）（纬度${latitude}，经度${longitude}）`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  }
});