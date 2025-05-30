const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../utils/public').default
const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
const {
  isEmpty
} = require('../../../../utils/request/http')
const {
  u_childUserList,
  u_delChildUser,
  u_roleapiList,
  u_addOrUpdateChildUser
} = require('../../../../utils/request/data_info')
const {
  u_payRecord
} = require('../../../../utils/request/eqpmnt')
const {
  byGet,
  byPost
} = require('../../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../../utils/Inspect/tips')
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
    c_activeTab: 2, // 默认选中的Tab索引
    amounts: [{
        label: '100元',
        value: '100'
      },
      {
        label: '500元',
        value: '500'
      },
      {
        label: '1000元',
        value: '1000'
      },

    ],
    resultMessage: '',
    resultSuccess: false,
    selected: null,
    amount: 0,
    allChecked: false,
    selectedCount: 0,
    priceTotal: 0,
    tableData: [
      // {
      //   product: '租车MCCK',
      //   item: '服务费',
      //   price: 5999.00,
      //   checked: false
      // },
      {
        product: '车队MCCK',
        item: '年度服务费',
        price: 360.00,
        checked: false
      },
      // {
      //   product: '网约车MCCK',
      //   item: '月度服务费',
      //   price: 399.00,
      //   checked: false
      // },
      // {
      //   product: '金融MCCK',
      //   item: '试用转正式版服务费',
      //   price: 19999.00,
      //   checked: false
      // },
      // {
      //   product: '国际租车分时出行MCCK',
      //   item: '硬件更换费用',
      //   price: 2499.00,
      //   checked: false
      // }
    ]
  },


  // 切换单个复选框
  toggleCheck(e) {
    const index = e.currentTarget.dataset.value;
    console.log(e)
    const key = `tableData[${index}].checked`;
    this.setData({
      [key]: !this.data.tableData[index].checked
    }, () => {
      this.calculateSelected();
      this.checkAllState();
    });
  },

  // 全选/取消全选
  toggleAll() {
    const newValue = !this.data.allChecked;
    const tableData = this.data.tableData.map(item => ({
      ...item,
      checked: newValue
    }));

    this.setData({
      allChecked: newValue,
      tableData
    }, () => {
      this.calculateSelected();
    });
  },

  // 计算选中数量
  calculateSelected() {
    const count = this.data.tableData.filter(item => item.checked).length;
    const total = (this.data.tableData.reduce((sum, item) => {
      return item.checked ? sum + item.price : sum;
    }, 0)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });;
    this.setData({
      selectedCount: count,
      priceTotal: total
    });
  },

  // 检查全选状态
  checkAllState() {
    const allChecked = this.data.tableData.every(item => item.checked);
    this.setData({
      allChecked
    });
  },
  handleRechargeJump() {
    this.setData({
      c_activeTab: 2
    })
  },
  // 提交操作
  submit() {
    const selectedItems = this.data.tableData.filter(item => item.checked);
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择支付项目',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: `此功能暂时缺失`,
      showCancel: false
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
      [u_payRecord.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_payRecord.URL, param).then(response => {
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
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '充值记录') {
      this.setData({
        c_activeTab: 1,
      })
    }
    if (flag == '充值') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
    if (flag == '待办服务单') {
      if (this.data.c_activeTab != 3) {
        this.setData({
          c_activeTab: 3,
        })
      }
    }
  },

  handleVarious(evt) {
    console.log(evt)
    const {
      value,
      index
    } = evt.currentTarget.dataset
    this.setData({
      selected: index,
      amount: value
    })
  },
  handleCustom() {
    if (this.data.selected != 'custom') {
      this.setData({
        selected: 'custom',
        amount: 0
      })
    }

  },
  handleCustomBlur(e) {
    this.setData({
      amount: e.detail.value
    })
  },
  handleRecharge(e) {
    const {
      phone,
      amount
    } = e.detail.value;

    // 简单的表单验证
    if (!phone || !amount) {
      this.setData({
        resultMessage: '请填写所有必填项',
        resultSuccess: false
      });
      return;
    }

    // 模拟API请求
    this.requestRecharge(phone, amount)
      .then(response => {
        this.setData({
          resultMessage: '充值成功！',
          resultSuccess: true
        });
      })
      .catch(error => {
        this.setData({
          resultMessage: '充值失败，请稍后再试。',
          resultSuccess: false
        });
      });
  },
  handlePayment() {
    const _this = this
    if (isEmpty(_this.data.amount)) {
      wx.showToast({
        title: '请输入充值金额',
        icon: 'none'
      })
      return;
    }

    const params = {
      [urlUtil.pay.amount]: this.data.amount,
      [urlUtil.pay.userId]: getApp().data.userInfo.id
    };
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.pay.URL, params, function (res) {
      appUtil.hideLoading();
      var data = res.data;
      if (data.code == 1000) {
        var content = data.content;
        wx.requestPayment({
          timeStamp: content.timeStamp,
          nonceStr: content.nonceStr,
          package: 'prepay_id=' + content.prepayid,
          signType: 'MD5',
          paySign: content.paySign,
          success(res) {
            appUtil.showModal("支付成功！", false, function (res) {
              _this.setData({
                amount: 0
              })
            });
          }
        })

      }


    });
  },
  requestRecharge(phone, amount) {
    // 这里可以替换为实际的API调用逻辑
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟网络延迟和成功响应
        resolve({
          success: true
        });
        // 或者模拟失败响应
        // reject(new Error('充值失败'));
      }, 1000);
    });
  },
  onLoad(options) {
    if (options.status) {
      this.setData({
        c_activeTab: 2
      })
    }
    this.initList()
    this.calculateSelected();
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
})