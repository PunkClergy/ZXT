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
  byGet
} = require('../../../utils/request/http')
const {
  u_getDeviceType,
  u_getCountry,
  u_getDeviceVersion,
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
    tabs: [{
      id: 0,
      title: '车型1',
    }],
    currentIndex: 0,
    scrollLeft: 0
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
      num: evt.detail.value
    })
  },
  // 提交参数
  handleSubmit() {
    const {
      g_category_list,
      g_category_index,
      g_country_list,
      g_country_index,
      g_device_version_list,
      g_device_version_index,
      num,
      params
    } = this.data;

    const category = g_category_list[g_category_index]?.id;
    const country = g_country_list[g_country_index]?.id;
    const device_version = g_device_version_list[g_device_version_index]?.id;
    if (!category || !country || !device_version || !num) {
      showToast('基础字段不得为空')
      return;
    }

    const result = [];
    const keys = Object.keys(params);
    const maxIndex = Math.max(
      ...keys.map((key) => {
        const match = key.match(/\d+$/); 
        return match ? parseInt(match[0], 10) : -1;
      })
    );

    for (let i = 0; i <= maxIndex; i++) {
      const obj = {};
      let hasEmptyField = false;

      for (const key of keys) {
        if (key.endsWith(String(i))) {
          const newKey = key.replace(/\d+$/, ""); 
          const value = params[key];
          if (!value) {
            showToast(`列表项 ${i} 的字段 ${newKey} 不得为空`);
            hasEmptyField = true;
          }

          obj[newKey] = value;
        }
      }
      if (hasEmptyField) {
        return;
      }
      result.push(obj);
    }

    if (result.length === 0) {
      showToast('列表数据不得为空')
      return;
    }
    const submit_params = {
      category,
      country,
      device_version,
      num,
      list: result,
    };

    console.log(submit_params);
  },
  
  // 切换tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
  },

  // 添加tab
  addTab() {
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
  closeTab(e) {
    if (this.data.tabs.length === 1) return

    const id = e.currentTarget.dataset.id
    const newTabs = this.data.tabs.filter(tab => tab.id !== id)
    const newIndex = Math.min(this.data.currentIndex, newTabs.length - 1)

    this.setData({
      tabs: newTabs,
      currentIndex: newIndex
    })
  },
  onLoad(options) {

  },


  onReady() {
    this.initialiImageBaseConversion()
    this.initialiCategory()
    this.initialiCountry()
  },

  onShow() {

  },
})