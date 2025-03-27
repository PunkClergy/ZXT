import {
  byGet
} from '../../utils/request/http';
import {
  menulist,
  bannerlist
} from '../../utils/request/home';

Page({
  data: {
    s_background_picture_of_the_front_page: '', // 背景图片
    s_background_image_of_the_tree: '', //树的背景图
    s_background_image_of_the_banner: '', //banner背景
    s_men_button_info: {}, // 胶囊按钮的位置信息
    s_banner_height: 150, // banner高度
    s_quick_entrance_height: 60, // 快捷入口高度
    s_dynamic_lower_height: 0, //底部高度
    g_banner_image: [], //Banner图集合
    g_tree_structure_data: [], //分类树结构
    g_th_crrntly_slctd_tr_nd: null, // 当前选中的节点ID
    c_link: 'https://k1sw.wiselink.net.cn/', //域名
    array: ['车务宝Wiselink·客户端']
  },

  bindPickerChange() {
    wx.navigateToMiniProgram({
      appId: 'wxb22f46c5e4301c1c',
    })
  },
  initialElementHeight() {
    const query = wx.createSelectorQuery()
    let upperHeight = 0
    let middleHeight = 0
    let reserveHeight = 0
    query.select('.upper').boundingClientRect(rect => {
      upperHeight = rect ? rect.height : 0
    }).select('.middle').boundingClientRect(rect => {
      middleHeight = rect ? rect.height : 0
    }).exec(() => {
      const totalHeight = upperHeight + middleHeight
      if (totalHeight <= 0) return;
      const windowInfo = wx.getWindowInfo();
      const platform = wx.getDeviceInfo().platform;
      let reserveHeight;
      const heightAdjustments = {
        ios: [{
            maxHeight: 700,
            reserveHeight: 20
          },
          {
            maxHeight: 750,
            reserveHeight: 35
          },
          {
            maxHeight: 850,
            reserveHeight: 55
          },
          {
            maxHeight: 900,
            reserveHeight: 70
          },
          {
            maxHeight: 950,
            reserveHeight: 75
          },
          {
            maxHeight: Infinity,
            reserveHeight: 80
          }
        ],
        others: [{
            maxHeight: 800,
            reserveHeight: 15
          },
          {
            maxHeight: 900,
            reserveHeight: 30
          },
          {
            maxHeight: Infinity,
            reserveHeight: 20
          }
        ]
      };

      function findReserveHeight(adjustments, windowHeight) {
        const adjustment = adjustments.find(item => windowHeight < item.maxHeight);
        return adjustment ? adjustment.reserveHeight : 0;
      }
      reserveHeight = findReserveHeight(
        platform === "ios" ? heightAdjustments.ios : heightAdjustments.others,
        windowInfo.windowHeight
      );
      this.setData({
        s_dynamic_lower_height: windowInfo.windowHeight - (totalHeight + reserveHeight),
      });
    })
  },
  initialiMenuButtonPosition() {
    const _this = this
    const menuButtonRect = wx.getMenuButtonBoundingClientRect();
    _this.setData({
      s_men_button_info: menuButtonRect
    });
  },
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
        path: '/assets/images/index/bg.png',
        key: 's_background_picture_of_the_front_page'
      },
      {
        path: '/assets/images/index/tree_bg.png',
        key: 's_background_image_of_the_tree'
      },
      {
        path: '/assets/images/index/banner-bg.png',
        key: 's_background_image_of_the_banner'
      }
    ];
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
  initialiOnImageLoad(e) {
    const _this = this
    const {
      width,
      height
    } = e.detail;
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    const imageHeight = (height / width) * screenWidth;
    _this.setData({
      s_banner_height: imageHeight
    });
  },

  handleSwitchChild(e) {
    const _this = this
    byGet(_this.data.c_link + menulist.URL, {
      menuId: e?.detail?.item?.id || e,
      isDir: 0,
      terminalId: 0
    }).then(response => {
      const rspns = response.data.content
      _this.setData({
        RightSideData: rspns,
        g_th_crrntly_slctd_tr_nd: e?.detail?.item?.id || e,
      })
    })
  },
  handleJumpPage: function (e) {
    const item = e.currentTarget.dataset.item;
    if (!item.isdevelop) {
      wx.showToast({
        title: '暂未开通，敬请期待',
        icon: 'none'
      });
      return;
    }

    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return;
    }
    if (item.path === '/pages/carManager/buyOilDevice/buyOilDevice') {
      wx.switchTab({
        url: item.path
      });
    } else {
      wx.navigateTo({
        url: item.path
      });
    }
  },

  initialSelectedTabBar() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },


  onLoad: function (options) {
    const _this = this
    _this.initialiMenuButtonPosition()
    _this.initialElementHeight()

  },

  onReady: function () {
    const _this = this
    _this.initialiImageBaseConversion()
  },

  onShow: function (e) {
    const _this = this
    _this.initialSelectedTabBar()

  },
})