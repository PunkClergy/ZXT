const {
  u_getCarList,
  u_cancalShareCarToOta,
  u_shareCarToOta
} = require('../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
Page({
  data: {
    carList: [],
    isOperating: false,
    clink: 'http://192.168.10.100:8689/'
  },

  onLoad() {
    this.getCarList();
  },

  getCarList() {
    this.setData({
      loading: true
    });
    byGet(this.data.clink + u_getCarList.URL, {}).then(res => {
      if (res.statusCode === 200) {
        let carList = res.data.content || [];
        carList = carList.map(car => {
          let otaStatus = 1;
          (car.otaList || []).forEach(ele => {
            if (ele.shared === 0) otaStatus = 0;
          });
          return {
            ...car,
            otaStatus,
            shareAllOta: otaStatus === 1
          };
        });
        this.setData({
          carList,
          loading: false
        });
      } else {
        this.setData({
          loading: false
        });
      }
    }).catch(() => {
      this.setData({
        loading: false
      });
    });
  },

  handleAllOTA(e) {
    if (this.data.isOperating) return;
    this.setData({
      isOperating: true
    });
    const vehId = e.currentTarget.dataset.vehid;
    const item = e.currentTarget.dataset.item;
    const status = e.currentTarget.dataset.status;
    const that = this;
    const otaIds = item?.otaList?.map(ele => ele.id)?.filter(Boolean)?.join(',') || '';

    wx.showLoading({
      title: '操作中...'
    });
    const url = status ?
      `${this.data.clink}${u_cancalShareCarToOta.URL}` :
      `${this.data.clink}${u_shareCarToOta.URL}`;

    byPost(url, {
      vehId: vehId,
      otaIds: otaIds
    }, res => {
      wx.hideLoading();
      wx.showToast({
        title: res.data.msg
      });
      that.getCarList();
      that.setData({
        isOperating: false
      });
    }, () => {
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
      that.setData({
        isOperating: false
      });
    });
  },


  // ==========================
  handleSingleOTA(e) {
    if (this.data.isOperating) return;
    this.setData({
      isOperating: true
    });

    const carid = e.currentTarget.dataset.carid;
    const otaid = (e.currentTarget.dataset.otaid).toString();
    const shared = e.currentTarget.dataset.shared;
    const that = this;
    console.log(carid, otaid, shared)

    wx.showLoading({
      title: '操作中...'
    });



    const api = shared ?
      `${this.data.clink}${u_cancalShareCarToOta.URL}` :
      `${this.data.clink}${u_shareCarToOta.URL}`;

    byPost(api, {
      vehId: carid,
      otaIds: otaid
    }, (res) => {
      wx.hideLoading();
      wx.showToast({
        title: res.data.msg
      });
      that.getCarList();
      that.setData({
        isOperating: false
      });
    }, () => {
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
      that.setData({
        isOperating: false
      });
    });
  }
});