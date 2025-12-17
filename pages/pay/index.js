const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const urlUtil = require('../../utils/url-util.js');
const appUtil = require('../../utils/app-util.js');
const {
  byPost
} = require('../../utils/request/http')
import {
  u_getCompanyInfo,
} from '../../utils/request/eqpmnt';
import {
  u_pay,
} from '../../utils/request/order';

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    balance: 0,
    orderInfo: {},
    isWechat: false
  },
  // 全屏背景
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );

    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },
  // 判断金额是否大于余额
  initAmountSizeBalance() {
    const params_company = {
      [u_getCompanyInfo.companyId]: getApp().data.userInfo.companyId
    }
    byPost(getApp().data.k1swUrl + u_getCompanyInfo.URL, params_company, (res) => {
      var data = res.data;
      if (data.code == 1000) {
        var content = data.content;
        this.setData({
          balance: content.balance
        }, () => {
          const cost = this.data.orderInfo.cost || this.data.orderInfo.premium
          const balance = this.data.balance
          console.log(cost, balance)
          if (Number(cost - this.data.coupon.amount) > Number(balance)) {
            this.setData({
              isWechat: true
            })
          } else {
            this.setData({
              isWechat: false
            })
          }
        })
      }
    });
  },
  handlePay() {
    const _this = this
    if (_this.data.isWechat) {
      console.log(1)
      // 微信支付
      const params = {
        [urlUtil.pay.amount]: (Math.abs(_this.data.orderInfo.cost || this.data.orderInfo.premium) - this.data.coupon?.amount).toFixed(2),
        [urlUtil.pay.userId]: getApp().data.userInfo.id
      };
      appUtil.showLoading("处理中...")
      appUtil.byPost(getApp().data.k1swUrl + urlUtil.pay.URL, params, function (res) {
        appUtil.hideLoading();
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          wx.requestPayment({
            timeStamp: content.timeStamp,
            nonceStr: content.nonceStr,
            package: 'prepay_id=' + content.prepayid,
            signType: 'MD5',
            paySign: content.paySign,
            success(res) {
              const params_pay = {
                [u_pay.orderNum]: _this.data.orderInfo.num || _this.data.orderInfo.guid,
                couponGuid: _this.data.coupon?.guid
              }
              byPost(getApp().data.k1swUrl + u_pay.URL, params_pay, (resp) => {
                if (resp.data.code == 1000) {
                  wx.removeStorageSync('coupon');
                  wx.showModal({
                    title: '提示',
                    content: '支付成功',
                    showCancel: false,
                    success: function (res) {
                      wx.navigateBack({
                        delta: 1  // 返回的页面数，1表示上一页
                      })
                    }
                  })
                }
              });
            }
          })
        }
      });
    } else {
      const params_pay = {
        [u_pay.orderNum]: _this.data.orderInfo.num || _this.data.orderInfo.guid,
        couponGuid: _this.data.coupon?.guid
      }
      byPost(getApp().data.k1swUrl + u_pay.URL, params_pay, (resp) => {
        if (resp.data.code == 1000) {
          wx.removeStorageSync('coupon');
          wx.showModal({
            title: '提示',
            content: '支付成功',
            showCancel: false,
            success: function (res) {
              wx.reLaunch({
                url: '/pages/orderList/orderList',
              })
            }
          })
        }
      });
    }

  },
  onLoad(options) {
    if (options?.info) {
      this.setData({
        orderInfo: JSON.parse(options?.info),
        coupon: JSON.parse(options?.coupon)
      }, () => {
        this.initAmountSizeBalance()
      })
    }
  },

  onReady() {

  },
  onShow() {
    this.initialiImageBaseConversion()
  },

})