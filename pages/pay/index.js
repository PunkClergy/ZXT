const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const urlUtil = require('../../utils/url-util.js');
const appUtil = require('../../utils/app-util.js');
const {
  byPost,byGet
} = require('../../utils/request/http')
const {
  u_zxtInvoicelnfo
} = require('../../utils/request/data_info')
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
    isWechat: false,
    corporateAccount: {
    },
    // 控制弹窗显示/隐藏
    showCorporateModal: false
  },
  // 请求区域数据
  initGetRoles(evt) {
    byGet(`${getApp().data.k1swUrl}${u_zxtInvoicelnfo.URL}`, {}).then(allRes => {
      this.setData({
        corporateAccount: allRes?.data?.content[0]
      })

    })
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
  // 选择支付方式（仅对公/微信支付可选择）
  selectPayMethod(e) {
    const type = e.currentTarget.dataset.type;
    let text = '';
    switch (type) {
      case 'corporate':
        text = '对公支付';
        break;
      case 'wechat':
        text = '微信支付';
        break;
    }
    this.setData({
      selectedPayMethod: type,
      payMethodText: text
    });
  },
  // 对公付款
  handleToThePublic() {
    this.setData({ showCorporateModal: true })

  },
  hideCorporateModal() {
    this.setData({ showCorporateModal: false })
  },
  // 复制银行卡信息
  copyAccountInfo() {
    const { corporateAccount } = this.data;
    // 拼接要复制的信息
    const copyText = `企业名称：${corporateAccount?.name}
开户银行：${corporateAccount?.depositbank}
银行账号：${corporateAccount?.bankaccounts}`;

    // 调用微信复制接口
    wx.setClipboardData({
      data: copyText,
      success: () => {
        this.hideCorporateModal();
        setTimeout(() => {
          wx.showModal({
            title: '温馨提示',
            content: '打款后请等待财务审核',
            showCancel: false,
            confirmText: '我知道了',
            success: (res) => {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/index',
                });
              }
            }
          });
        }, 1500);
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请手动记录',
          icon: 'none'
        });
      }
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
                couponGuid: _this.data.coupon?.guid || ''
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
        couponGuid: _this.data.coupon?.guid || ''
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
    this.initGetRoles()
  },

})