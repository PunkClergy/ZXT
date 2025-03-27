const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    cellData: '',
    items: [],
    winWidth:'',
    winHeight: '',
    scrollHihgt:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var detail = options.detail;
    var detailObj = JSON.parse(detail);
    if(!appUtil.isEmpty(detailObj.panelstartimg))
    {
      detailObj.panelstartimg = urlUtil.fin3plusImgUrl + (detailObj.panelstartimg.replace(/\\/g, '/'));
    }
    if(!appUtil.isEmpty(detailObj.panelendimg))
    {
      detailObj.panelendimg = urlUtil.fin3plusImgUrl + (detailObj.panelendimg.replace(/\\/g, '/'));
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    
    that.setData({
      cellData: detailObj,
      scrollHihgt: that.data.winHeight - 250
    })


   

    that.oilDetailList();

  },

  oilDetailList: function () {
    var cellData = that.data.cellData;
    var param = {};
    param[urlUtil.oilDetailList.rows] = 20;
    param[urlUtil.oilDetailList.page] = that.data.page; //在租
    param[urlUtil.oilDetailList.lable_SN] = cellData.sn;
    param[urlUtil.oilDetailList.CarStateOilStartTime] = cellData.startdate;
    param[urlUtil.oilDetailList.CarStateOilEndTime] = cellData.enddate;
    // param[urlUtil.oilDetailList.lable_SN] = '640019999';
    // param[urlUtil.oilDetailList.CarStateOilStartTime] = '2022-10-01 14:18:02';
    // param[urlUtil.oilDetailList.CarStateOilEndTime] = '2022-10-24 14:17:10';
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.oilDetailList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          var content = JSON.parse(data.content);
          that.setData({
            items: that.data.items.concat(content.rows)
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },
  lower(e) {
    // console.log(e);
    that.setData({
      page: that.data.page + 1

    });
    that.oilDetailList();
  },

  imgTap: function (e) {
    var img = e.target.id;
    if (img == undefined || img == '') {
      return;
    }
    var urls = [img];
    wx.previewImage({
      current: img, //当前图片地址
      urls: urls, //所有要预览的图片的地址集合 数组形式
    })


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

  }
})