const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_carList,
  u_addOrUpdateCar
} = require('../../../utils/request/car')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_background_tabs_1: '', //tabs背景
    s_background_tabs_2: '', //tabs背景
    s_background_tabs_active_1: '', //tabs背景
    s_background_tabs_active_2: '', //tabs背景
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新状态
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    btnState: '新增',
    id: '', //修改标志
    batterylift: '一键启动', //启动方式
    carOwnerNameValue: '',
    carOwnerName: '智信通', //所属平台
    brakingType: 1
  },


  initCarryParams(evt) {
    const {
      source,
      flagMulti,
      info
    } = evt
    this.setData({
      g_source: source,
      g_flagMulti: flagMulti,
      info: info && JSON.parse(info)
    })
  },
  handleSelectJump(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    wx.redirectTo({
      url: `${this.data.g_source}?datails=${JSON.stringify(item)}`
    })
  },
  // 全屏背景图
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
  // 管控列表数据
  initList() {
    const param = {
      [u_carList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_carList.URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  // 触底请求
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.initList();
    });
  },
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
  },
  // 内容输入回调
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
  // 点击内容回调
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  // 点击内容回调
  handleBrakingType(evt) {
    const brakingType = evt.currentTarget.dataset.item
    this.setData({
      brakingType
    })
  },
  // 点击内容回调
  handleCarOwnerName(evt) {
    const carOwnerName = evt.currentTarget.dataset.item
    this.setData({
      carOwnerName
    })
  },
  handleCarOwnerNameBindinput(evt) {
    this.setData({
      carOwnerNameValue: evt.detail.value
    })
  },
  //提交内容
  handleSubmit() {
    const apiUrls = {
      getCarStatus: getApp().data.k1swUrl + u_addOrUpdateCar.URL
    };
    const param = {
      ...this.data.params,
      brakingType: this.data.brakingType,
      batterylift: this.data.batterylift,
      carOwnerName: this.data.carOwnerName == '智信通' ? this.data.carOwnerName : this.data.carOwnerNameValue
    };
    const validations = [{
        field: 'vehicleSerialName',
        message: '请填写车系'
      },
      {
        field: 'vehicleModeName',
        message: '请填写车型'
      },
      {
        field: 'ccdate',
        message: '请填写年款'
      },
      {
        field: 'platenumber',
        message: '请填写车牌号'
      },
      {
        field: 'vin',
        message: '请填写车架号'
      },
      {
        field: 'xsgw',
        message: '请填写油箱容积'
      }
    ];

    for (const {
        field,
        message
      } of validations) {
      if (!param[field]?.trim()) {
        showToast(message);
        return;
      }
    }
    console.log(param)
    showLoading();
    byPost(apiUrls.getCarStatus, param,
      (response) => {
        hideLoading();
        if (response.data.code == 1000) {
          this.setData({
            c_activeTab: 1, // 默认选中的Tab索引
            params: {}, //新增管控数据部分字段
            btnState: '新增',
            id: '', //修改标志
            batterylift: '一键启动', //启动方式
            carOwnerNameValue: '',
            carOwnerName: '智信通', //所属平台
            brakingType: 1
          })
        } else {
          showToast(response.data.msg)
        }

      });
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_activeTab: 2,
      btnState: '修改',
      id: info?.id,
      params: {
        vehicleSerialName: info?.vehicleSerialName,
        vehicleModeName: info?.vehicleModeName,
        ccdate: info?.ccdate,
        introduction: info?.introduction,
        platenumber: info?.platenumber,
        vin: info?.vin,
        xsgw: info?.xsgw,
        sn: info?.sn
      },
      batterylift: info?.batterylift || '一键启动',
      brakingType: info?.brakingType,
      carOwnerName: info?.carOwnerName,
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '车辆列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增',
        params: {},
        g_roleList_index: null
      })
    }
    if (flag == '新增车辆' || flag == '修改修改') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },

  onLoad(options) {
    this.initCarryParams(options)
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
})