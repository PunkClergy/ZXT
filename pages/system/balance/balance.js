const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance:'',
    amount: "",
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.getCompanyInfo();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  
  getCompanyInfo:function()
  {

    var param = {};
    param[urlUtil.getCompanyInfo.companyId] = getApp().data.userInfo.companyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getCompanyInfo.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
            var content = data.content;
            that.setData({
              balance:content.balance
            })
            
        }
        else{
          appUtil.showModal(data.msg, false, function(res) {});
        }
       
    });

  },

  amountInput: function(e) {
    that.setData({
      amount: e.detail.value
    })
  },
  
  payBtnTap: function() {
    if (appUtil.isEmpty(that.data.amount)) {
        appUtil.showToast('请输入充值金额');
        return;
    }
   
    var param = {};
    param[urlUtil.pay.amount] = that.data.amount;
    param[urlUtil.pay.userId] = getApp().data.userInfo.id;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.pay.URL, param, function(res) {
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
            success (res) {
              console.log("success=" + JSON.stringify(res))
              appUtil.showModal("支付成功！", false, function(res) {
               that.setData({
                amount:''
               })
               that.getCompanyInfo();
              });
             },
            fail (res) {
              console.log("fail=" + JSON.stringify(res))
              //appUtil.showModal("支付发生错误："+res, false, function(res) {});
             }
          })
            
        }
        else{
          appUtil.showModal(data.msg, false, function(res) {});
        }
       
    });
  },

  payRecordTap:function()
  {
    wx.navigateTo({
      url: 'payRecord/payRecord',
    })
  }

})