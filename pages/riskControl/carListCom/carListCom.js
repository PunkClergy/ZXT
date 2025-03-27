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
          that.getCarList(that.data.searchText);
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
        },
      },

    /**
     * 组件的初始数据
     */
    data: {
      searchText:'',

        items: [], // 数据列表
        page:1,
        triggered:false,
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
        that.getCarList(that.data.searchText);
      },

      refresh(e) {
        // console.log(e);
        that.clearItems();
        that.getCarList(that.data.searchText);
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
      getCarList: function(searchText) {
            var param = {};
            param[urlUtil.getCarList.companyId] = app.data.userInfo.fin3CompanyId;
            if(!appUtil.isEmpty(searchText))
            {
              param[urlUtil.getCarList.comParam] = searchText;
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
            param[urlUtil.getCarList.page] = that.data.page;
            appUtil.showLoading("加载中...")
            appUtil.byPost(getApp().data.fin3Url + urlUtil.getCarList.URL, param, function(res) {
              appUtil.hideLoading();
              if (res) {
                var data = res.data;
                if (data.code == 1000) {
                  data.content.forEach((r)=>{
                    r.photoStatus = '未拍照',
                    r.startPhotoPath = ''
                  })
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

      detailButuonTap:function(e)
      {
        var cellIndex = e.currentTarget.id;
        var item = that.data.items[cellIndex];
        wx.navigateTo({
          url: 'carDetail/carDetail?detail=' + JSON.stringify(item)
        })
        //   wx.navigateTo({
        //     url: '../travelingtrack/travelingtrack',
        //   })
      }

     

  
    
  
  
  }
    
})
