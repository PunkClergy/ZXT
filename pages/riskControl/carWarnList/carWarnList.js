const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchText:'',
        items: [], // 数据列表
        page:1,
        triggered:false,
        sn:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that = this;
        that.setData({
            sn:options.sn
        })
        that.getCarList(that.data.searchText);
    },

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
            param[urlUtil.getVehicleWarnList.sn] = that.data.sn;
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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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

    }
})