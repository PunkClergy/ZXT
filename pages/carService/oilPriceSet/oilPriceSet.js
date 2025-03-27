const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oilSetItems: [],
    fwSetItems: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    that.getOilSet();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  oilNumInput: function (e) {
    var id = e.currentTarget.id;
    var value = e.detail.value;
    that.data.oilSetItems[id].name = value;
    that.setData({
        oilSetItems : that.data.oilSetItems
    })
},
oilPriceInput: function (e) {
    var id = e.currentTarget.id;
    var value = e.detail.value;
    that.data.oilSetItems[id].value = value;
    that.setData({
        oilSetItems : that.data.oilSetItems
    })
},
fwNumInput: function (e) {
    var id = e.currentTarget.id;
    var value = e.detail.value;
    that.data.fwSetItems[id].name = value;
    that.setData({
        fwSetItems : that.data.fwSetItems
    })
},
fwPriceInput: function (e) {
    var id = e.currentTarget.id;
    var value = e.detail.value;
    that.data.fwSetItems[id].value = value;
    that.setData({
        fwSetItems : that.data.fwSetItems
    })
},
delOilItemTap: function (e) {
    var id = e.currentTarget.id;
    that.data.oilSetItems.splice(id, 1);
    that.setData({
        oilSetItems: that.data.oilSetItems
    })
},
addOilItemTap: function (e) {
    var oilSetTmp = {};
    oilSetTmp.name = '';
    oilSetTmp.value = '';
    that.data.oilSetItems.push(oilSetTmp);
    that.setData({
        oilSetItems: that.data.oilSetItems
    })
},

delFwItemTap: function (e) {
    var id = e.currentTarget.id;
    that.data.fwSetItems.splice(id, 1);
    that.setData({
        fwSetItems: that.data.fwSetItems
    })
},
addFwItemTap: function (e) {
    var fwSetTmp = {};
    fwSetTmp.name = '';
    fwSetTmp.value = '';
    that.data.fwSetItems.push(fwSetTmp);
    that.setData({
        fwSetItems: that.data.fwSetItems
    })
},
saveButtonTap:function()
{
    that.saveOilSet();

},

getOilSet: function () {
    var param = {};
    param[urlUtil.getOilSet.companyId] = app.data.userInfo.fin3CompanyId;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilSet.URL, param, function (res) {
        appUtil.hideLoading();
        if (res) {
            var data = res.data;
            if (data.code == 1000) {
                console.log(data.content);
                var oilSet = data.content.oilSet;
                var fwSet = data.content.fwSet;
                if (Object.keys(oilSet).length > 0) {
                    var oilSetArr = [];
                    for (var key in oilSet) {
                        var oilSetTmp = {};
                        oilSetTmp.name = key;
                        oilSetTmp.value = oilSet[key];
                        oilSetArr.push(oilSetTmp)
                    }
                    that.setData({
                        oilSetItems: oilSetArr
                    })
                }
                if (Object.keys(fwSet).length > 0) {
                    var fwSetArr = [];
                    for (var key in fwSet) {
                        var fwSetTmp = {};
                        fwSetTmp.name = key;
                        fwSetTmp.value = fwSet[key];
                        fwSetArr.push(fwSetTmp)
                    }
                    that.setData({
                        fwSetItems: fwSetArr
                    })
                }

            } else {
              //  appUtil.showModal(data.msg, false, function () {});
            }
        } else {
            appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
        }

    });
},
saveOilSet: function () {
    var param = {};
    param[urlUtil.saveOilSet.companyId] = app.data.userInfo.fin3CompanyId;
    param[urlUtil.saveOilSet.oilSet] = that.data.oilSetItems;
    param[urlUtil.saveOilSet.fwSet] = that.data.fwSetItems;
    var p = JSON.stringify(param);
    appUtil.showLoading("加载中...")
    appUtil.byPostJson(getApp().data.fin3Url + urlUtil.saveOilSet.URL, p, function (res) {
        appUtil.hideLoading();
        if (res) {
            var data = res.data;
            appUtil.showModal(data.msg, false, function () {});
        } else {
            appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
        }

    });
},
})