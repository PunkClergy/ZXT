const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
Page({

    

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
        selected: 0  //当前页面索引，取值 0、1、2、3...
      })
    }

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    oilButtonTap: function() {
      if(appUtil.isLogin())
      {
        // wx.navigateTo({
        //   url: '../oilList/oilList',
        // })

        wx.navigateTo({
          url: '../carService/carService',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
      
    },
   
    fengkong: function() {
      if(appUtil.isLogin())
      {
        wx.navigateTo({
          url: '../riskControl/riskControl',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
    },

    carManagerTap:function()
    {
      if(appUtil.isLogin())
      {
        wx.navigateTo({
          url: '/pages/system/carManager/carManager',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
    },
    oilDeviceTap:function()
    {
      if(appUtil.isLogin())
      {
        wx.navigateTo({
          url: '/pages/carManager/oilDeviceList/oilDeviceList',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
    },

    buyCount:function()
    {
      if(appUtil.isLogin())
      {
        wx.navigateTo({
          url: '/pages/carManager/buyCount/buyCount',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
    },
    rent:function()
    {
 
      if(appUtil.isLogin())
      {
        wx.navigateTo({
          url: '../rentControl/rentControl',
        })
      }
      else{
        wx.navigateTo({
          url: '/pages/system/managerLoginView/loginView',
        })

      }
    },
    blue:function()
    {
      wx.navigateTo({
        url: '/pages/oiltest/oiltest',
      })
    }
})

