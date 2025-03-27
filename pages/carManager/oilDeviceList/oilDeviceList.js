// pages/order/orderList.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');

var that;
Page({

    /**
     * 页面的初始数据
     */
    data: {
      
        items: [], // 数据列表
       
        page:1,
        triggered:false,
        searchText:'',
        winWidth:'',
        winHeight: '',
        scrollHihgt:'',
        isShowAddType:true,
        oilDeviceCount:''
    },


    clearInput: function(){
      console.log("clear")
      that.setData({
        searchText : ''
      })
    },
    restResult:function(){
      that.setData({
        page:1,
        items:[]
      })
    },
    cancel: function(e){
      // console.log(that.data.searchText)
      that.restResult();
      that.getCarList();
    
    },
    inputChange:function(e)
    {
      var t = e.target
      console.log(e.detail.value)
      that.setData({
        searchText : e.detail.value
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that = this;


        let t = this, sbar = this.selectComponent("#searchbar"),
        { hideInput } = sbar
        console.log(this.selectComponent("#searchbar"))
    
        // 重写
        Object.defineProperties(sbar.__proto__, {
          hideInput:{
            configurable: true,
            enumerable: true,
            writable: true,
            value(...p){
              
              this.triggerEvent('cancel', {})
            }
          }
        })
        that.getCarList();
        that.getFin3Company();
    },

    

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,
            scrollHihgt:  res.windowHeight - getApp().data.tabBarHeight - 100
          });
        }
      });

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
        selected: 1  //当前页面索引，取值 0、1、2、3...
      })
    }
    // that.restResult();
    //that.getCarList();

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

    getCarList: function() {
      var param = {};
      param[urlUtil.getOilDeviceList.companyId] = getApp().data.userInfo.fin3CompanyId;
      if(!appUtil.isEmpty(that.data.searchText))
      {
        param[urlUtil.getOilDeviceList.sn] = that.data.searchText;
      }
      
      param[urlUtil.getOilDeviceList.page] = that.data.page;
      appUtil.showLoading("加载中...")
      appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilDeviceList.URL, param, function(res) {
        appUtil.hideLoading();
        if (res) {
          var data = res.data;
          if (data.code == 1000) {
            
            if(that.data.page > 1 &&  data.content.length == 0)
            {
                appUtil.showToast("已加载全部数据：共"+that.data.items.length+"条")
            }
            that.setData({
              items:that.data.items.concat(data.content)
            })
          }
          else
          {
            appUtil.showModal(data.msg, false, function() {});
          }
        }
        else
        {
          appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
        }
  
      });
      },
      
      getFin3Company: function() {
        var param = {};
        param[urlUtil.getFin3Company.companyId] = getApp().data.userInfo.fin3CompanyId;

        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.getFin3Company.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
              that.setData({
                oilDeviceCount:data.content.oilDeviceCount
              })
            }
            else
            {
              appUtil.showModal(data.msg, false, function() {});
            }
          }
          else
          {
            appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
          }
    
        });
        },
      
      lower(e) {
        that.setData({
          page:that.data.page + 1

        });
        that.getCarList();
      },

      refresh(e) {
  
        that.setData({
          triggered:false,
        })

        that.restResult();
        that.getCarList();
      },
     
      useRecordTap:function(e)
      {
        var index = e.currentTarget.id;
        var items = that.data.items
        var item = items[index];
        var param = "?sn="+item.idc+"&companyId="+item.companyId;
        appUtil.navigateTo('../oilUseRecord/oilUseRecord'+param);
      },

      buyBtnTap:function(e)
      {
        // appUtil.showToast("未上线")
        appUtil.navigateTo('../buyOilDevice/buyOilDevice');
      },

      buyRecordBtnTap:function(e)
      {
        appUtil.navigateTo('../buyRecord/buyRecord');
      },

      oilPriceBtnTap:function(e)
      {
        appUtil.navigateTo('/pages/carService/oilPriceSet/oilPriceSet');
      },
      
})