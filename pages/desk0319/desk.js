const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  byGet
} = require('../../utils/request/http')
const {
  u_bannerlist,
  u_midMenulist,
  u_menulist
} = require('../../utils/request/home')
const appUtil = require('../../utils/app-util');
const urlUtil = require('../../utils/url-util.js');
Page({


  data: {
    c_screen_height: _handleWindowInfo.windowHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 50 : 50, // 导航栏高度，默认值
    s_banner_height: 60, // banner高度
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 50 : 50), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_banner_image: [], //Banner图集合
    c_link: 'https://k1sw.wiselink.net.cn/', //域名
    g_before_passing_by_icon: [], //快捷入口集合
    s_hierarchy: 0, //目前层级
    s_currently_selected_item: null, //当前选中Item
    s_second_level_selected_item: null,
    s_second_ribbon_selected_item: null,
    flag: false,
    show:false,
    g_number_clicks: 0,
    s_ribbon_height: 0,
    items: Array.from({
      length: 100
    }, (_, i) => `Item ${i + 1}`) // 示例数据
  },

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
  initialGetBanner: function () {
    const _this = this
    const url = _this.data.c_link + u_bannerlist.URL
    const params = {
      [u_bannerlist.terminalId]: 0
    }
    byGet(url, params).then(response => {
      console.log(response)
      _this.setData({
        g_banner_image: response.data.content
      })
    })

  },
  initialQuickEntry() {
    const url = `${this.data.c_link}${u_midMenulist.URL}`;
    const params = {};
    byGet(url, params).then(response => {
      const content = response.data.content;
      const chunkSize = 12;
      const totalChunks = Math.ceil(content.length / chunkSize);
      this.setData({
        g_before_passing_by_icon: Array.from({
            length: totalChunks
          }, (_, index) =>
          content.slice(index * chunkSize, (index + 1) * chunkSize)
        )
      });
    })
  },
  handleHierarchy(evt) {
    const hierarchy = this.data.s_hierarchy;
    let updates = {};

    // 根据 evt.isdir 判断是否需要直接设置 s_second_level_selected_item 并返回
    if (evt.isdir == 0) {
      return;
    }

    // 根据层级更新数据
    if (hierarchy === 0) {
      updates = {
        s_currently_selected_item: evt
      };
    } else if (hierarchy === 1) {
      updates = {
        s_second_level_selected_item: evt
      };
    } else {
      updates = {
        s_currently_selected_item: this.data.s_second_level_selected_item,
        s_second_level_selected_item: evt
      };
    }

    // 更新数据
    this.setData(updates);
  },
  handleGetMenuList: function (e) {
    console.log(e)
    const _this = this;
    const items = e?.currentTarget?.dataset?.item
    const indexs = e?.currentTarget?.dataset?.index

    const menuId = items?.id || indexs
    const isdevelop = items?.isdevelop;
    if (!isdevelop && !indexs) {
      wx.showToast({
        title: '暂未开通，敬请期待',
        icon: 'none'
      });
      return;
    }
    if (!indexs) {
      _this.handleHierarchy(items)
    }

    if (items?.isdir == 0 && !indexs) {
      this.setData({
        s_second_ribbon_selected_item: items,
        flag: true, //暂时数据  需要请求接口而来
      })
      return
    }
    const url = _this.data.c_link + u_menulist.URL;
    const params = {
      [u_menulist.menuId]: menuId,
    };
    byGet(url, params).then(response => {
      const content = response.data.content;
      const chunkSize = 9;
      const totalChunks = Math.ceil(content.length / chunkSize);
      _this.setData({
        s_hierarchy: content?.[0]?.level,
        g_tree_structure_data: Array.from({
            length: totalChunks
          }, (_, index) =>
          content.slice(index * chunkSize, (index + 1) * chunkSize)
        )
      });
    })

  },
  handleGetMenuBack(e) {
    console.log(e)
    if (this.data.s_hierarchy == 1) {
      if (e.currentTarget.dataset.flag != 1) {
        this.handleBack()
      }

    } else {
      this.setData({
        s_second_level_selected_item: null
      })
      this.handleGetMenuList(e)
    }

  },
  handleBack() {
    this.setData({
      s_hierarchy: 0,
      s_currently_selected_item: null,
      s_second_level_selected_item: null,
      g_number_clicks: 0

    })
  },
  handleBindscroll(evt) {
    console.log(evt.detail.scrollTop)
    this.setData({
      s_ribbon_height: evt.detail.scrollTop
    })
  },
  backToTop() {
    console.log(1111)
    // 使用 wx.pageScrollTo API 滚动到页面顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300 // 滚动动画持续时间（毫秒）
    });

  },
  handleUser() {

    this.setData({
      show: !this.data.show
    })
  },
  onLoad(options) {
    this.initialiImageBaseConversion()
    this.initialGetBanner()
    this.initialQuickEntry()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})