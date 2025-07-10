const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');

var that;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        form:{
            guid:'',
            informantName:'',
            informantTime:'',
            mobile:'',
            alipayAccount:'',
            claimReason:''
          },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that = this;
        that.setData({
            'form.guid' : options.claimGuid
        })
        that.getShutdownClaim();
    },
    getShutdownClaim:function(e)
    {
        var param = {};
        appUtil.showLoading("加载中...")
        param[urlUtil.getShutdownClaim.claimGuid] = that.data.form.guid;
        appUtil.byPost(urlUtil.getShutdownClaim.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
               that.setData({
                'form.guid' : data.content.guid,
                'form.informantName' : data.content.informantName,
                'form.informantTime' : data.content.informantTime,
                'form.mobile' : data.content.mobile,
                'form.alipayAccount' : data.content.alipayAccount,
                'form.claimReason' : data.content.claimReason,
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

      updateShutdownClaim:function(e)
    {
      if (appUtil.isEmpty(that.data.form.informantName)) {
        appUtil.showToast('请输入报案人');
        return;
       }
       if (appUtil.isEmpty(that.data.form.informantTime)) {
          appUtil.showToast('请输入事故发生时间');
          return;
       }
      
      if (appUtil.isEmpty(that.data.form.mobile)) {
        appUtil.showToast('请输入联系电话');
        return;
      }
   
      if (appUtil.isEmpty(that.data.form.alipayAccount)) {
        appUtil.showToast('请输入支付宝账号');
        return;
      }
        appUtil.showLoading("加载中...")
        delete that.data.form.fileList;
        delete that.data.form.claimAmount;
        delete that.data.form.mapFile;
        appUtil.byPost(urlUtil.updateShutdownClaim.URL, that.data.form, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
               that.setData({
                form : data.content,
               })
               appUtil.showModal(data.msg, false, function() {

                wx.navigateBack({
                    delta: 1 // 返回上一级页面。
                  })
               });
               
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

      input: function (e) {
        let id = e.currentTarget.id;
        if(id == 'informantName')
        {
          that.setData({'form.informantName': e.detail.value})
        }
        else if(id == 'informantTime')
        {
          that.setData({'form.informantTime': e.detail.value})
        }
        else if(id == 'applicantName')
        {
          that.setData({'form.applicantName': e.detail.value})
        }
        else if(id == 'mobile')
        {
          that.setData({'form.mobile': e.detail.value})
        }
        else if(id == 'plateNumber')
        {
          that.setData({'form.plateNumber': e.detail.value})
        }
        else if(id == 'alipayAccount')
        {
          that.setData({'form.alipayAccount': e.detail.value})
        }
        else if(id == 'claimReason')
        {
          that.setData({'form.claimReason': e.detail.value})
        }
        
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