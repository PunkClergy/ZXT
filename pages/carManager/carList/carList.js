const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_carList,
  u_addOrUpdateCar,
  u_carapiDeleteCar
} = require('../../../utils/request/car')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    // 原有字段不变
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_screen_width: _handleWindowInfo.windowWidth || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0,
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44,
    s_background_tabs_1: '',
    s_background_tabs_2: '',
    s_background_tabs_active_1: '',
    s_background_tabs_active_2: '',
    searchBarHeight: 80,
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44),
    g_page: 1,
    g_items: [],
    g_triggered: false,
    c_activeTab: 1,
    params: {},
    btnState: '新增',
    id: '',
    batterylift: '一键启动',
    carOwnerNameValue: '',
    carOwnerName: '智信通',
    brakingType: 1,
    all_c: false,
    // ========== 新增自定义弹窗控制字段 ==========
    showDisclaimerModal: false
  },
  stopPropagation() {},
  bindblurSea(evt) {
    this.setData({
      comParam: evt.detail.value,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList()
    })
  },
  // 删除车辆
  handleDelete(evt) {
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      complete: (res) => {
        if (res.confirm) {
          const info = evt.currentTarget.dataset.item
          const apiUrls = {
            getCarStatus: getApp().data.k1swUrl + u_carapiDeleteCar.URL
          };
          const param = {
            sn: info?.sn,
            code: info?.code
          }
          byPost(apiUrls.getCarStatus, param,
            (response) => {
              hideLoading();
              if (response.data.code == 1000) {
                this.setData({
                  c_activeTab: 1,
                  g_page: 1,
                  g_items: [],
                })
                showToast(response.data.msg)
                getApp().data.reflag = 1
                this.initList()
              } else {
                showToast(response.data.msg)
              }
            });
        }
      }
    })
  },
  handleChangeBlack(evt) {
    const targetItem = evt.currentTarget.dataset.item || {};
    const {
      id
    } = targetItem;
    if (!id) {
      console.warn('未获取到有效的车辆ID');
      return;
    }
    const {
      g_items = []
    } = this.data;
    const vehicleIndex = g_items.findIndex(item => item.id === id);
    if (vehicleIndex === -1) {
      console.warn(`未找到ID为${id}的车辆数据`);
      return;
    }
    const newGItems = [...g_items];
    newGItems[vehicleIndex] = {
      ...newGItems[vehicleIndex],
      checked: !newGItems[vehicleIndex].checked
    };
    const all_c = newGItems.length > 0 ?
      newGItems.every(item => item.checked === true) :
      false;
    const checkedVehicles = newGItems.filter(item => item.checked === true);
    const g_black = checkedVehicles.map(item => item.id).filter(Boolean);
    const g_platenumbers = checkedVehicles.map(item => item.platenumber).filter(Boolean);
    this.setData({
      g_items: newGItems,
      g_black: g_black,
      g_platenumbers: g_platenumbers,
      all_c: all_c
    });
  },
  handleAllC() {
    const {
      g_items = []
    } = this.data;
    if (g_items.length === 0) {
      showToast('暂无数据可选择');
      return;
    }
    const hasUncheckedItem = g_items.some(item => item.checked !== true);
    const targetCheckedStatus = hasUncheckedItem;
    const newGItems = g_items.map(item => ({
      ...item,
      checked: targetCheckedStatus
    }));
    const checkedVehicles = newGItems.filter(item => item.checked === true);
    const g_black = checkedVehicles.map(item => item.id).filter(Boolean);
    const g_platenumbers = checkedVehicles.map(item => item.platenumber).filter(Boolean);
    this.setData({
      g_items: newGItems,
      g_black: g_black,
      g_platenumbers: g_platenumbers
    });
    const toastText = targetCheckedStatus ? '已全选所有车辆' : '已取消全选所有车辆';
    showToast(toastText);
  },
  handleJumpBlackInfo() {
    wx.reLaunch({
      url: `${this.data.g_source}?black=${this.data.g_black}&type=${this.data.type}&name=${this.data.name}&platenumbers=${this.data.g_platenumbers}&info=${JSON.stringify(this.data.info)}`,
    })
  },
  scanCode() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.log('扫码成功:', res)
        this.handleScanResult(res.result)
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        wx.showToast({
          title: '扫码失败',
          icon: 'error'
        })
      }
    })
  },
  handleScanResult(result) {
    const params = this.data.params
    this.setData({
      params: {
        ...params,
        sn: result
      },
    })
  },
  initCarryParams(evt) {
    const {
      source,
      flagMulti,
      info,
      allParams,
      type,
      name,
      desc
    } = evt
    this.setData({
      g_source: source,
      g_flagMulti: flagMulti,
      info: info && JSON.parse(info),
      allParams: allParams,
      type: type,
      name: name,
      desc: desc
    })
  },
  handleSelectJump(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    if (this.data.allParams) {
      wx.redirectTo({
        url: `${this.data.g_source}?datails=${JSON.stringify(item)}&allParams=${this.data.allParams}&type=${this.data.type}`
      })
    } else {
      wx.redirectTo({
        url: `${this.data.g_source}?datails=${JSON.stringify(item)}`
      })
    }
  },
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }, {
      path: '/assets/images/home/1-1.png',
      key: 's_background_tabs_1'
    }, {
      path: '/assets/images/home/2-1.png',
      key: 's_background_tabs_active_1'
    }, {
      path: '/assets/images/home/1-2.png',
      key: 's_background_tabs_2'
    }, {
      path: '/assets/images/home/2-2.png',
      key: 's_background_tabs_active_2'
    }, ];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );
    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },
  initList() {
    const param = {
      [u_carList.page]: this.data.g_page,
      pageSize: 10,
      comParam: this.data?.comParam || ""
    };
    byGet(getApp().data.k1swUrl + u_carList.URL, param).then(response => {
      if (response.statusCode == 200) {
        const newList = response.data.content || [];
        if (this.data.g_page > 1 && newList.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
          return;
        }
        this.setData({
          g_items: this.data.g_items.concat(newList),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
          const vehList = this?.data?.desc ? JSON.parse(this?.data?.desc)?.vehList : [];
          const g_items = this.data.g_items || [];
          const vehSnSet = new Set();
          vehList.forEach(item => {
            if (item && item.sn) {
              vehSnSet.add(item.sn);
            }
          });
          const updatedGItems = g_items.map(item => {
            const newItem = {
              ...item
            };
            newItem.checked = !!(newItem && newItem.sn && vehSnSet.has(newItem.sn));
            return newItem;
          });
          const isAllChecked = updatedGItems.length > 0 ?
            updatedGItems.every(item => item?.checked === true) :
            false;
          const checkedVehicles = updatedGItems.filter(item => item.checked === true);
          const g_black = checkedVehicles.map(item => item.id).filter(Boolean);
          const g_platenumbers = checkedVehicles.map(item => item.platenumber).filter(Boolean);
          this.setData({
            g_items: updatedGItems,
            all_c: isAllChecked,
            g_black: g_black,
            g_platenumbers: g_platenumbers
          });
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    }).catch(error => {
      console.error('列表初始化失败：', error);
      showToast('请求失败，请稍后再试');
      hideLoading();
    });
  },
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.initList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
  },
  handleBindinput(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    })
  },
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  handleBrakingType(evt) {
    const brakingType = evt.currentTarget.dataset.item
    this.setData({
      brakingType
    })
  },
  handleCarOwnerName(evt) {
    const carOwnerName = evt.currentTarget.dataset.item
    this.setData({
      carOwnerName
    })
  },
  handleCarOwnerNameBindinput(evt) {
    this.setData({
      carOwnerNameValue: evt.detail.value
    })
  },
  // 提交
  handleSubmit(evt) {
    console.log(evt)
    const apiUrls = {
      getCarStatus: getApp().data.k1swUrl + u_addOrUpdateCar.URL
    };
    const param = {
      ...this.data.params,
      isDirectReg: evt == 1 ? 1 : '',
      brakingType: this.data.brakingType,
      batterylift: this.data.batterylift,
      carOwnerName: this.data.carOwnerName == '智信通' ? this.data.carOwnerName : this.data.carOwnerNameValue,
      id: this.data.id || ''
    };
    const validations = [{
        field: 'platenumber',
        message: '请填写车牌号'
      },
      {
        field: 'sn',
        message: '请填写设备号'
      }
    ];
    for (const {
        field,
        message
      } of validations) {
      if (!param[field]?.trim()) {
        showToast(message);
        return;
      }
    }
    console.log(param)
    showLoading();
    byPost(apiUrls.getCarStatus, param,
      (response) => {
        hideLoading();
        if (response.data.code == 1000) {
          this.setData({
            c_activeTab: 1,
            params: {},
            btnState: '新增',
            id: '',
            batterylift: '一键启动',
            carOwnerNameValue: '',
            carOwnerName: '智信通',
            brakingType: 1,
            g_page: 1,
            g_items: [],
          })
          showToast(response.data.msg)
          getApp().data.reflag = 1
          this.initList()
        } else if (response.data.code === 7000) {
          // 【关键改造】替换wx.showModal，打开自定义弹窗
          this.setData({
            showDisclaimerModal: true
          })
        } else {
          showToast(response.data.msg)
        }
      });
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_activeTab: 2,
      btnState: '修改',
      id: info?.id,
      params: {
        maintainMileage: info?.maintainMileage || '',
        maintainMileageInterval: info?.maintainMileageInterval || '',
        totalMileage: info?.totalMileage || '',
        vehicleSerialName: info?.vehicleSerialName || '',
        vehicleModeName: info?.vehicleModeName || '',
        ccdate: info?.ccdate || '',
        introduction: info?.introduction || '',
        platenumber: info?.platenumber || '',
        vin: info?.vin || '',
        xsgw: info?.xsgw || '',
        sn: info?.sn || '',
        code: info?.code || ''
      },
      batterylift: info?.batterylift || '一键启动',
      brakingType: info?.brakingType,
      carOwnerName: info?.carOwnerName,
    })
  },
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '车辆列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增',
        params: {},
        id: '',
        g_roleList_index: null
      })
    }
    if (flag == '新增车辆' || flag == '修改修改') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },
  onLoad(options) {
    this.initCarryParams(options)
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
  },

  // ========== 自定义弹窗事件 ==========
  // 关闭弹窗
  closeDisclaimerModal() {
    this.setData({
      showDisclaimerModal: false
    })
  },
  // 点击【去检测】
  modalGoCheck() {
    this.closeDisclaimerModal()
    wx.redirectTo({
      url: '/pages/ToInternalStaff/K7/index'
    })
  },
  // 点击【免检注册】
  modalSkipCheck() {
    this.closeDisclaimerModal()
    this.handleSubmit(1)
  }
})