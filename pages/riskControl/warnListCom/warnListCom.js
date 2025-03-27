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
            param[urlUtil.getVehicleWarnList.companyId] = app.data.userInfo.fin3CompanyId;
            if(!appUtil.isEmpty(searchText))
            {
              param[urlUtil.getVehicleWarnList.comParam] = searchText;
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
            param[urlUtil.getVehicleWarnList.page] = that.data.page;
            appUtil.showLoading("加载中...")
            appUtil.byPost(getApp().data.fin3Url + urlUtil.getVehicleWarnList.URL, param, function(res) {
              appUtil.hideLoading();
              if (res) {
                var data = res.data;
                if (data.code == 1000) {
                 
                    data.content.forEach((r)=>{
                        if(r.warningState== 1)
                        {
                            r.warningState ='中控锁未锁'
                        }
                        else  if(r.warningState== 2)
                        {
                            r.warningState ='车门未关'
                        }
                        else  if(r.warningState== 3)
                        {
                            r.warningState ='后备箱未关'
                        }
                        else if(r.warningState== 4)
                        {
                            r.warningState ='低电压'
                        }
                        else if(r.warningState== 5)
                        {
                            r.warningState ='异常震动'
                        }
                        else if(r.warningState== 6)
                        {
                            r.warningState ='熄火位移'
                        }
                        else if(r.warningState== 7)
                        {
                            r.warningState ='非法开门'
                        }
                        else if(r.warningState== 8)
                        {
                            r.warningState ='拆除报警'
                        }
                        else if(r.warningState== 9)
                        {
                            r.warningState ='设备上电'
                        }
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
