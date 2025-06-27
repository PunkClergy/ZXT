const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_userInsureList,
  u_getPayPrice,
  u_newInsure
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
      [u_userInsureList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_userInsureList.URL, param).then(response => {
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
        const params = _this.data.params
        this.setData({
          params: {
            ...params,
            service_charge: response?.data.content
          }
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

  //提交内容
  handleSubmit() {
    const params = this.data.params;
    const temp = {
      applicantName: params?.applicantName,
      applicantIdcard: params?.applicantIdcard,
      plateNumber: params?.plateNumber
    };

    // 1. 被保险人非空校验
    if (!temp.applicantName || !temp.applicantName.trim()) {
      wx.showToast({
        title: '被保险人不能为空',
        icon: 'none'
      });
      return;
    }

    // 2. 身份证号格式校验
    if (!this.isValidIdCard(temp.applicantIdcard)) {
      wx.showToast({
        title: '请输入有效的身份证号码',
        icon: 'none'
      });
      return;
    }

    // 3. 车牌号格式校验
    if (!this.isValidPlateNumber(temp.plateNumber)) {
      wx.showToast({
        title: '请输入有效的车牌号码',
        icon: 'none'
      });
      return;
    }

    // 所有校验通过后发起请求
    byPost(getApp().data.k1swUrl + u_newInsure.URL, temp,
      (response) => {
        if (response.data.code == 1000) {
          console.log(response?.data.content.guid);
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
      },
      (error) => {
        // 网络请求错误处理
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    );
  },

  // 身份证校验函数（支持15位/18位，包含X校验）
  isValidIdCard(id) {
    const reg = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/;
    if (!reg.test(id)) return false;

    // 18位身份证校验码验证
    if (id.length === 18) {
      const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      const codes = '10X98765432';
      let sum = 0;

      for (let i = 0; i < 17; i++) {
        sum += parseInt(id.charAt(i)) * factors[i];
      }
      const checkCode = codes.charAt(sum % 11);
      return checkCode === id.charAt(17).toUpperCase();
    }
    return true; // 15位身份证直接通过
  },

  // 车牌号校验（支持新能源/普通车牌）
  isValidPlateNumber(plate) {
    // 普通车牌：汉字 + A-Z + 5位数字/字母（不含I/O）
    const commonReg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/;

    // 新能源车牌：汉字 + A-Z + [DF]开头 + 6位数字
    const newEnergyReg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z](?:[0-9]{5}[DF]|[DF][0-9]{6})$/;

    return commonReg.test(plate) || newEnergyReg.test(plate);
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

  onLoad(options) {
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.inituGetPayPrice()
  },
})