const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const bleManager = require('../../../utils/ble-manager.js');

const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_rentRecord,
  u_sendRentKey
} = require('../../../utils/request/self')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    s_background_picture_of_the_front_page: '', //全背景图
    s_background_tabs_1: '', //tabs背景
    s_background_tabs_2: '', //tabs背景
    s_background_tabs_active_1: '', //tabs背景
    s_background_tabs_active_2: '', //tabs背景
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    c_activeTab: 1, // 默认选中的Tab索引
    c_send_key_show_momal: false,
    g_total: 0, //记录总数
    c_tabs: [{
        name: '电子钥匙',
        value: '1'
      },
      {
        name: '数据及风控',
        value: '2'
      }
    ], //tabs切换签
    g_items: [], // 数据列表
    page: 1, //当前页数
    cellData: null,
    isShow: false,
    startDate: '2025-03-20', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
    endDate: '2025-03-20', //历史轨迹查询时间
    endTime: '19:00', //历史轨迹查询时间
  },
  // 转换背景图
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }, {
      path: '/assets/images/home/1-1.png',
      key: 's_background_tabs_1'
    }, {
      path: '/assets/images/home/2-1.png',
      key: 's_background_tabs_active_1'
    }, {
      path: '/assets/images/home/1-2.png',
      key: 's_background_tabs_2'
    }, {
      path: '/assets/images/home/2-2.png',
      key: 's_background_tabs_active_2'
    }, ];
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
  // 切换tabs标签
  handleSwitchTab(e) {
    const text = e._relatedInfo.anchorTargetText
    if (!(this.data.cellData) && (this.data.c_activeTab == 1)) {
      showToast('请先选择车辆')
      return
    }
    this.setData({
      c_activeTab: text == '电子钥匙' ? 1 : 2
    })
  },
  // 跳转车辆列表
  handleJumpCarList() {
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/rentKeySend/sending/sending',
    })
  },
  // 请求电子钥匙发送记录
  getKeySendingList: async function (evt) {
    showLoading("加载中...");
    try {
      const app = getApp();
      const url = app.data.k1swUrl + u_rentRecord.URL;
      const params = {
        [u_rentRecord.vehId]: evt,
        [u_rentRecord.page]: this.data.page
      };
      const response = await byGet(url, params);
      const resp = response.data;
      if (this.data.page > 1 && resp.content.length === 0) {
        showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        return;
      }
      this.setData({
        g_total: resp.count || 0,
        g_items: [...this.data.g_items, ...resp.content]
      });
    } catch (error) {
      showToast("数据加载失败，请重试");
    } finally {
      hideLoading();
    }
  },
  // 电子钥匙发送记录到底执行
  handleLower() {
    const page = this.data.page;
    this.setData({
      page: page + 1,
    }, () => {
      this.getKeySendingList(this.data.vehId)
    });
  },
  // 车辆信息数据
  handleCarInfo(options) {
    if (options?.datails) {
      try {
        const carItem = JSON.parse(options.datails)
        this.setData({
          cellData: carItem,
          vehId: carItem.id
        })

        this.getKeySendingList(carItem.id)
      } catch (e) {
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    }
  },
  // 发送电子钥匙弹窗
  handleShowSendKeyModal() {
    this.setData({
      c_send_key_show_momal: true
    });
  },
  handleHideSengKeyModal() {
    this.setData({
      c_send_key_show_momal: false
    })
  },
  // 提交发送钥匙
  handleFormSubmit(evt) {
    const { startDate, startTime, endDate, endTime, vehId } = this.data;
    const formData = evt.detail.value;
    const validations = [
      { field: formData.personName, message: '请输入使用人' },
      { field: formData.mobile, message: '请输入手机号' }
    ];
  
    const validationError = validations.find(({ field }) => !field);
    if (validationError) {
      showToast(validationError.message);
      return;
    }
  
    const buildDateTime = (date, time) => 
      `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
  
    const requestParams = {
      vehId: vehId,  
      startDate: buildDateTime(startDate, startTime),
      endDate: buildDateTime(endDate, endTime),
      personName: formData.personName,
      mobile: formData.mobile
    };
  
    const API_ENDPOINTS = {
      baseURL: getApp().data.k1swUrl,
      sendRentKey: u_sendRentKey.URL
    };
  
    const submitRequest = async () => {
      try {
        const response = await byGet(
          `${API_ENDPOINTS.baseURL}${API_ENDPOINTS.sendRentKey}`,
          requestParams
        );
  
        if (response.data.code !== 1000) {
          throw new Error(response.data.msg);
        }
  
        showToast('发送成功');
        this.setData({ 
          page: this.data.page + 1,
          c_send_key_show_momal: false 
        });
        await this.getKeySendingList(vehId); 
  
      } catch (error) {
        showToast(error.message || '请求失败，请稍后重试');
      }
    };
  
    submitRequest();
  },
  // 选择日期
  bindTimeChange(e) {
    const category = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [category]: value
    })

  },

  onLoad: function (options) {
    this.initialiImageBaseConversion()
    this.handleCarInfo(options)
  },

  onReady() {

  },

})