const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_getCitys,
  u_getProvinces,
  u_companyImprove,
  u_companyInfo,
  u_getRoles
} = require('../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景大图
    params: {}, //提交参数
    area_items: [{
      name: '国内',
      value: '国内',
    }, {
      name: '国外',
      value: '国外',
    }],
    currentArea: '国内',
    items: [{
      name: '客户',
      value: '0',
      checked: false,
    }, {
      name: '服务商',
      value: '1',
      checked: false
    }, {
      name: '渠道合作',
      value: '2',
      checked: false
    }], //角色选择
    provinces: [], //省份列表
    provincesIndex: null, //当前选择省份
    city: [], //城市列表
    cityIndex: null, //当前选择城市
  },
  // 初始化背景图
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
  // 请求区域数据
  initGetRoles(evt) {
    const params = {
      area: evt
    }
    byGet(`${getApp().data.k1swUrl}${u_getRoles.URL}`, params).then(allRes => {
      console.log(allRes)
      const info = allRes.data.content
      this.setData({
        items: info
      },()=>{
          const {
          items,
          params
        } = this.data;
        console.log(items,params?.businessTypes)
        const updatedItems = items.map(item => ({
          id: item?.id,
          name: item?.name,
          checked: params?.businessTypes.includes((item?.id).toString())
        }));
        this.setData({
          items: updatedItems
        });
      })

    })
  },
  // 文本内容输入回调
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
  // 区域改变
  handleAreaCheckboxChange(evt) {
    const value = evt.detail.value
    this.setData({
      currentArea: value
    }, () => {
      this.initGetRoles(this.data.currentArea)
    })
  },
  // 选择角色改变
  handleCheckboxChange(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    evt.detail.value.some(item => item == 1)
    this.setData({
      ...params,
    })
  },
  // 选择省份
  handleProvincesPicker(evt) {
    const _this = this
    const selectIndex = evt.detail.value;
    const {
      provinces,
      params
    } = this.data;
    const selectedProvince = provinces?.[selectIndex];
    const provinceId = selectedProvince?.id;
    this.setData({
      provincesIndex: selectIndex,
      params: {
        ...params,
        province: provinceId,
      }
    }, () => {
      const params = {
        [u_getCitys.provinceId]: provinceId
      }
      byGet(`${getApp().data.k1swUrl}${u_getCitys.URL}`, params).then(allRes => {
        _this.setData({
          citys: allRes?.data.content
        })
      })
    })
  },
  // 选择城市
  handleCityPicker(evt) {
    const selectIndex = evt.detail.value;
    const {
      citys,
      params
    } = this.data;
    const selectedProvince = citys?.[selectIndex];
    const city = selectedProvince.id;
    this.setData({
      cityIndex: selectIndex,
      params: {
        ...params,
        city: city,
      },
    });
  },

  // 初始化省份
  initialiProvinces() {
    const _this = this
    byGet(`${getApp().data.k1swUrl}${u_getProvinces.URL}`, {}).then(allRes => {
      _this.setData({
        provinces: allRes?.data.content
      }, () => {
        this.handleInquiryDetails()
      })
    })
  },
  // 提交
  handleSubmit() {
    const {
      params,
      currentArea
    } = this.data
    byPost(`${getApp().data.k1swUrl}${u_companyImprove.URL}`, {
      ...params,
      serviceArea:currentArea,
      businessTypes: params?.businessTypes?.join()
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      showToast(response?.data?.msg);
    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },
  // 查询信息
  async handleInquiryDetails() {
    try {
      const app = getApp();
      const {
        k1swUrl
      } = app.data;
      const _this = this;
      const companyResponse = await byGet(
        `${k1swUrl}${u_companyInfo.URL}`, {}
      );

      if (companyResponse?.data.code !== 1000) {
        showToast(companyResponse?.data.msg);
        return;
      }
      if (!companyResponse?.data?.content) {
        return;
      }
      const allRes = companyResponse.data.content || {};
      const businessTypes = allRes.businessTypes?.split(',') || [];
      const provinceId = allRes?.province;
      const city = allRes?.city;

      const baseData = {
        params: {
          id: allRes.id || '',
          name: allRes.name || '',
          chargemobile: allRes.chargemobile || '',
          chargename: allRes.chargename || '',
          province: provinceId || '',
          city: city || '',
          rentCarCount: allRes.rentCarCount || '',
          rentCitys: allRes.rentCitys || '',
          serviceArea: allRes.serviceArea || '',
          largeCustomer: allRes.largeCustomer || '',
          bak: allRes?.bak || '',
          businessTypes: businessTypes || '',
        
        },
        provincesIndex: ((index => index === -1 ? null : index)((_this.data.provinces || []).findIndex(item => item?.id == provinceId))),
        currentArea:allRes?.serviceArea
      };
      if (provinceId) {
        const cityResponse = await byGet(
          `${k1swUrl}${u_getCitys.URL}`, {
            [u_getCitys.provinceId]: provinceId
          }
        );
        const cities = cityResponse?.data?.content || [];
        baseData.citys = cities;
        baseData.cityIndex = cities.findIndex(item => item?.id == city);
      }
      _this.setData(baseData, () => {
        this.initGetRoles(this.data.currentArea)
      });

    } catch (error) {
      console.error('数据处理失败:', error);
      showToast('数据加载异常，请稍后重试');
    }
  },
  onLoad(options) {
    this.initialiProvinces()

  },

  onReady() {
    this.initialiImageBaseConversion()
  },


  onShow() {

  },


})