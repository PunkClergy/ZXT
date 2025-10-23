const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_phouseFlowList,
  u_paddOrUpdate,
  u_houseFlowApidel
} = require('../../utils/request/car')
const {
  byPost,
  byGet
} = require('../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
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

  handleChangeBlack(evt) {
    // 使用解构赋值一次性获取所有需要的数据
    const {
      id
    } = evt.currentTarget.dataset.item;
    const {
      g_black,
      g_platenumbers,
      g_items
    } = this.data;

    // 转换为 Set 操作更高效
    const blackSet = new Set(g_black);
    const plateSet = new Set(g_platenumbers);

    // 增加安全判断防止 undefined
    const vehicle = g_items.find(item => item.id === id);
    if (!vehicle) return;

    // 统一操作逻辑：存在则删除，不存在则添加
    if (blackSet.has(id)) {
      blackSet.delete(id);
      plateSet.delete(vehicle.platenumber); // 同步移除车牌号
    } else {
      blackSet.add(id);
      plateSet.add(vehicle.platenumber); // 同步添加车牌号
    }
    // 单次 setData 更新所有数据
    this.setData({
      g_black: [...blackSet], // 使用展开运算符更简洁
      g_platenumbers: [...plateSet]
    });
  },
  handleJumpBlackInfo() {
    wx.reLaunch({
      url: `${this.data.g_source}?black=${this.data.g_black}&type=${this.data.type}&name=${this.data.name}&platenumbers=${this.data.g_platenumbers}&info=${JSON.stringify(this.data.info)}`,
    })
  },
  // 扫码按钮点击事件
  scanCode() {
    wx.scanCode({
      onlyFromCamera: false, // 是否只允许相机扫码（false表示允许从相册选择）
      scanType: ['qrCode', 'barCode'], // 扫码类型：二维码、条形码
      success: (res) => {
        console.log('扫码成功:', res)
        this.handleScanResult(res.result)
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        wx.showToast({
          title: '扫码失败',
          icon: 'error'
        })
      }
    })
  },
  // 处理扫码结果
  handleScanResult(result) {
    const params = this.data.params
    this.setData({
      params: {
        ...params,
        sn: result
      },
    })
  },
  initCarryParams(evt) {
    const {
      source,
      flagMulti,
      info,
      allParams,
      type,
      name
    } = evt

    this.setData({
      g_source: source,
      g_flagMulti: flagMulti,
      info: info && JSON.parse(info),
      allParams: allParams,
      type: type,
      name: name
    })
  },
  handleSelectJump(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    if (this.data.allParams) {
      wx.redirectTo({
        url: `${this.data.g_source}?datails=${JSON.stringify(item)}&allParams=${this.data.allParams}&type=${this.data.type}`
      })
    } else {
      wx.redirectTo({
        url: `${this.data.g_source}?datails=${JSON.stringify(item)}`
      })
    }

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
    },];
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
      [u_phouseFlowList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_phouseFlowList.URL, param).then(response => {
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
  handleOnDateChange1(evt) {
    const info = evt?.detail?.value
    this.setData({
      rentenddate: info
    })
  },
  handleOnDateChange2(evt) {
    const info = evt?.detail?.value
    this.setData({
      rentstartdate: info
    })
  },
  handleOnDateChange3(evt) {
    const info = evt?.detail?.value
    this.setData({
      signdate: info
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
      getCarStatus: getApp().data.k1swUrl + u_paddOrUpdate.URL
    };
    const param = {
      ...this.data.params,
      rentenddate: this.data.rentenddate,
      rentstartdate: this.data.rentstartdate,
      signdate: this.data.signdate,
      id: this.data.id || ''
    };
    const validations = [
      // {
      //   field: 'platenumber',
      //   message: '请填写车牌号'
      // },
      // {
      //   field: 'sn',
      //   message: '请填写设备号'
      // }
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
            brakingType: 1,
            g_page: 1, //列表页码
            g_items: [], //列表数据
          })
          showToast(response.data.msg)
          getApp().data.reflag = 1
          this.initList()
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
        ...info
      },
      rentenddate: info.rentenddate,
      rentstartdate: info.rentstartdate,
      signdate: info.signdate,

    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '合作商列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增',
        params: {},
        id: '',
        g_roleList_index: null
      })
    }
    if (flag == '新增合作商' || flag == '修改合作商') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },
  handleDelete(evt) {
    const info = { id: evt?.currentTarget?.dataset?.item?.id }
    byPost(getApp().data.k1swUrl + u_houseFlowApidel.URL, info, (response) => {
      if (response?.data?.code == 1000) {
        showToast(response?.msg)
        this.setData({
          g_items: [],
          g_page: 1
        }, () => {
          this.initList()
        })
      }

    });
  },
  onLoad(options) {
    this.initCarryParams(options)
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
})