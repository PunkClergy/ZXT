const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_userInsureList,
  u_getPayPrice,
  u_batchNewLoseInsure,
  u_loseInsureList,
  u_batchNewWycInsure,
  u_getBatchWycPrice,
  u_getBatchLosePrice,
  u_stopShutDowninsure
} = require('../../utils/request/car')
const {
  byPost,
  byGet,
  byPostJson
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
    imgUrl: 'https://k3a.wiselink.net.cn/' + 'img/',
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新状态
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    price: 0,
    datalist: [
      { applicantName: '', applicantIdcard: '', plateNumber: '' }
    ],
    datalistOne: [
      { rentorderno: '', sn: '', insuredamount: '', ylname: '', otaname: '', platenumber: '', rentdays: '', rentstarttime: '', rentendtime: '', rentstartcity: '', rentendcity: '' }
    ]
  },
  // 停保
  handleStop(evt) {
    const that = this;
    const insurance_type = this.data.insurance_type;
    const id = evt?.currentTarget?.dataset.id; // 获取传入的id

    // 显示确认对话框
    wx.showModal({
      title: '确认停保',
      content: insurance_type == 1 ? '确定要执行失联险停保吗？' : '确定要执行停运险停保吗？',
      success(res) {
        if (res.confirm) {
          if (insurance_type == 1) {
            // 失联停保逻辑
            that.executeLossContactStop(id);
          } else {
            // 停运险停保逻辑
            that.executeShutdownInsureStop(id);
          }
        }
      }
    });
  },

  // 执行失联停保
  executeLossContactStop(id) {
    // 这里替换实际的失联停保API调用
    byPost(getApp().data.k1swUrl + u_stopLossContact.URL, { id }, (res) => {
      this.handleStopResult(res);
    }, (err) => {
      this.handleStopError(err);
    });
  },

  // 执行停运险停保
  executeShutdownInsureStop(id) {
    byPost(getApp().data.k1swUrl + u_stopShutDowninsure.URL, { id }, (res) => {
      this.handleStopResult(res);
    }, (err) => {
      this.handleStopError(err);
    });
  },

  // 处理成功结果
  handleStopResult(res) {
    console.log('停保结果:', res);
    if (res.data.code === 1000) {
      wx.showModal({
        title: '操作成功',
        content: res.data.msg,
        showCancel: false,
        confirmText: '关闭'
      });
    } else {
      wx.showModal({
        title: '操作异常',
        content: res.msg || '停保操作未完成，请重试',
        showCancel: false,
        confirmText: '关闭'
      });
    }
  },

  // 处理失败错误
  handleStopError(err) {
    console.error('停保失败:', err);
    wx.showModal({
      title: '请求失败',
      content: err.errMsg || '网络请求失败，请检查网络',
      showCancel: false,
      confirmText: '关闭'
    });
  },
  // 查看保单
  handlePolicy(evt) {
    console.log(this.data.imgUrl + evt?.currentTarget.dataset.item)
    wx.downloadFile({
      url: this.data.imgUrl + evt?.currentTarget.dataset.item,
      success: (res) => {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: (res) => {
            console.log('打开PDF成功')
          },
          fail: (err) => {
            console.error('打开PDF失败', err)
            wx.showToast({
              title: '打开文件失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('下载失败', err)
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        })
      }
    })
  },
  handleCarList(evt) {
    if (this.data.insurance_type == 1) {

    }
    const sourcePath = '/pages/buySwiper/buySwiper';
    const params = {

      index: evt.currentTarget.dataset.item,  // 事件参数
      c: 2,                                  // 固定值
      datalist: JSON.stringify(this.data.insurance_type == 1 ? this.data.datalistOne : this.data.datalist),           // 组件数据
      insurance_type: this.data.insurance_type // 组件数据
    };
    const type = this.data.insurance_type == 1 ? 1 : 0
    const encodedParams = JSON.stringify(params);
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=${sourcePath}&allParams=${encodedParams}&type=${type}`
    });
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
    console.log(this.data.insurance_type)
    const param = {
      [u_userInsureList.page]: this.data.g_page,
    };
    const url = this.data.insurance_type == 1 ? u_loseInsureList : u_userInsureList
    byGet(getApp().data.k1swUrl + url.URL, param).then(response => {
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
  // 获取服务费
  inituGetPayPrice() {
    const _this = this
    byGet(getApp().data.k1swUrl + u_getPayPrice.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          service_charge: response?.data.content
        })
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
  handlePrice() {
    byPostJson(getApp().data.k1swUrl + u_getBatchWycPrice.URL, JSON.stringify(this.data.datalist), (response) => {
      if (response.data.code == 1000) {
        console.log(response)
        this.setData({
          price: response.data.content
        })
      } else {
        // 处理接口返回的错误
        wx.showToast({
          title: response.data.msg || '投保失败',
          icon: 'none'
        });
      }
    });
  },
  // 增加数据
  handleAddListOne() {
    const datalistOne = this.data.datalistOne
    let temp = { rentorderno: '', sn: '', ylname: '', otaname: '', platenumber: '', rentdays: '', rentstarttime: '', rentendtime: '', rentstartcity: '', rentendcity: '' }
    datalistOne.push(temp)
    this.setData({
      datalistOne
    })
  },
  // 增加一条数据
  handleAddList() {
    const _this = this
    const datalist = this.data.datalist
    let temp = {
      applicantName: '', applicantIdcard: '', plateNumber: ''
    }
    datalist.push(temp)
    this.setData({
      datalist
    }, () => {
      this.handlePrice()
    })
  },
  handleDeteleListOne(evt) {
    const datalistOne = this.data.datalistOne
    const index = evt.currentTarget.dataset.index
    const newList = datalistOne.filter((_, i) => i !== index);
    this.setData({
      datalistOne: newList
    })
  },
  // 删除数据
  handleDeteleList(evt) {
    const datalist = this.data.datalist
    const index = evt.currentTarget.dataset.index
    const newList = datalist.filter((_, i) => i !== index);
    this.setData({
      datalist: newList
    }, () => {
      this.handlePrice()
    })
  },
  handleTypePrice() {
    byPostJson(getApp().data.k1swUrl + u_getBatchLosePrice.URL, JSON.stringify(this.data.datalistOne), (response) => {
      if (response.data.code == 1000) {
        console.log(response)
        this.setData({
          price: response.data.content
        })
      } else {
        // 处理接口返回的错误
        wx.showToast({
          title: response.data.msg || '投保失败',
          icon: 'none'
        });
      }
    });

  },
  // 内容输入回调
  handleBindinput(evt) {
    const insurance_type = this.data.insurance_type
    if (insurance_type == 1) {
      const index = evt.currentTarget.dataset.index
      const key = evt.currentTarget.dataset.item
      const datalistOne = this.data.datalistOne
      datalistOne[index][key] = evt.detail.value
      this.setData({
        datalistOne
      }, () => {
        if (evt?.currentTarget.dataset.price) {
          this.handleTypePrice()
        }
      })
    } else {
      const index = evt.currentTarget.dataset.index
      const key = evt.currentTarget.dataset.item
      const datalist = this.data.datalist
      datalist[index][key] = evt.detail.value
      this.setData({
        datalist
      })
    }

  },

  //提交内容
  handleSubmit() {
    byPostJson(getApp().data.k1swUrl + u_batchNewLoseInsure.URL, JSON.stringify(this.data.datalist), function (response) {
      if (response.data.code == 1000) {
        wx.navigateTo({
          url: '/pages/pay/index?info=' + JSON.stringify(response?.data.content),
        });
      } else {
        // 处理接口返回的错误
        wx.showToast({
          title: response.data.msg || '投保失败',
          icon: 'none'
        });
      }
    });
  },

  // 失联提交
  handleInsuranceSubmit() {
    const info = this.data.datalistOne
    // 所有校验通过后发起请求
    byPostJson(getApp().data.k1swUrl + u_batchNewWycInsure.URL, JSON.stringify(this.data.datalistOne), function (response) {
      if (response.data.code == 1000) {
        wx.navigateTo({
          url: '/pages/pay/index?info=' + JSON.stringify(response?.data.content),
        });
      } else {
        // 处理接口返回的错误
        wx.showToast({
          title: response.data.msg || '投保失败',
          icon: 'none'
        });
      }
    });
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '购买历史') {
      this.setData({
        c_activeTab: 1,
        params: {},
      })
    }
    if (flag == '购买保险') {
      if (this.data.c_activeTab != 2) {
        this.inituGetPayPrice()
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },
  // 判断够买保险类型
  initInsuranceType(evt) {
    if (evt.datails) {
      const allParams = JSON.parse(evt.allParams)
      const datalist = JSON.parse(allParams?.datalist)
      const datails = JSON.parse(evt?.datails)
      datalist[allParams.index].plateNumber = datails?.platenumber
      datalist[allParams.index].vehId = datails?.id
      console.log(datalist, allParams.c)
      if (evt.type == 1) {
        this.setData({
          c_activeTab: allParams.c,
          datalistOne: datalist,
          insurance_type: evt?.type
        })
      } else {
        this.setData({
          c_activeTab: allParams.c,
          datalist: datalist,
          insurance_type: evt?.type
        })
      }

    } else {
      this.setData({
        insurance_type: evt?.type
      })
    }

  },
  // 租车结束时间
  handleOnEndDateChange(evt) {
    const index = evt.currentTarget.dataset.index
    const key = evt.currentTarget.dataset.item
    const datalistOne = this.data.datalistOne
    datalistOne[index][key] = evt.detail.value
    this.setData({
      datalistOne
    })
  },
  // 租车开始时间
  handleOnStartDateChange(evt) {
    const index = evt.currentTarget.dataset.index
    const key = evt.currentTarget.dataset.item
    const datalistOne = this.data.datalistOne
    datalistOne[index][key] = evt.detail.value
    this.setData({
      datalistOne
    })
  },
  onLoad(options) {
    this.initInsuranceType(options)
    if (options?.type == 1) {

    } else {
      this.handlePrice()
    }
  },
  onShow() {
    this.setData({
      g_items: [],
      params: {}
    })
    this.initList()
    this.initialiImageBaseConversion()
    this.inituGetPayPrice()

  },
})