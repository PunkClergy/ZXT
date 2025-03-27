// pages/oilList/rent/rentCom.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;
var app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
    /**
     * 组件的属性列表
     */
    properties: {

    },

    lifetimes: {
        attached: function() {
          that = this;
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
        },
      },

    /**
     * 组件的初始数据
     */
    data: {
        
        items: [], // 数据列表
       
        page:1,
        triggered:false,
        isErcodeOpen:false,

    },

    /**
     * 组件的方法列表
     */
    methods: {

      lower(e) {
        // console.log(e);
        that.setData({
          page:that.data.page + 1

        });
        that.getRentingAndHistory(that.data.searchText);
      },

      refresh(e) {
        that.clearItems();
        that.getRentingAndHistory(that.data.searchText);
      },

      clearItems:function()
      {
        that.setData({
          triggered:false,
          items:[]
        })
        that.setData({
          page:1
        });
      },

      getRentingAndHistory: function(searchText) {
        var param = {};
        param[urlUtil.getRentingAndHistory.companyId] = app.data.userInfo.fin3CompanyId;
        param[urlUtil.getRentingAndHistory.status] = 1;//在租
        if(!appUtil.isEmpty(searchText))
        {
          param[urlUtil.getRentingAndHistory.comParam] = searchText;
          that.setData({
            searchText:searchText
          })
        }
        else
        {
          that.setData({
            searchText:''
          })
        }
        param[urlUtil.getRentingAndHistory.page] = that.data.page;
        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.getRentingAndHistory.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
              
              if(that.data.page > 1 &&  data.content.length == 0)
              {
                appUtil.showToast("已加载全部数据")
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
          endRentButtonTap: function(e) {
            var id = e.currentTarget.id;
            var item = that.data.items[id];
            that.triggerEvent('endRent',item)
          },
          photo: function(e) {
            var cellIndex = e.currentTarget.id;
            wx.navigateTo({
              url: '../camera-paper/camera?view=2&cellIndex='+cellIndex,
            })
          }, 
          updateCellEndPhoto: function(cellIndex,endPhotoPath) {
          //  var photoStatus = "items["+cellIndex+"].photoStatus";
            var endPhoto = "items["+cellIndex+"].panelendimg";
           that.setData({
           // [photoStatus]: '已拍照',
            [endPhoto]:endPhotoPath,
           })
          },
          getOilButtonTap: function(e) {
            var cellIndex = e.currentTarget.id;
            var item = that.data.items[cellIndex];
            that.getOilAddress(cellIndex,item.sn)
          },
          getOilAddress: function(cellIndex,sn) {
            var param = {};
            param[urlUtil.getOilAddress.sn] = sn;
            appUtil.showLoading("加载中...")
            appUtil.byPost(getApp().data.k1swUrl + urlUtil.getOilAddress.URL, param, function(res) {
              appUtil.hideLoading();
              if (res) {
                var data = res.data;
                if (data.code == 1000) {
                  var content = data.content;
                  console.log(content.oil)
                  that.updateCellOilAddress(cellIndex,content.oil,content.address);
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
      updateCellOilAddress: function(cellIndex,oil,address) {
        var oilKey = "items["+cellIndex+"].endoil";
        var addressKey = "items["+cellIndex+"].endposition";
       that.setData({
        [oilKey]: oil,
        [addressKey]:address,
       })
      },

      deailTap:function(e)
      {
        var cellIndex = e.currentTarget.id;
        var item = that.data.items[cellIndex];
        wx.navigateTo({
          url: 'rentHistoryCom/historyDetail/historyDetail?detail=' + JSON.stringify(item)
        })

      }

    }
    
})
