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
    id:"",
    vehicleModelName: "",
    vehicleSerialName: "",
    platenumber:'',
    vin:'',
    xsgw:'' ,
    sn:'' 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      id:options.id,
      vehicleSerialName:options.vehicleSerialName,
      vehicleModeName:options.vehicleModeName,
      platenumber:options.platenumber,
      vin:options.vin,
      xsgw:options.xsgw,
      sn:options.sn,
    });
    console.log("sn="+that.data.sn)
    if(!appUtil.isEmpty(that.data.id) )
    {
        wx.setNavigationBarTitle({
            title: "编辑车辆"
        })
       
    }
    else
    {
        wx.setNavigationBarTitle({
            title: "注册车辆"
        })
    }
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  
  vehicleSerialNameInput: function(e) {
    that.setData({
        vehicleSerialName: e.detail.value
    })
  },

  vehicleModeNameInput: function(e) {
    that.setData({
        vehicleModeName: e.detail.value
    })
  },
  vinInput: function(e) {
    that.setData({
        vin: e.detail.value
    })
  },
  platenumberInput: function(e) {
    that.setData({
        platenumber: e.detail.value
    })
  },

  xsgwInput: function(e) {
    that.setData({
        xsgw: e.detail.value
    })
  },
  

  regBtnTap: function() {
   
     
    if (appUtil.isEmpty(that.data.vehicleSerialName)) {
        appUtil.showToast('请输入车系');
        return;
    }
    if (appUtil.isEmpty(that.data.vehicleModeName)) {
        appUtil.showToast('请输入车型');
        return;
    }
    if (appUtil.isEmpty(that.data.platenumber)) {
        appUtil.showToast('请输入车牌号');
        return;
    }
    if (appUtil.isEmpty(that.data.xsgw)) {
        appUtil.showToast('请输入车辆油箱容积');
        return;
    }

    if (!appUtil.isNumber(that.data.xsgw)) {
        appUtil.showToast('油箱容积只能填整数');
        return;
    }
    
    var param = {};
    var url = getApp().data.fin3Url + urlUtil.regOrUpdateCar.URL;
    if(appUtil.isEmpty(that.data.id))
    {
        url += "addCar";
    } 
    else
    {
        param[urlUtil.regOrUpdateCar.id] =that.data.id;
        url += "editCar";
    }
  
    param[urlUtil.regOrUpdateCar.platenumber] =that.data.platenumber;
    param[urlUtil.regOrUpdateCar.vin] =that.data.vin;
    param[urlUtil.regOrUpdateCar.vehicleModeName] =that.data.vehicleModeName;
    param[urlUtil.regOrUpdateCar.vehicleSerialName] =that.data.vehicleSerialName;
    param[urlUtil.regOrUpdateCar.isAppReg] = 1;
    param[urlUtil.regOrUpdateCar.xsgw] =that.data.xsgw;
    
    param[urlUtil.regOrUpdateCar.companyid] = getApp().data.userInfo.fin3CompanyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(url, param, function(res) {
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