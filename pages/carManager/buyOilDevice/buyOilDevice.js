import {
  byGet
} from '../../../utils/request/http';
import u_url from '../../../utils/request/eqpmnt';

Page({
  data: {
    obj_details: {}
  },

  onLoad: function () {
    this.initBlanceReport()
  },

  onShow: function () {
    this.initTabBar()
  },
  handleNavigation(eve) {
    const type = eve.currentTarget.dataset.tag
    const routes = {
      balance: '/pages/carManager/buyOilDevice/balance/index',
      oilDeviceCount: '/pages/carManager/buyOilDevice/oilLevel/index',
      oilDeviceRemainingUseCount: '/pages/carManager/buyOilDevice/oilQuantity/index',
      mcckDeviceCount: '/pages/carManager/buyOilDevice/mcckSelf/index',
      balanceList: '/pages/carManager/buyOilDevice/balance/detailes',
      oilDeviceCountList: '/pages/carManager/buyOilDevice/oilLevel/detailes',
      oilDeviceRemainingUseCountList: '/pages/carManager/buyOilDevice/oilQuantity/detailes',
      mcckDeviceCountList: '/pages/carManager/carList/carList',
    };

    const url = routes[type];

    if (!url) {
      return;
    }

    wx.navigateTo({
      url: url,
    });
  },
  initBlanceReport() {
    const _this = this
    byGet(getApp().data.k1swUrl + u_url.u_blanceAndDeviceReport.URL, {}).then(response => {
      const rspns = response.data.content
      _this.setData({
        obj_details: rspns
      })
    })
  },
  initTabBar() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },
})