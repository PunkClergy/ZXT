import {
  u_getCompanyInfo,
  u_buyCount
} from '../../../../utils/request/eqpmnt';
import {
  showLoading,
  byPost,
  hideLoading,
  showModal
} from '../../../../utils/app-util.js';
const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
Page({
  data: {
    amounts: [{
        label: '500次',
        value: '500'
      },
      {
        label: '1000次',
        value: '1000'
      },
      {
        label: '自定义',
        value: 'custom'
      },

    ],
    resultMessage: '',
    resultSuccess: false,
    selected: null,
    amount: 0,
    tips: true,
    balance: 0,
    after: 0
  },
  handleVarious(evt) {
    console.log(evt)
    const {
      value,
      info
    } = evt.currentTarget.dataset
    const {
      balance
    } = this.data
    this.setData({
      selected: info,
      amount: value == 'custom' ? 0 : value,
      after: (Number(balance) - Number(value == 'custom' ? 0 : value)).toFixed(2)
    })
  },

  handleCustomInput(e) {
    const {
      balance
    } = this.data
    this.setData({
      amount: e.detail.value * 500,
      after: (Number(balance) - Number(e.detail.value * 500)).toFixed(2)
    })
  },
  handleCustomBlur() {
    const amount = this.data.amount
    if (!amount) {
      this.setData({
        tips: true
      })
    }
  },
  handleCustomFocus() {
    this.setData({
      tips: false
    })
  },
  handleBalance() {
    const _this = this
    var param = {};
    param[u_getCompanyInfo.companyId] = getApp().data.userInfo.companyId;
    showLoading("处理中...")
    byPost(getApp().data.k1swUrl + u_getCompanyInfo.URL, param, function (res) {
      hideLoading();
      var data = res.data;
      if (data.code == 1000) {
        var content = data.content;
        _this.setData({
          balance: content.balance
        })

      } else {
        showModal(data.msg, false, function (res) {});
      }

    });
  },
  handleSubmit() {
    if (this.data.after < 0) {
      this.handlePayment()
    } else {
      this.handleCount()
    }
  },
  handlePayment() {
    const _this = this
    if (_this.data.amount == 0) {
      wx.showToast({
        title: '请输入充值金额',
        icon: 'none'
      })
      return;
    }
    const params = {
      [urlUtil.pay.amount]: Math.abs(this.data.after),
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
            appUtil.showModal("支付成功！", false, function (res) {
              // 执行扣减
              _this.handleCount()
              _this.setData({
                amount: 0
              })
            });
          }
        })
      }
    });
  },
  handleCount: function () {
    const _this = this
    var param = {};
    param[urlUtil.buyCount.buyCount] = _this.data.amount;
    param[urlUtil.buyCount.companyId] = getApp().data.userInfo.fin3CompanyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(getApp().data.k1swUrl + u_buyCount.URL, param, function (res) {
      appUtil.hideLoading();
      var data = res.data;
      if (data.code == 1000) {
        if (_this.data.after < 0) {
          appUtil.showModal("扣减成功！", false, function (res) {});
        }
      }
    });
  },
  onLoad: function () {
    this.handleBalance()
  },
});