const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const md5 = require('../../../utils/md5.js');
var that;
var currentTime = 60;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyCount:"",
    amount: "",
    fwPrice:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;

    that.getPrice(2);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  getPrice: function(type) {
  
    var param = {};
    param[urlUtil.getJ23Price.type] = type;
    param[urlUtil.getJ23Price.companyId] = getApp().data.userInfo.companyId;

    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getJ23Price.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
         
            that.setData({
              fwPrice:content.price
            })
          
        }
      else  {
        appUtil.showModal(data.msg, false, function(res) { });
     }
    });
  },
  
  buyCountInput: function(e) {
    that.setData({
      buyCount: e.detail.value,
      amount:e.detail.value * that.data.fwPrice
    })
  },

  amountInput: function(e) {
    that.setData({
      amount: e.detail.value
    })
  },
  
  countBtnTap: function() {
    if (appUtil.isEmpty(that.data.buyCount)) {
        appUtil.showToast('请输入购买次数');
        return;
    }
   
    var param = {};
 
  
    param[urlUtil.buyCount.buyCount] =that.data.buyCount;
    param[urlUtil.buyCount.companyId] = getApp().data.userInfo.fin3CompanyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.buyCount.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
            appUtil.showModal(data.msg, false, function(res) { 
              that.setData({
                buyCount : '',
                amount : ''
              })
            });
            
        }
        else if (data.code == 6000) {
          appUtil.showModal(data.msg, false, function(res) {
             wx.navigateTo({
               url: '/pages/system/balance/balance',
             })
          });
          
      }
      else{
          appUtil.showModal(data.msg, false, function(res) {});
      }
       
    });
  },


  buyCountRecordTap:function()
  {
    wx.navigateTo({
      url: 'buyCountRecord/buyCountRecord',
    })
  }

})