const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_buyDevice,
  u_buyRecord,
  u_getIndustry,
  u_getIntroduction,
  u_isNeedCarInfo
} = require('../../utils/request/data_info')
const {
  byGet,
  byPost,byPostJson 
} = require('../../utils/request/http')

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
    c_activeTab: 1, //当前页签值
    // 下单参数
    g_core_functions: [], //所属功能
    g_core_functions_index: null, //当前功能
    g_industry: [], //所属行业
    g_industry_index: null, //当前行业
    whether_vehicle: false, //是否需要上次车辆信息
    tabs: [{
      id: 0,
      title: '车型1',
    }],
    currentIndex: 0,
    scrollLeft: 0,
    params: {},
    g_install_list: [{
      value: 0,
      name: '否'
    }, {
      value: 1,
      name: '是'
    }], // 是否安装
    g_install_index: 1,
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
  // 行业数据
  initialiIndustry() {
    byGet(getApp().data.k1swUrl + u_getIndustry.URL, {}).then(response => {
      const list = response.data.content
      const info = list.map(ele => {
        let temp = {
          id: ele,
          name: ele
        }
        return temp
      })
      this.setData({
        g_industry: info
      })
    })
  },
  // 功能数据
  initialgetIntroduction() {
    byGet(getApp().data.k1swUrl + u_getIntroduction.URL, {}).then(response => {
      const list = response.data.content
      const info = list.map(ele => {
        let temp = {
          id: ele,
          name: ele
        }
        return temp
      })
      this.setData({
        g_core_functions: info
      })
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '采购订单') {
      this.setData({
        c_activeTab: 1,
      })
    } else {
      this.setData({
        c_activeTab: 2,
      })
    }
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_buyRecord.days]: this.data.g_days,
      [u_buyRecord.orderTypes]: this.data.g_orderTypes,
      [u_buyRecord.status]: this.data.g_status,
      [u_buyRecord.comParam]: this.data.g_comParam,
      [u_buyRecord.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_buyRecord.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  // 订单列表触底懒加载
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  // 订单列表下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
  // 所属行业变化回到
  handleIndustryType(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  // 所属功能之后回调
  handleCoreType(evt) {
    this.setData({
      g_core_functions_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  // 操作行业或功能数据后的回调
  handleCalculate() {
    const {
      g_core_functions_index,
      g_industry_index,
      g_industry,
      g_core_functions
    } = this.data
    if (g_industry_index == null || g_core_functions_index == null) return
    const parmas = {
      introduction: g_core_functions[g_core_functions_index]?.name,
      industry: g_industry[g_industry_index]?.name
    }
    byGet(getApp().data.k1swUrl + u_isNeedCarInfo.URL, parmas).then(response => {
      const state = response.data.content
      this.setData({
        whether_vehicle: state
      })
    })
  },
  // 切换tab
  handleSwitchVicheTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
  },
  // 添加tab
  hadnleAddTab() {
    const newTabs = this.data.tabs
    const newId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id + 1 : 0

    newTabs.push({
      id: newId,
      title: `车型 ${newId + 1}`,
    })

    this.setData({
      tabs: newTabs,
      currentIndex: newTabs.length - 1,
      scrollLeft: 10000 // 滚动到最右边
    })
  },
  // 删除tab
  hadnleCloseTab(e) {
    if (this.data.tabs.length === 1) return

    const id = e.currentTarget.dataset.id
    const newTabs = this.data.tabs.filter(tab => tab.id !== id)
    const newIndex = Math.min(this.data.currentIndex, newTabs.length - 1)

    this.setData({
      tabs: newTabs,
      currentIndex: newIndex
    }, () => {
      this.setData({
        deviceCount: this.data.tabs.length
      })
    })
  },
  // 输入框内容改变回调
  handleBindinput(evt) {
    const params = this.data?.params
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    }, () => {
      this.setData({
        deviceCount: this.data.tabs.length
      })
    })
  },
  // 启动方式
  handleBatterylift(evt) {
    const params = this.data?.params
    params['runtype' + evt?.currentTarget.dataset.id] = evt.currentTarget.dataset.item
    this.setData({
      params: {
        ...params
      }
    })
  },
  // 数量改变
  handleNumBindinput(evt) {
    this.setData({
      deviceCount: evt.detail.value
    })
  },
  // 收货人发生改变
  handlePersonBindinput(evt) {
    this.setData({
      linkperson: evt.detail.value
    })
  },
  // 联系电话
  handleMobileBindinput(evt) {
    this.setData({
      linkmobile: evt.detail.value
    })
  },
  // 收货地址
  handleAddressBindinput(evt) {
    this.setData({
      address: evt.detail.value
    })
  },
  // 是否安装切换函数
  handleVicheRadioChange(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    })
  },
  // 跳转到详情
  handleView(evt) {
    wx.navigateTo({
      url: '/pages/orderList/orderDetails/orderDetails?info=' + JSON.stringify(evt.currentTarget.dataset.item),
    })
  },
  // 提交参数
  handleSubmit() {
    const {
      deviceCount = 0,
        params = {},
        whether_vehicle,
        g_core_functions = [], //所属功能
        g_core_functions_index = null, //当前功能
        g_industry = [], //所属行业
        g_industry_index = null, //当前行业
        g_install_index,
        linkperson,
        linkmobile,
        address,
    } = this.data;


    const validateIndex = (list, index) => Array.isArray(list) && index >= 0 && index < list.length;
    const getValidValue = (list, index) => validateIndex(list, index) ? list[index]?.id : null; //判断参数是否为空

    const core_functions = getValidValue(g_core_functions, g_core_functions_index); //行业
    const industry = getValidValue(g_industry, g_industry_index); //功能
    const requiredBaseFields = !whether_vehicle ? [{
        value: industry,
        name: '行业'
      }, {
        value: core_functions,
        name: '功能'
      }, {
        value: deviceCount,
        name: '数量'
      },
      {
        value: linkperson,
        name: '收货人'
      }, {
        value: linkmobile,
        name: '联系电话'
      }, {
        value: address,
        name: '收货地址'
      }
    ] : [{
      value: linkperson,
      name: '收货人'
    }, {
      value: linkmobile,
      name: '联系电话'
    }, {
      value: address,
      name: '收货地址'
    }];

    const missingBaseField = requiredBaseFields.find(f => !f.value);
    if (missingBaseField) {
      showToast(`${missingBaseField.name}不得为空`);
      return;
    }
    const CAR_FIELD_PATTERN = /^(\D+)(\d+)$/;
    const paramKeys = Object.keys(params);
    const carIndices = new Set(paramKeys.map(key => {
      const match = key.match(CAR_FIELD_PATTERN);
      return match ? parseInt(match[2], 10) : null;
    }).filter(index => index !== null));


    if (carIndices.size === 0 && whether_vehicle) {
      showToast('列表数据不得为空');
      return;
    }
    const carList = [];
    Array.from(carIndices).sort((a, b) => a - b).forEach(index => {
      const carItem = {};
      paramKeys.forEach(key => {
        const match = key.match(new RegExp(`^(.+?)${index}$`));
        if (match) {
          const fieldName = match[1];
          const value = params[key]?.trim() || '';
          carItem[fieldName] = value;
        }
      });
      carList.push(carItem)
    });
    for (let i = 0; i < carList.length; i++) {
      const car = carList[i];
      if (!car.carmodel?.trim() || !car.carserial?.trim() || !car.runtype?.trim()) {
        showToast(`请补全${car.carmodel}的信息`);
        return false;
      }
    }
    const submitParams = {
      core_functions,
      industry,
      isInstall: g_install_index,
      deviceCount: Number(deviceCount),
      linkperson,
      linkmobile,
      address,
      carList: whether_vehicle ? carList?.map(item => ({
        ...item,
      })) : [],
    };
    console.log(submitParams)

   
      byPostJson(
        getApp().data.k1swUrl + u_buyDevice.URL,
        submitParams,
        (response) => {
          if (response.data?.code == 1000) {
            wx.navigateBack({
              delta: 1
            });
            showToast(response.data?.msg || '提交成功');
          } else {
            showToast(response.data?.msg || '服务器返回未知错误');
          }
        }
      );
    
  },
  onLoad(options) {
    this.getOrderList()
  },

  onReady() {},

  onShow() {
    this.initialiImageBaseConversion()
    this.initialiIndustry()
    this.initialgetIntroduction()
  },

})