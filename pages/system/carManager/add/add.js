const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
const md5 = require('../../../../utils/md5.js');
var that;
var currentTime = 60;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    realname: "",
    mobile: "",
    userName:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      id:options.id,
      realname:options.realname,
      mobile:options.mobile,
      userName:options.userName,
    });
    if(!appUtil.isEmpty(that.data.id) )
    {
        wx.setNavigationBarTitle({
            title: "编辑车务"
        })
       
    }
    else
    {
        wx.setNavigationBarTitle({
            title: "新增车务"
        })
    }
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  
  realnameInput: function(e) {
    that.setData({
      realname: e.detail.value
    })
  },

  mobileInput: function(e) {
    that.setData({
      mobile: e.detail.value
    })
  },
  userNameInput: function(e) {
    that.setData({
      userName: e.detail.value
    })
  },

  regBtnTap: function() {
   
    if (appUtil.isEmpty(that.data.realname)) {
        appUtil.showToast('请输入真实姓名');
        return;
    }
    if (appUtil.isEmpty(that.data.mobile)) {
        appUtil.showToast('请输入手机号');
        return;
    }
    if (appUtil.isEmpty(that.data.userName)) {
        appUtil.showToast('请输入用户名');
        return;
    }
   
    var param = {};
    if(!appUtil.isEmpty(that.data.id))
    {
      param[urlUtil.updateOrInsertCarManager.id] =that.data.id;
    } 
   
  
    param[urlUtil.updateOrInsertCarManager.name] =that.data.realname;
    param[urlUtil.updateOrInsertCarManager.mobile] =that.data.mobile;
    param[urlUtil.updateOrInsertCarManager.username] =that.data.userName;
    param[urlUtil.updateOrInsertCarManager.companyid] = getApp().data.userInfo.companyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.updateOrInsertCarManager.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
            appUtil.showModal(data.msg, false, function(res) {
                console.log("res="+res);
                if(res)
                {
                  let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                  let prevPage = pages[pages.length - 2];
                  prevPage.restResult();
                  prevPage.getCarList();

                  wx.navigateBack({
                            delta: 1
                        })
                   
                }
            });
            
        }
        else{
          appUtil.showModal(data.msg, false, function(res) {});
        }
       
    });
  },

})