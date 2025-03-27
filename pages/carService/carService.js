const appUtil = require('../../utils/app-util.js');
import {
  byGet
} from '../../utils/request/http';
import u_url from '../../utils/request/oil';
Page({
  data: {
    filterItems: [{
        type: 'chargeStatus',
        label: '收费状态',
        value: '',
        active: false
      },
      {
        type: 'rentStatus',
        label: '租赁状态',
        value: '',
        active: false
      },
      {
        type: 'days',
        label: '所有时间',
        value: '',
        active: false
      },
      {
        type: 'date',
        icon: '/assets/images/home/date.png',
        active: false
      }
    ],
    showPicker: false,
    selectedValue: '', // 选中的值
    pickerIndex: [0], // 当前选中索引
    pickerType: '',
    pickerData: [ // 单列数据
    ],
    page: 1,
    items: [],
    params: {}
  },
  onLoad: function (options) {
    this.getOilList();

  },
  onReady: function () {
    const that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          scrollHihgt: res.windowHeight - getApp().data.tabBarHeight - 200
        });
      }
    });

  },
  getOilList: function (evt, ele) {
    appUtil.showLoading("加载中...")
    const page = this.data.page;
    const url = getApp().data.k1swUrl + u_url.u_dipsticHistory.URL;
    const param = {
      [u_url.u_dipsticHistory.page]: page,
      ...evt,
      ...ele
    };

    byGet(url, param).then(response => {
      appUtil.hideLoading();
      const {
        code,
        content: rspns
      } = response.data;

      if (code !== 1000) {
        appUtil.showModal(response.data.msg || "请求失败", false, () => {});
        return;
      }

      if (page > 1 && !rspns.length) {
        appUtil.showToast(`已加载全部数据：共${this.data.items.length}条`);
        return;
      }

      this.setData({
        items: this.data.items.concat(rspns)
      });
    }).catch(error => {
      console.error("Error fetching oil list:", error);
      appUtil.showModal("网络错误，请稍后再试", false, () => {});
    });
  },
  handleLower() {
    this.setData({
      page: this.data.page + 1
    });
    this.getOilList();
  },
  handleRefresh: function () {
    this.setData({
      triggered: false,
      page: 1,
      items: []
    });
    this.getOilList();
  },
  // 显示选择器
  handleFilterPicker(e) {
    const type = e.currentTarget.dataset.type;
    const typeMapping = {
      'chargeStatus': [{
        id: '',
        value: '全部'
      }, {
        id: -1,
        value: '未收费'
      }, {
        id: 0,
        value: '不收费'
      }, {
        id: 1,
        value: '已收费'
      }],
      'rentStatus': [{
        id: '',
        value: '全部'
      }, {
        id: 0,
        value: '起租'
      }, {
        id: 1,
        value: '还租'
      }],
      'days': [{
        id: '',
        value: '全部'
      }, {
        id: 1,
        value: '1天'
      }, {
        id: 3,
        value: '3天'
      }],
      'date': [{
        key: '122',
        value: 'date A'
      }]
    };
    if (type in typeMapping) {
      this.setData({
        pickerType: type,
        pickerData: typeMapping[type],
        showPicker: true,
        pickerIndex: [0],
        selectedValue: ''

      });
      return;
    }
  },

  // 隐藏选择器
  hidePicker() {
    this.setData({
      showPicker: false
    })
  },

  // 选择变化事件
  bindPickerChange(e) {
    console.log(e)
    const index = e.detail.value[0]
    this.setData({
      pickerIndex: [index],
      selectedValue: this.data.pickerData[index]
    })
  },
  handleConfirm: function () {
    // 隐藏选择器
    this.hidePicker();

    // 获取当前的 filterItems 和 params
    const {
      filterItems,
      params,
      pickerType,
      selectedValue
    } = this.data;

    // 更新 filterItems 和 params
    const updatedFilterItems = filterItems.map((item) => {
      if (item.type === pickerType) {
        return {
          ...item,
          label: selectedValue.value || '全部'
        };
      }
      return item;
    });

    const updatedParams = {
      ...params,
      [pickerType]: selectedValue.id || ''
    };

    // 调用获取油品列表的方法，并传递更新后的参数
    this.getOilList(updatedParams, this.data.param);

    // 更新页面数据
    this.setData({
      filterItems: updatedFilterItems,
      params: updatedParams
    });

    // 这里可以执行确认后的业务逻辑
  },
  handleMpBulur(evt) {
    this.getOilList(this.data.params, {
      param: evt.detail.value
    })
    this.setData({
      param: evt.detail.value
    })
  },
  handleMpClear(evt) {
    console.log(2, evt)
  },
  handleMpFocus(evt) {
    console.log(3, evt)
  },
  handleMpInput(evt) {
    console.log(4, evt)
  },

})