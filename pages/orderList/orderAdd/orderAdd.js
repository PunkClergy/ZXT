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
  byGet,
  byPostJson
} = require('../../../utils/request/http')
const {
  u_priceCalculation,
  u_getDeviceType,
  u_getCountry,
  u_getDeviceVersion,
  u_buyDevice
} = require('../../../utils/request/data_info')
Page({

  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    g_category_list: [], //类别
    g_category_index: null, //当前选择类别index
    g_country_list: [], //国家
    g_country_index: null, //当前选中国家
    g_device_version_list: [], //硬件版本号
    g_device_version_index: null, //当前硬件版本号
    c_entry_method: 1, //当前选择录入方式
    file: null, //上传的图片
    snitems: null,
    tabs: [{
      id: 0,
      title: '车型1',
    }],
    currentIndex: 0,
    scrollLeft: 0,
    g_cost: 0
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
  // 请求类别数据
  initialiCategory() {
    byPost(getApp().data.k1swUrl + u_getDeviceType.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_category_list: resp
        })
      });
  },
  // 类别发生变化
  handleCategory(evt) {
    this.setData({
      g_category_index: evt.detail.value
    }, () => {
      this.initialiDeviceVersion(this.data.g_category_list[this.data.g_category_index]?.id)
      this.handleCalculatePrice()
    })
  },
  // 请求国家数据
  initialiCountry() {
    byPost(getApp().data.k1swUrl + u_getCountry.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_country_list: resp
        })
      });
  },
  // 国家数据发生变化
  handleCountry(evt) {
    this.setData({
      g_country_index: evt.detail.value
    }, () => {
      this.handleCalculatePrice()
    })
  },
  // 硬件版本数据
  initialiDeviceVersion(evt) {
    const parmas = {
      [u_getDeviceVersion.typeId]: evt
    }
    byPost(getApp().data.k1swUrl + u_getDeviceVersion.URL, parmas,
      (response) => {
        const resp = response.data.content
        this.setData({
          g_device_version_list: resp
        })
      });
  },
  // 硬件数据发生变化
  handleDeviceVersion(evt) {
    this.setData({
      g_device_version_index: evt.detail.value
    }, () => {
      this.handleCalculatePrice()
    })
  },
  // 切换录入方式
  handleEntryMethod(evt) {
    const flag = evt?.currentTarget?.dataset?.item
    this.setData({
      c_entry_method: flag
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
    })
  },
  // 启动方式
  handleBatterylift(evt) {
    const params = this.data?.params
    params['runType' + evt?.currentTarget.dataset.id] = evt.currentTarget.dataset.item
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
    }, () => {
      this.handleCalculatePrice()
    })
  },

  // 上传图片或拍照
  chooseImage() {
    wx.chooseMedia({
      count: 1, // 最多选择1张图片
      mediaType: ['image'], // 只选择图片
      sourceType: ['album', 'camera'], // 允许从相册选择或拍照
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath; // 获取图片临时路径
        this.setData({
          file: tempFilePath,
        });
      },
      fail: (err) => {
        showToast('选择图片失败');
      },
    });
  },
  // 预览图片
  previewImage() {
    if (!this.data.file) return;
    wx.previewMedia({
      sources: [{
        url: this.data.file, // 图片路径
        type: 'image',
      }, ],
    });
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
    })
  },
  // 提交参数
  handleSubmit() {
    const {
      g_category_list = [],
        g_category_index = -1,
        g_country_list = [],
        g_country_index = -1,
        g_device_version_list = [],
        g_device_version_index = -1,
        deviceCount = 0,
        params = {},
        file = null,
        snitems
    } = this.data;
    const validateIndex = (list, index) =>
      Array.isArray(list) && index >= 0 && index < list.length;
    const getValidValue = (list, index) =>
      validateIndex(list, index) ? list[index]?.id : null;

    const deviceType = getValidValue(g_category_list, g_category_index);
    const country = getValidValue(g_country_list, g_country_index);
    const deviceVersion = getValidValue(g_device_version_list, g_device_version_index);
    const requiredBaseFields = [{
        value: deviceType,
        name: '产品类别'
      },
      {
        value: country,
        name: '国家地区'
      },
      {
        value: deviceVersion,
        name: '硬件版本号'
      },
      {
        value: deviceCount,
        name: '数量'
      },
      {
        value: snitems,
        name: '收货信息'
      }
    ];

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


    if (carIndices.size === 0 && g_category_list[g_category_index]?.id == 12) {
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
      deviceType,
      country,
      deviceVersion,
      deviceCount: Number(deviceCount),
      carList: g_category_list[g_category_index]?.id == 12 ? carList?.map(item => ({
        ...item,
      })) : [],
      file: this.initialiUrlToBase64WithMimeType(file)
    };
    showLoading();
    try {
      byPostJson(
        getApp().data.k1swUrl + u_buyDevice.URL,
        JSON.stringify(Object.assign(submitParams, {
          linkmobile: snitems?.linkmobile,
          linkperson: snitems?.linkperson,
          address: snitems?.address
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
  // 计算价格
  handleCalculatePrice() {
    const {
      g_category_list = [],
        g_category_index = -1,
        g_country_list = [],
        g_country_index = -1,
        g_device_version_list = [],
        g_device_version_index = -1,
        deviceCount = 0,
    } = this.data;
    const category = g_category_list[g_category_index];
    const country = g_country_list[g_country_index];
    const deviceVersion = g_device_version_list[g_device_version_index];
    if (!category?.id || !country?.id || !deviceVersion?.id || !deviceCount) {
      return;
    }
    const params = {
      deviceType: category.id,
      country: country.id,
      deviceVersion: deviceVersion.id,
      deviceCount: Number(deviceCount),
    };

    byPostJson(
      getApp().data.k1swUrl + u_priceCalculation.URL,
      params,
      (response) => {
        try {
          const resp = response.data.content;
          if (resp) {
            this.setData({
              g_cost: resp,
            });
          }
        } catch (error) {}
      }
    );
  },
  onLoad(options) {

  },

  onReady() {
    this.initialiImageBaseConversion()
    this.initialiCategory()
    this.initialiCountry()
  },

  onShow() {
    this.handleChoiceStorage()
  },
})