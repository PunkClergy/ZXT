const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../utils/public').default
const {
  u_addOrUpdateCustomer
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


  // 提交
  handleSubmit() {
    const {
      params,
    } = this.data
    showLoading()
    byPost(`${getApp().data.k1swUrl}${u_addOrUpdateCustomer.URL}`, {
      ...params
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      showToast(response?.data?.msg);
      wx.redirectTo({
        url: '/pages/CustomerReporting/index?type=' + (this.data.params.type || 1),
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
    const source = JSON.parse(options?.source)
    this.setData({
      params: {
        id: source?.id,
        customername: source?.customername,
        linkperson: source?.linkperson,
        linkmobile: source?.linkmobile,
        address: source?.address,
        type: source?.type
      }
    })
  },
  onReady() {
    this.initialiImageBaseConversion()
  },
  onShow() { },
})