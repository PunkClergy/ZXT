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
    // k3aUrl :"http://localhost:8689/",
    k3aUrl : "https://k3a.wiselink.net.cn/",
    companyType:'0',
    name: "",
    chargename: "",
    chargemobile:'',
    province:'',
    city:'',
    address:'' ,
   

    provinceIndex:'',
    provinceList:[],
    cityIndex:'',
    cityList:[],
    checkboxState: '',
  },
  handleCheckboxChange(e) {
    const isCheckedString = e.currentTarget.dataset.item === 'checked' ? '' : 'checked';
    this.setData({
      checkboxState: isCheckedString
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.getProvince();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  dataClean: function() {
    that.setData({
      companyType:'0',
      name: "",
      chargename: "",
      chargemobile:'',
      provinceId:'',
      cityId:'',
      address:'' ,
     

        
    })
},

  
nameInput: function(e) {
    that.setData({
      name: e.detail.value
    })
  },

  chargenameInput: function(e) {
    that.setData({
      chargename: e.detail.value
    })
  },
  chargemobileInput: function(e) {
    that.setData({
      chargemobile: e.detail.value
    })
  },
  addressInput: function(e) {
    that.setData({
      address: e.detail.value
    })
  },

  getProvince: function() {
    var param = {};
    appUtil.showLoading("处理中...")
    appUtil.byPost(that.data.k3aUrl + urlUtil.getProvinces.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          that.setData({
            provinceList : content
          })
          
        }
      else  {
        appUtil.showModal(data.msg, false, function(res) { });
     }
    });
  },

  getCity: function(province) {
    var param = {};
    appUtil.showLoading("处理中...")
    param[urlUtil.getCitys.provinceId] = province;
    appUtil.byPost(that.data.k3aUrl + urlUtil.getCitys.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          that.setData({
            cityList : content
          })
          
        }
      else  {
        appUtil.showModal(data.msg, false, function(res) { });
     }
    });
  },

  regBtnTap: function() {
    if (appUtil.isEmpty(that.data.name)) {
        appUtil.showToast('企业名称或姓名');
        return;
    }
    if (appUtil.isEmpty(that.data.chargemobile)) {
        appUtil.showToast('请输入联系电话');
        return;
    }
    if (appUtil.isEmpty(that.data.province)) {
        appUtil.showToast('请选择所在省份');
        return;
    }
    if (appUtil.isEmpty(that.data.city)) {
        appUtil.showToast('请选择所在城市');
        return;
    }

    
    var param = {};
    param[urlUtil.companyReg.companyType] =that.data.companyType;
    param[urlUtil.companyReg.name] =that.data.name;
    param[urlUtil.companyReg.chargename] =that.data.chargename;
    param[urlUtil.companyReg.chargemobile] =that.data.chargemobile;
    param[urlUtil.companyReg.province] =that.data.province;
    param[urlUtil.companyReg.city] = that.data.city;
    param[urlUtil.companyReg.address] = that.data.address;
    appUtil.showLoading("处理中...")
    appUtil.byPost(that.data.k3aUrl + urlUtil.companyReg.URL, param, function(res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
            appUtil.showModal(data.msg, false, function(res) {
               that.dataClean();
            });
            
        }
      else  {
        appUtil.showModal(data.msg, false, function(res) {
           
        });
        
    }
       
    });
  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      companyType:e.detail.value
    })
  },
  provincePickerChange: function(e) {
   var provinceId = that.data.provinceList[e.detail.value].id;
    this.setData({
        provinceIndex: e.detail.value,
        cityIndex:'',
        province:provinceId,
        city:'',
      })

      that.getCity(provinceId);
  },

  cityPickerChange: function(e) {
      var cityId = that.data.cityList[e.detail.value].id;
    this.setData({
        cityIndex:e.detail.value,
        city:cityId
      })

  },

  serviceTap:function(e)
  {
    wx.navigateTo({
      url: '/pages/agreementWebView/agreementWebView?url=https://k3a.wiselink.net.cn/img/service.html',
    })
  },

  privateTap:function(e)
  {
    wx.navigateTo({
      url: '/pages/agreementWebView/agreementWebView?url=https://k3a.wiselink.net.cn/img/private.html',
    })
  }

})