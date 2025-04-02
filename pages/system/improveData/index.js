const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_getCitys,
  u_getProvinces,
  u_companyImprove,
  u_companyInfo
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
    eye_show_hide: true, //密码显示和隐藏
    s_show_renters: false, //是否勾选了角色的租车人
    s_show_channel: false, //是否勾选了角色的渠道合作
    items: [{
      name: '租车人',
      value: 1,
      checked: false,
    }, {
      name: '租车公司',
      value: 2,
      checked: false
    }, {
      name: '渠道合作',
      value: 3,
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
  // 选择角色改变
  handleCheckboxChange(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value

    evt.detail.value.some(item => item == 1)
    this.setData({
      ...params,
      s_show_renters: evt.detail.value.some(item => item == 1),
      s_show_channel: evt.detail.value.some(item => item == 3)
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
          city: allRes?.data.content
        })
      })
    })
  },
  // 选择城市
  handleCityPicker(evt) {
    const selectIndex = evt.detail.value;
    const {
      city,
      params
    } = this.data;
    const selectedProvince = city?.[selectIndex];
    const cityId = selectedProvince.id;
    this.setData({
      cityIndex: selectIndex,
      params: {
        ...params,
        city: cityId,
      },
    });
  },
  // 关闭或开启密码眼睛
  handleshowHide() {
    const eye = this.data.eye_show_hide
    this.setData({
      eye_show_hide: !eye
    })
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
      params
    } = this.data
    byPost(`${getApp().data.k1swUrl}${u_companyImprove.URL}`, {
      ...params,
      businesstypeStr: params?.businesstypeStr?.join()
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      showToast('添加成功');
    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },
  // 查询信息
  async handleInquiryDetails() {
    try {
      const app = getApp();
      const { k1swUrl } = app.data;
      const _this = this;
      const companyResponse = await byGet(
        `${k1swUrl}${u_companyInfo.URL}`,
        {}
      );
  
      if (companyResponse?.data.code !== 1000) {
        showToast(companyResponse?.data.msg);
        return;
      }
      const allRes = companyResponse.data.content || {};
      const businessTypes = allRes.businesstypeStr?.split(',') || [];
      const provinceId = allRes.province;
      const cityId = allRes.city;
      const baseData = {
        params: {
          id: allRes.id,
          name: allRes.name,
          chargemobile: allRes.chargemobile,
          chargename: allRes.chargename,
          province: provinceId,
          city: cityId,
          rentCarCount: allRes.rentCarCount,
          rentCitys: allRes.rentCitys,
          areas: allRes.areas,
          largeCustomer: allRes.largeCustomer,
          businesstypeStr: businessTypes
        },
        provincesIndex: (_this.data.provinces || []).findIndex(
          item => item?.id === provinceId
        ),
        s_show_renters: businessTypes.includes('1'),
        s_show_channel: businessTypes.includes('3')
      };
      if (provinceId) {
        const cityResponse = await byGet(
          `${k1swUrl}${u_getCitys.URL}`,
          { [u_getCitys.provinceId]: provinceId }
        );
        
        const cities = cityResponse?.data?.content || [];
        baseData.city = cities;
        baseData.cityIndex = cities.findIndex(item => item?.id === cityId);
      }
      _this.setData(baseData);
  
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