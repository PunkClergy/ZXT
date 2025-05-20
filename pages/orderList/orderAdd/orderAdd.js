const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byPost,
  byPostJson,
  byGet
} = require('../../../utils/request/http')
const {
  u_priceCalculation,
  u_getDeviceType,
  u_buyDevice,
  u_getIndustry,
  u_getIntroduction,
  u_isNeedCarInfo
} = require('../../../utils/request/data_info')
Page({

  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    g_core_functions: [], //所属功能
    g_core_functions_index: null, //当前功能
    g_industry: [], //所属行业
    g_industry_index: null, //当前行业
    whether_vehicle: false, // 是否需要上次车辆信息
    snitems: null,
    tabs: [{
      id: 0,
      title: '车型1',
    }],
    currentIndex: 0,
    scrollLeft: 0,
    id: ''
  },
  // 全图背景
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
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
  // URL转base64
  initialiUrlToBase64WithMimeType(url) {
    try {
      const fs = wx.getFileSystemManager();
      const filePath = url;
      const fileContent = fs.readFileSync(filePath, 'base64');
      const base64Data = `data:image/png;base64,${fileContent}`;
      return base64Data;
    } catch (err) {}
  },
  // 选择功能之后回调
  handleCoreType(evt) {
    this.setData({
      g_core_functions_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
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
  // 所属行业变化回到
  handleIndustryType(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  // 操作行业或数据后的回调
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
      console.log(response)
      const state = response.data.content
      this.setData({
        whether_vehicle: state
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




  // 切换tab
  handleSwitchTab(e) {
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
  // 提交参数
  handleSubmit() {
    const {
      id,
      deviceCount = 0,
      params = {},
      snitems,
      whether_vehicle,
      g_core_functions = [], //所属功能
      g_core_functions_index = null, //当前功能
      g_industry = [], //所属行业
      g_industry_index = null, //当前行业
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
        value: snitems,
        name: '收货信息'
      }
    ] : [{
      value: snitems,
      name: '收货信息'
    }];

    const missingBaseField = requiredBaseFields.find(f => !f.value);
    if (missingBaseField) {
      showToast(`${missingBaseField.name}不得为空`);
      return;
    }
    const REQUIRED_FIELDS_COUNT = 5;
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
    const carErrors = [];

    Array.from(carIndices).sort((a, b) => a - b).forEach(index => {
      const carItem = {};
      const actualFields = new Set();
      const missingFields = [];
      paramKeys.forEach(key => {
        const match = key.match(new RegExp(`^(.+?)${index}$`));
        if (match) {
          const fieldName = match[1];
          const value = params[key]?.trim() || '';
          actualFields.add(fieldName);
          carItem[fieldName] = value;
          if (!value) {
            missingFields.push(fieldName);
          }
        }
      });

      if (actualFields.size !== REQUIRED_FIELDS_COUNT) {
        carErrors.push({
          type: 'FIELD_COUNT',
          model: carItem.carmodel || `车型${index + 1}`,
          required: REQUIRED_FIELDS_COUNT,
          actual: actualFields.size
        });
      }

      // 空字段校验
      if (missingFields.length > 0) {
        carErrors.push({
          type: 'EMPTY_FIELD',
          model: carItem.carmodel || `车型${index + 1}`,
          fields: missingFields
        });
      }
      carList.push(carItem);
    });

    if (carErrors.length > 0) {
      const errorMessages = [];
      const countErrors = carErrors.filter(e => e.type === 'FIELD_COUNT');
      console.log(countErrors)
      if (countErrors.length > 0) {
        errorMessages.push(
          countErrors.map(e =>
            `【${e.model}】`
          ).join('\n')
        );
      }
      showToast(`请补全${errorMessages.join('\n\n')}的数据`)
      return;
    }

    const submitParams = {
      id,
      core_functions,
      industry,
      deviceCount: Number(deviceCount),
      carList: whether_vehicle ? carList?.map(item => ({
        ...item,
      })) : [],
    };
    showLoading();
    try {
      byPostJson(
        getApp().data.k1swUrl + u_buyDevice.URL,
        JSON.stringify(Object.assign(submitParams, {
          linkmobile: snitems?.linkmobile,
          linkman: snitems?.linkperson,
          linkaddress: snitems?.address
        })),
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
    } catch (error) {
      showToast('网络连接异常，请检查网络设置');
    } finally {
      hideLoading();
    }
  },
  // 选择地址跳转
  handleSelectAddress() {
    wx.navigateTo({
      url: '/pages/receivingAddress/index?souce=' + 'pages/orderList/orderAdd/orderAdd',
    })
  },
  // 获取缓存choice
  handleChoiceStorage() {
    const _this = this
    wx.getStorage({
      key: 'choice', // 缓存的键名
      success: function (res) {
        _this.setData({
          snitems: res.data
        })
      }
    });
  },


  onLoad(options) {
    this.initialiIndustry()
    this.initialgetIntroduction()
  },

  onReady() {},

  onShow() {
    this.initialiImageBaseConversion()
    if (!this.data.snitems) {
      this.handleChoiceStorage()
    }
  },
})