const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    filePath: '',
    fileName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },



  addFile: function (e) {
    if (that.data.fileName == '' && that.data.filePath == '') {

      appUtil.showModal("需要先将Excel文件发送到微信[文件传输助手]对话中，然后进行选择", true, function (e) {
        if (e) {
          wx.chooseMessageFile({
            count: 1,
            type: 'all',
            success(res) {

              console.log(res.tempFiles[0].path);
              that.setData({
                filePath: res.tempFiles[0].path,
                fileName: res.tempFiles[0].name
              })
            },
            fail(res) {
              console.log(res);
            }
          })
        }

      })

    } else {
      that.setData({
        filePath: '',
        fileName: '',
      })
    }


  },

  regBtnTap: function () {
    if (appUtil.isEmpty(that.data.filePath) || appUtil.isEmpty(that.data.filePath)) {
      appUtil.showToast('请选择Excel文件');
      return;
    }
    var fileName = that.data.fileName;
    var kzFileName = fileName.substring(fileName.indexOf("."));
    console.log("kzFileName=" + kzFileName);
    if (appUtil.isEmpty(that.data.filePath) || appUtil.isEmpty(that.data.filePath)) {
      appUtil.showToast('请选择Excel文件');
      return;
    }
    appUtil.showLoading("处理中...")
    appUtil.uploadFile2(getApp().data.k1swUrl + urlUtil.slfAdd.URL, "file", that.data.filePath, {
      "companyid": getApp().data.userInfo.fin3CompanyId
    }, function (res) {
      appUtil.hideLoading();
      var data = res.data;
      data = JSON.parse(data);
      if (data.code == 1000) {
        appUtil.showModal(data.msg, false, function (res) {
          if (res) {
            let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
            let prevPage = pages[pages.length - 2];
            // prevPage.restResult();
            // prevPage.getCarList();

            wx.navigateBack({
              delta: 1
            })

          }
        });

      } else {
        appUtil.showModal(data.msg, false, function (res) {});
      }

    });
  },

  copyLink: function () {
    wx.setClipboardData({
      data: '',
      success: function (res) {
        appUtil.showToast('链接复制成功，请在https://k3a.wiselink.net.cn/车辆导入.xlsx电脑上下载模板');
      },
      fail: function (res) {
        console.log(res)
        appUtil.showToast('链接复制失败' + res);
      }
    })
  }
})