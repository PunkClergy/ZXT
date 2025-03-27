const {
  isEmpty
} = require('../../../../utils/request/http')
const appUtil = require('../../../../utils/app-util.js');
const urlUtil = require('../../../../utils/url-util.js');
Page({
  data: {
    amounts: [{
        label: '100元',
        value: '100'
      },
      {
        label: '500元',
        value: '500'
      },
      {
        label: '1000元',
        value: '1000'
      },

    ],
    resultMessage: '',
    resultSuccess: false,
    selected: null,
    amount: 0
  },
  handleVarious(evt) {
    console.log(evt)
    const {
      value,
      index
    } = evt.currentTarget.dataset
    this.setData({
      selected: index,
      amount: value
    })
  },
  handleCustom() {
    if (this.data.selected != 'custom') {
      this.setData({
        selected: 'custom',
        amount: 0
      })
    }

  },
  handleCustomBlur(e) {
    this.setData({
      amount: e.detail.value
    })
  },
  handleRecharge(e) {
    const {
      phone,
      amount
    } = e.detail.value;

    // 简单的表单验证
    if (!phone || !amount) {
      this.setData({
        resultMessage: '请填写所有必填项',
        resultSuccess: false
      });
      return;
    }

    // 模拟API请求
    this.requestRecharge(phone, amount)
      .then(response => {
        this.setData({
          resultMessage: '充值成功！',
          resultSuccess: true
        });
      })
      .catch(error => {
        this.setData({
          resultMessage: '充值失败，请稍后再试。',
          resultSuccess: false
        });
      });
  },
  handlePayment() {
    const _this = this
    if (isEmpty(_this.data.amount)) {
      wx.showToast({
        title: '请输入充值金额',
        icon: 'none'
      })
      return;
    }

    const params = {
      [urlUtil.pay.amount]: this.data.amount,
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
              _this.setData({
                amount: 0
              })
            });
          }
        })

      }


    });
  },
  requestRecharge(phone, amount) {
    // 这里可以替换为实际的API调用逻辑
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟网络延迟和成功响应
        resolve({
          success: true
        });
        // 或者模拟失败响应
        // reject(new Error('充值失败'));
      }, 1000);
    });
  }
});