const appUtil = require("../utils/app-util")
const {
  u_navlist
} = require('../utils/request/home')
const {
  byGet,
} = require('../utils/request/http')
// pages/custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selectedtext: {
      type: String,
      value: '首页'
    },
  },

  /**
   * 组件的初始数据
   */
  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    color: '#000000',
    selectedColor: "#1A79FF",
    list: [],
    c_link: 'https://k1sw.wiselink.net.cn/'

  },

  lifetimes: {
    attached() {
      var obj = this.createSelectorQuery();
      obj.select('.tab-bar').boundingClientRect(function (rect) {
        getApp().data.tabBarHeight = rect?.height; // 将获取到的高度设置缓存，以便之后使用
      }).exec();
      this.handleNavlist()
    },

  },

  /**
   * 组件的方法列表
   */
  methods: {

    handleNavlist() {
      console.log(11)
      const _this = this
      byGet(_this.data.c_link + u_navlist.URL, {}).then(response => {
        _this.setData({
          list: response.data.content
        })
      })
    },

    switchTab(e) {

      if (appUtil.isLogin()) {
        const data = e.currentTarget.dataset
        const url = data.path
        wx.switchTab({
          url
        })
        this.setData({
          selected: data.index
        })
      } else {
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }

    }


  }
})