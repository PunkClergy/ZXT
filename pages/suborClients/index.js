const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  showLoading,
  hideLoading
} = require('../../utils/Inspect/tips')
const {
  u_getDeviceType,
  u_getProductType,
  u_getCountry,
  u_getDeviceVersion,
  u_devaddOrUpdate
} = require('../../utils/request/data_info')
const {
  u_companyList
} = require('../../utils/request/dispatch')
const {
  byGet,
  byPost,
  byPostJson
} = require('../../utils/request/http')

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    g_product_type_list: [], //产品类别数据
    g_product_type_index: null, //当前选择产品类别
    g_device_version_list: [], //价格类型数据
    g_device_version_index: null, //当前选择价格类型
    g_device_type_list: [], //销售代号数据
    g_device_type_index: null, //当前选择销售代号
    g_country_list: [], //国家数据
    g_country_index: null, //当前选中国家
    g_currency_list: [], //币种数据
    g_currency_index: null, //当前选择币种
    g_company_list: [], //客户数据
    g_company_index: null, //当前选择客户
    params: {}, //提交数据集合
    g_install_cost: 1, //安装费限制
    g_group_cost: 1, //原车钥匙组装费限制
    g_test_cost: 1, //拆除运输检验费限制
    g_priority_cost: 1, //优先级
    startDate: '', //体验开始时间
    endDate: '', //体验结束时间
    c_view_state: false, //是否为查看
    g_ladder_list: [{
      devicecount: '',
      deviceprice: ''
    }], //阶梯数据stairsList
  },
  // 产品类别切换
  handleCategory(evt) {

    const flag = evt.currentTarget.dataset.flag;
    const value = evt.detail.value;
    const flagMap = {
      product_type: () => {
        this.setData({
          g_product_type_index: value
        }, () => {
          this.initialiDevicetype(this.data.g_product_type_list[this.data.g_product_type_index].id);
        });
      },
      device_version: () => {
        this.setData({
          g_device_version_index: value
        });
      },
      device_type: () => {
        this.setData({
          g_device_type_index: value
        });
      },
      country: () => {
        this.setData({
          g_country_index: value
        });
      },
      company: () => {
        showLoading()
        this.setData({
          g_company_index: value
        }, () => {
          hideLoading()
        });
      },
      currency: () => {
        this.setData({
          g_currency_index: value
        });
      }
    };
    if (flagMap[flag]) {
      flagMap[flag]();
    }
  },
  // 内容输入回调
  handleNumBindinput(evt) {
    const interval = 100;
    if (!this.lastTime) {
      this.lastTime = 0;
    }
    const now = Date.now();
    if (now - this.lastTime >= interval) {
      this.lastTime = now;
      const params = this.data.params;
      const new_parmas = {
        ...params,
        [evt.currentTarget.dataset.value]: evt.detail.value,
      };
      this.setData({
        params: new_parmas,
      });
    }
  },
  // 限制切换
  handleEntryMethod(evt) {
    const item = evt.currentTarget.dataset.item
    const flag = evt.currentTarget.dataset.flag
    if (flag == 'install_cost') {
      this.setData({
        g_install_cost: item
      })
    } else if (flag == 'group_cost') {
      this.setData({
        g_group_cost: item
      })
    } else if (flag == 'test_cost') {
      this.setData({
        g_test_cost: item
      })
    } else if (flag == 'priority_cost') {
      this.setData({
        g_priority_cost: item
      })
    }
  },
  handleDate(evt) {
    const flag = evt.currentTarget.dataset.flag
    if (flag == 'start') {
      this.setData({
        startDate: evt.detail.value
      })
    } else if (flag == 'end') {
      this.setData({
        endDate: evt.detail.value
      })
    }

  },
  // 增加阶梯价格数据
  handlePlusLadder() {
    const g_ladder_list = this.data.g_ladder_list
    const temp = {
      devicecount: '',
      deviceprice: ''
    }
    g_ladder_list.push(temp)
    this.setData({
      g_ladder_list
    })
  },
  // 减少阶梯价格数据
  handleReduceLadder(evt) {
    const flag = evt.currentTarget.dataset.index
    const g_ladder_list = this.data.g_ladder_list
    const new_list = g_ladder_list.filter((_, index) => index !== flag);
    this.setData({
      g_ladder_list: new_list
    })
  },
  // 阶梯价格输入回调
  handleLadder(evt) {
    const index = evt.currentTarget.dataset.item
    const flag = evt.currentTarget.dataset.flag
    const g_ladder_list = this.data.g_ladder_list
    const value = evt.detail.value
    if (flag == 'devicecount') {
      g_ladder_list[index].devicecount = value
    } else if (flag == 'deviceprice') {
      g_ladder_list[index].deviceprice = value
    }
    this.setData({
      g_ladder_list
    })
  },
  // 提交
  handleSubmit() {
    const {
      g_product_type_list,
      g_product_type_index,
      g_device_version_list,
      g_device_version_index,
      g_device_type_list,
      g_device_type_index,
      g_country_list,
      g_country_index,
      g_currency_list,
      g_currency_index,
      g_company_list, //客户数据
      g_company_index, //当前选择客户
      g_install_cost,
      g_group_cost,
      g_test_cost,
      g_priority_cost,
      startDate,
      endDate,
      params,
      g_ladder_list
    } = this.data
    console.log(this.data)
    const temp = {
      ...params,
      producttypeid: g_product_type_list[g_product_type_index]?.id,
      deviceversionid: g_device_version_list[g_device_version_index]?.id,
      devicetypeid: g_device_type_list[g_device_type_index]?.id,
      countryid: g_country_list[g_country_index]?.id,
      currency: g_currency_list[g_currency_index]?.id,
      companyid: g_company_list[g_company_index]?.id,
      needInstall: g_install_cost,
      needTakeCare: g_group_cost,
      needTransport: g_test_cost,
      priority: g_priority_cost,
      testStartDate: startDate,
      testEndDate: endDate,
      stairsList: g_ladder_list
    }
    byPostJson(getApp().data.k1swUrl + u_devaddOrUpdate.URL, temp,
      (response) => {
        if (response?.data?.code) {
          wx.reLaunch({
            url: '/pages/suborClientsList/index',
          })
        }
      });
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
  // 请求类别数据
  initialiCategory() {
    byPost(getApp().data.k1swUrl + u_getProductType.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_product_type_list: resp
        })
      });
  },
  // 价格类型数据
  initialiDeviceVersion() {
    byPost(getApp().data.k1swUrl + u_getDeviceVersion.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_device_version_list: resp
        })
      });
  },
  // 销售代号数据
  initialiDevicetype(evt, info) {
    const params = {
      [u_getDeviceType.productTypeId]: evt
    };
    const requestUrl = `${getApp().data.k1swUrl}${u_getDeviceType.URL}`;
    const findSafeIndex = (list, id) => {
      if (!Array.isArray(list)) return null;
      const index = list.findIndex(ele => ele.id === id);
      return index >= 0 ? index : null;
    };
    const updateDeviceInfo = () => {
      const {
        g_product_type_list,
        g_device_version_list,
        g_country_list,
        g_currency_list,
        g_company_list
      } = this.data;
      const indexMapping = {
        g_product_type_index: [g_product_type_list, info.producttypeid],
        g_device_type_index: [this.data.g_device_type_list, info.devicetypeid],
        g_device_version_index: [g_device_version_list, info.deviceversionid],
        g_country_index: [g_country_list, info.countryid],
        g_currency_index: [g_currency_list, info.currency],
        g_company_index: [g_company_list, info.companyid],
      };
      const indexes = Object.entries(indexMapping).reduce((acc, [key, [list, id]]) => {
        acc[key] = findSafeIndex(list, id);
        return acc;
      }, {});
      const {
        needInstall: g_install_cost,
        needTakeCare: g_group_cost,
        needTransport: g_test_cost,
        priority: g_priority_cost,
        testStartDate: startDate,
        testEndDate: endDate,
        stairsList: g_ladder_list
      } = info || {};
      this.setData({
        params: {
          ...info
        },
        ...indexes,
        g_install_cost,
        g_group_cost,
        g_test_cost,
        g_priority_cost,
        startDate,
        endDate,
        g_ladder_list
      });
    };
    byPost(requestUrl, params, (response) => {
      this.setData({
        g_device_type_list: response.data.content,
        g_device_type_index: null
      }, () => info && updateDeviceInfo());
    }, () => {});
  },
  // 国家数据
  initialiCountry() {
    byPost(getApp().data.k1swUrl + u_getCountry.URL, {},
      (response) => {
        const resp = response.data.content
        this.setData({
          g_country_list: resp
        })
      });
  },
  // 币种数据
  initialiCurrency() {
    const currencyList = [{
      id: '人民币',
      name: '人民币',
    }, {
      id: '美元',
      name: '美元',
    }, ]
    this.setData({
      g_currency_list: currencyList
    })
  },
  // 客户列表数据
  initialiCompanyList() {
    const param = {
      [u_companyList.name]: '',
      [u_companyList.page]: 1,
    };
    byGet(getApp().data.k1swUrl + u_companyList.URL, param).then(response => {
      const resp = response.data.content
      this.setData({
        g_company_list: resp
      })
    })
  },
  // 编辑跳转来
  initialiEdit(options) {
    if (options.item) {
      const info = JSON.parse(options?.item)
      this.initialiDevicetype(info?.producttypeid, info)
    }
    if (options?.type) {
      this.setData({
        c_view_state: true
      })
    }
  },
  // 按顺序执行
  async initialiSort(evt) {
    try {
      const initializationTasks = [
        this.initialiCategory(),
        this.initialiDeviceVersion(),
        this.initialiCountry(),
        this.initialiCurrency(),
        this.initialiCompanyList(),
      ];

      await Promise.all(initializationTasks);
      this.initialiEdit(evt);
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  },
  onLoad(options) {
    this.initialiSort(options)
  },
  onReady() {},
  onShow() {
    this.initialiImageBaseConversion()

  },


  onHide() {

  },
})