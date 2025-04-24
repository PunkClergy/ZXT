const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../utils/public').default
const {
  u_addOrUpateMyCompany
} = require('../../../../utils/request/dispatch')
const {
  u_getProvinces,
  u_getCitys
} = require('../../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景大图
    params: {}, //提交参数
    province: null, //省份列表
    provinces: [], //省份列表
    provincesIndex: null, //当前选择省份
    city: null, //城市列表
    citys: [], //城市列表
    cityIndex: null, //当前选择城市
    custom_role: [], //默认客户角色
    items: [{
      name: '客户',
      value: '0',
      checked: false,
    }, {
      name: '渠道合作',
      value: '2',
      checked: false
    }], //角色选择
  },
  handleCheckboxChange(evt) {
    const value = evt.detail.value;
    this.setData({
      custom_role: value
    })
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
  // 点击切换客户角色
  handleBatteryRole(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    this.setData({
      custom_role: item
    })
  },
  // 初始化省份
  initialiProvinces(evt) {
    const _this = this
    byGet(`${getApp().data.k1swUrl}${u_getProvinces.URL}`, {}).then(allRes => {
      _this.setData({
        provinces: allRes?.data.content
      }, () => {
        this.handleInquiryDetails(evt)
      })
    })
  },
  // 提交
  handleSubmit() {
    const {
      params,
      custom_role,
    } = this.data
    showLoading()
    byPost(`${getApp().data.k1swUrl}${u_addOrUpateMyCompany.URL}`, {
      ...params,
      city: params.city || this.data.citys[this.data.cityIndex].id,
      province: params.province || this.data.provinces[this.data.provincesIndex].id,
      role: custom_role
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      showToast(response?.data?.msg);
      wx.reLaunch({
        url: '/pages/channel/scanCodeList/index',
      })
    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },
  // 查询信息
  async handleInquiryDetails(evt) {
    if (!evt?.source) return;

    try {
      const sourceData = JSON.parse(evt.source);
      const {
        province: provinceId,
        city,
        id,
        name,
        chargename,
        chargemobile,
        address
      } = sourceData || {};
      const paramsData = {
        id,
        name,
        chargename,
        chargemobile,
        address
      };

      if (!provinceId) {
        return this.setData({
          params: paramsData
        });
      }
      const cityResponse = await byGet(
        `${getApp().data.k1swUrl}${u_getCitys.URL}`, {
          [u_getCitys.provinceId]: provinceId
        }
      );
      const cities = cityResponse?.data?.content || [];
      const provinceIndex = (this.data.provinces || []).findIndex(item => item?.id == provinceId);

      this.setData({
        citys: cities,
        provincesIndex: provinceIndex !== -1 ? provinceIndex : null,
        cityIndex: cities.findIndex(item => item?.id == city),
        params: paramsData
      });
    } catch (error) {
      console.error('处理详情数据失败:', error);
    }
  },
  onLoad(options) {
    this.initialiProvinces(options)
  },
  onReady() {
    this.initialiImageBaseConversion()
  },
  onShow() {},
})