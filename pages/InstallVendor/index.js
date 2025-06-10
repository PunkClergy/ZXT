const appUtil = require('../../utils/app-util.js');
const {
  u_installerapilist
} = require('../../utils/request/eqpmnt')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  byPost,
  byGet
} = require('../../utils/request/http')
const {
  u_getProvinces,
  u_getCitys,
  u_getAreas
} = require('../../utils/request/data_info')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    source: 0,
    g_page: 1,
    g_total: 0,
    g_comParam: '',
    g_items: [],
    provinces: [], //省份列表
    provincesIndex: null, //当前选择省份
    city: [], //城市列表
    cityIndex: null, //当前选择城市
    county: [], //区县列表
    countyIndex: null, //当前选择区县
  },

  onLoad: function (options) {
    this.getOrderList()
  },
  onShow: function () {
    this.initialiProvinces()
    this.initialiImageBaseConversion()
  },
  onReady: function () {

  },
  // 选择省份
  handleProvincesPicker(evt) {
    const _this = this
    const selectIndex = evt.detail.value;
    console.log(evt)
    const {
      provinces,
      params
    } = this.data;
    const selectedProvince = provinces?.[selectIndex];
    const provinceId = selectedProvince?.id;
    this.setData({
      provincesIndex: selectIndex,
      cityIndex: null,
      countyIndex:null,
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
      _this.getOrderList()
    })
  },
  // 选择城市
  handleCityPicker(evt) {
    const _this = this
    const selectIndex = evt.detail.value;
    const {
      citys,
      params
    } = this.data;
    const selectedProvince = citys?.[selectIndex];
    const city = selectedProvince.id;
    this.setData({
      cityIndex: selectIndex,
      countyIndex:null,
      params: {
        ...params,
        city: city,
      },
    }, () => {
      // 查询区县
      const params = {
        [u_getAreas.cityId]: city
      }
      byGet(`${getApp().data.k1swUrl}${u_getAreas.URL}`, params).then(allRes => {
        _this.setData({
          countys: allRes?.data.content
        })
      })
      _this.getOrderList()
    });
  },
  // 选择区县
  handleCityAreas(evt) {
    const _this = this
    const selectIndex = evt.detail.value;
    const {
      countys,
      params
    } = this.data;
    const selectedProvince = countys?.[selectIndex];
    const area = selectedProvince.id;
    this.setData({
      countyIndex: selectIndex,
      params: {
        ...params,
        area: area,
      },
    }, () => {
      _this.getOrderList()
    });
  },
  handleSearch(evt) {
    this.setData({
      g_comParam: evt.detail.value
    }, () => {
      this.getOrderList()
    })
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_installerapilist.name]: this.data.g_comParam,
      [u_installerapilist.page]: this.data.g_page,
      ...this.data.params
    };
    byGet(getApp().data.k1swUrl + u_installerapilist.URL, param).then(response => {
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
  // 初始化省份
  initialiProvinces(evt) {
    const _this = this
    byGet(`${getApp().data.k1swUrl}${u_getProvinces.URL}`, {}).then(allRes => {
      _this.setData({
        provinces: allRes?.data.content
      })
    })
  },

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

})