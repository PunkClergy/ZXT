const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_getCitys,
  u_getProvinces,
} = require('../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    eye_show_hide: true, //密码显示和隐藏
    s_show_renters: false,
    s_show_channel: false,
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
    }, ],
    provinces: [], //省份列表
    provincesIndex: 0, //当前选择省份
    city: [], //城市列表
    cityIndex: 0, //当前选择城市
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
  //选择角色改变
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
        provinceId,
      }
    }, async () => {
      try {
        const requestParams = {
          [u_getCitys.provinceId]: provinceId
        };
        const baseUrl = getApp().data.k1swUrl;
        const response = await byGet(`${baseUrl}${u_getCitys.URL}`, requestParams);
        this.setData({
          city: response.data?.content || [],
        });
      } catch (error) {}
    });
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
        cityId,
      },
    });
  },
  // 关闭密码眼睛
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
      })
    })
  },
  // 提交
  handleSubmit() {
    const {
      params
    } = this.data
    console.log(params)
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