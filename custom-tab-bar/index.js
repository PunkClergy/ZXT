const appUtil = require("../utils/app-util")

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
    list: [{
        pagePath: "/pages/desk/desk",
        "iconPath": "../assets/images/index/desk@2x.png",
        "selectedIconPath": "../assets/images/index/desk_s@2x.png",
        text: "首页"
      },
      {
        "pagePath": "/pages/stationDispatch/stationDispatch",
        "iconPath": "../assets/images/index/sys@2x.png",
        "selectedIconPath": "../assets/images/index/sys_s@2x.png",
        "text": "热点位置"
      }, {
        pagePath: "/pages/oneClickOrdering/oneClickOrdering",
        "iconPath": "../assets/images/index/work@2x.png",
        "selectedIconPath": "../assets/images/index/work_s@2x.png",
        text: "一键下单"
      },
      {
        "pagePath": "/pages/carManager/buyOilDevice/buyOilDevice",
        "iconPath": "../assets/images/index/purchase@2x.png",
        "selectedIconPath": "../assets/images/index/purchase_s@2x.png",
        "text": "购买和充值"
      }, {
        pagePath: "/pages/system/managerInfo/userinfo",
        "iconPath": "../assets/images/index/setUp@2x.png",
        "selectedIconPath": "../assets/images/index/setUp_s@2x.png",
        text: "系统"
      }
    ]

  },

  lifetimes: {
    attached() {
      var obj = this.createSelectorQuery();
      obj.select('.tab-bar').boundingClientRect(function (rect) {
        getApp().data.tabBarHeight = rect?.height; // 将获取到的高度设置缓存，以便之后使用
        // console.log("rect.height="+getApp().data.tabBarHeight)
      }).exec();
    },

  },

  /**
   * 组件的方法列表
   */
  methods: {



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