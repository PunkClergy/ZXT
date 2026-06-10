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
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_background_tabs_1: '', //tabs背景
    s_background_tabs_2: '', //tabs背景
    s_background_tabs_active_1: '', //tabs背景
    s_background_tabs_active_2: '', //tabs背景
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新状态
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    btnState: '新增',
    id: '', //修改标志
    batterylift: '一键启动', //启动方式
    carOwnerNameValue: '',
    carOwnerName: '智信通', //所属平台
    brakingType: 1,
    all_c: false
  },
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
                  c_activeTab: 1, // 默认选中的Tab索引
                  g_page: 1, //列表页码
                  g_items: [], //列表数据
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
    // 1. 解构赋值获取目标数据，增加空值防护
    const targetItem = evt.currentTarget.dataset.item || {};
    const { id } = targetItem;
    if (!id) { // 防止id为空导致后续逻辑出错
      console.warn('未获取到有效的车辆ID');
      return;
    }

    // 2. 获取页面数据并做默认值处理
    const { g_items = [] } = this.data;

    // 3. 找到对应车辆并验证存在性
    const vehicleIndex = g_items.findIndex(item => item.id === id);
    if (vehicleIndex === -1) {
      console.warn(`未找到ID为${id}的车辆数据`);
      return;
    }

    // 4. 切换当前项的checked状态（核心：true↔false）
    const newGItems = [...g_items]; // 深拷贝原数组，避免直接修改
    newGItems[vehicleIndex] = {
      ...newGItems[vehicleIndex],
      checked: !newGItems[vehicleIndex].checked // 取反切换状态
    };

    // 5. 核心检测逻辑：判断所有项是否都为checked=true
    // 逻辑：列表非空时，所有项checked为true则all_c=true，否则false；空列表则all_c=false
    const all_c = newGItems.length > 0
      ? newGItems.every(item => item.checked === true)
      : false;

    // 6. 重新计算g_black和g_platenumbers（所有checked=true的项）
    const checkedVehicles = newGItems.filter(item => item.checked === true);
    const g_black = checkedVehicles.map(item => item.id).filter(Boolean);
    const g_platenumbers = checkedVehicles.map(item => item.platenumber).filter(Boolean);

    // 7. 单次setData批量更新所有数据（包含all_c）
    this.setData({
      g_items: newGItems,
      g_black: g_black,
      g_platenumbers: g_platenumbers,
      all_c: all_c // 同步更新全选状态
    });
  },

  handleAllC() {
    const { g_items = [] } = this.data;
    if (g_items.length === 0) {
      showToast('暂无数据可选择');
      return;
    }

    // 2. 判断当前是否需要全选（只要有一个未选中，就全选；否则取消全选）
    const hasUncheckedItem = g_items.some(item => item.checked !== true);
    const targetCheckedStatus = hasUncheckedItem; // true=全选，false=取消全选

    // 3. 更新所有项的checked状态
    const newGItems = g_items.map(item => ({
      ...item,
      checked: targetCheckedStatus // 统一设置为目标状态（全选/取消全选）
    }));

    // 4. 重新计算g_black和g_platenumbers（和单个选择逻辑保持一致）
    const checkedVehicles = newGItems.filter(item => item.checked === true);
    const g_black = checkedVehicles.map(item => item.id).filter(Boolean); // 过滤空ID
    const g_platenumbers = checkedVehicles.map(item => item.platenumber).filter(Boolean); // 过滤空车牌号

    // 5. 批量更新数据，保证三者同步
    this.setData({
      g_items: newGItems,
      g_black: g_black,
      g_platenumbers: g_platenumbers
    });

    // 6. 可选：添加操作提示，提升用户体验
    const toastText = targetCheckedStatus ? '已全选所有车辆' : '已取消全选所有车辆';
    showToast(toastText);
  },
  handleJumpBlackInfo() {
    wx.reLaunch({
      url: `${this.data.g_source}?black=${this.data.g_black}&type=${this.data.type}&name=${this.data.name}&platenumbers=${this.data.g_platenumbers}&info=${JSON.stringify(this.data.info)}`,
    })
  },

  // 扫码按钮点击事件
  scanCode() {
    wx.scanCode({
      onlyFromCamera: false, // 是否只允许相机扫码（false表示允许从相册选择）
      scanType: ['qrCode', 'barCode'], // 扫码类型：二维码、条形码
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
  // 处理扫码结果
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
  // 全屏背景图
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
    },];
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
  // 管控列表数据
 // 管控列表数据
initList() {
  const param = {
    [u_carList.page]: this.data.g_page,
    pageSize: 10, // 👈 改为 10 条/页
    comParam: this.data?.comParam || ""
  };

  byGet(getApp().data.k1swUrl + u_carList.URL, param).then(response => {
    if (response.statusCode == 200) {
      const newList = response.data.content || [];
      
      // 无更多数据提示
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
          const newItem = { ...item };
          newItem.checked = !!(newItem && newItem.sn && vehSnSet.has(newItem.sn));
          return newItem;
        });

        const isAllChecked = updatedGItems.length > 0
          ? updatedGItems.every(item => item?.checked === true)
          : false;

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

// 触底请求（打开注释即可）
handleLower() {
  this.setData({
    g_page: this.data.g_page + 1
  }, () => {
    this.initList();
  });
},
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
  },
  // 内容输入回调
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
  // 点击内容回调
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  // 点击内容回调
  handleBrakingType(evt) {
    const brakingType = evt.currentTarget.dataset.item
    this.setData({
      brakingType
    })
  },
  // 点击内容回调
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
  //提交内容
  handleSubmit() {
    const apiUrls = {
      getCarStatus: getApp().data.k1swUrl + u_addOrUpdateCar.URL
    };
    const param = {
      ...this.data.params,
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
            c_activeTab: 1, // 默认选中的Tab索引
            params: {}, //新增管控数据部分字段
            btnState: '新增',
            id: '', //修改标志
            batterylift: '一键启动', //启动方式
            carOwnerNameValue: '',
            carOwnerName: '智信通', //所属平台
            brakingType: 1,
            g_page: 1, //列表页码
            g_items: [], //列表数据
          })
          showToast(response.data.msg)
          getApp().data.reflag = 1
          this.initList()
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
        maintainMileage:info?. maintainMileage||'',
        maintainMileageInterval:info?.maintainMileageInterval||'',
        totalMileage:info?.totalMileage||'',
        vehicleSerialName: info?.vehicleSerialName||'',
        vehicleModeName: info?.vehicleModeName||'',
        ccdate: info?.ccdate||'',
        introduction: info?.introduction||'',
        platenumber: info?.platenumber||'',
        vin: info?.vin||'',
        xsgw: info?.xsgw||'',
        sn: info?.sn||'',
        code: info?.code||''
      },
      batterylift: info?.batterylift || '一键启动',
      brakingType: info?.brakingType,
      carOwnerName: info?.carOwnerName,
    })
  },
  // 切换tabs标签
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
})