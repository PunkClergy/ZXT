const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList
} = require('../../utils/request/home')
const {
  byGet,
  isLogin
} = require('../../utils/request/http')
Page({
  num: 0,
  data: {
    s_background_picture_of_the_front_page: '', // 背景图片
    s_client_bg: '',
    s_channel_bg: '',
    s_service_bg: '', //客户端tabs底图
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    s_banner_height: 150, // banner高度
    g_before_passing_by_icon: [], //快捷入口数据
    s_background_image_of_the_tree: '', //树的背景图
    s_background_image_of_the_banner: '', //banner背景
    s_quick_entrance_height: 60, //快捷入口高度 70为一行 140为两行 210为三行...
    c_link: 'https://k1sw.wiselink.net.cn/', //域名
    g_tree_structure_data: [], //分类树结构
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    g_quickIndex: 0, //快捷入口当前页
    g_right_data: [], //右侧面板数据
    s_termial: [],
    termial_active: null,
    num: 0, //下拉计数
    sn_specific_value: null,
    sn_state: false, //显示地图状态
  },

  // 转换背景图base64
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
        path: '/assets/images/home/t_bg.png',
        key: 's_t_bg'
      },
      {
        path: '/assets/images/home/client_bg.png',
        key: 's_client_bg'
      },
      {
        path: '/assets/images/home/channel_bg.png',
        key: 's_channel_bg'
      },
      {
        path: '/assets/images/home/service_bg.png',
        key: 's_service_bg'
      }, {
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
  // 动态改变banner高度
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
  // 请求banner资源
  initialGetBanner: function () {
    const _this = this
    byGet(_this.data.c_link + u_bannerlist.URL, {
      terminalId: 0
    }).then(response => {
      _this.setData({
        g_banner_image: response.data.content
      })
    })
  },
  // 请求快捷入口数据
  initialQuickEntry(e) {
    const _this = this
    const url = `${this.data.c_link}${u_midMenulist.URL}`;
    const params = {
      terminalId: e?.id || e?.currentTarget?.dataset?.item?.id
    };
    byGet(url, params).then(response => {
      const content = response.data.content;
      this.setData({
        g_before_passing_by_icon: [content.slice(0, 5), content.slice(5, 10), content.slice(9, 14)],
        termial_active: e?.id || e?.currentTarget?.dataset?.item?.id,
        g_quickIndex: 0,
        tabs_bg: params?.terminalId == '-1' ? _this.data.s_client_bg : (params?.terminalId == 222 ? _this.data.s_channel_bg : _this.data.s_service_bg),
      }, () => {
        this.handleGetMenuList({
          id: content[0].id
        })
        this.handleRightSideData({
          id: content[0].id
        })
      });
    })
  },
  // 请求右侧面板数据
  handleRightSideData(evt) {
    const _this = this
    byGet(_this.data.c_link + u_rightMenulist.URL, {
      menuId: evt.id,
      isDir: 1,
    }).then(response => {
      const rspns = response.data.content
      _this.setData({
        g_right_data: rspns,
      }, () => {
        wx.createSelectorQuery().selectAll('.section').boundingClientRect(rects => {
          this.sections = rects;
        }).exec();
      })
    })
  },
  // 进入默认请求树的第一个
  handleSwitchChild(e) {
    const _this = this
    _this.setData({
      g_th_crrntly_slctd_tr_nd: e?.detail?.item?.id || e,
      scrollIntoId: 'section' + e?.detail?.item?.id || e,
      num: 0
    })
  },
  // 获取右侧树内容
  handleGetMenuList: function (e) {
    const menuId = e?.id || e?.currentTarget?.dataset?.item?.id;
    if (!menuId) {
      wx.showToast({
        title: '暂未开通，敬请期待',
        icon: 'none'
      });
      return;
    }

    const _this = this;
    byGet(_this.data.c_link + u_menulist.URL, {
      menuId,
      isDir: 1,
    }).then(response => {
      const rspns = response.data.content
      const processed = rspns.map(ele => ({
        id: ele.id,
        name: ele.name,
        isExpanded: false,
        children: ele.children
          .filter(child => child.isdir === 1)
          .map(child => ({
            ...child
          }))
      }));

      _this.setData({
        g_tree_structure_data: processed,
        sn_state: menuId == 540 ? true : false
      }, () => {
        _this.handleSwitchChild(processed[0]?.id);
        _this.handleRightSideData({
          id: menuId
        })
      });
    })
  },
  // 判断当前为三行排列还是单行排列
  handleQuickEntry(evt) {
    const currentIndex = evt.detail.current;
    const newData = {
      g_quickIndex: currentIndex,
      // s_quick_entrance_height: currentIndex === 1 ? 120 : 120 //此处为行高的设置
    };
    this.setData(newData);
  },
  // 跳转功能页面
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
  // 右侧面板滑动方法
  handleBinddragstart(evt) {
    const scrollTop = Math.floor(evt.detail.scrollTop);
    this.setData({
      num: this.data.num + 1
    }, () => {
      if (scrollTop < 10) {
        this.setData({
          g_th_crrntly_slctd_tr_nd: this.sections[0].id.slice(7),
          num: 0
        });
        return;
      }
      const baseTop = scrollTop + (this.sections[0].top - 60);
      const resultId = this.sections.find(section => section.top > baseTop)?.id ?? '';
      if (this.data.num > 10) {
        this.setData({
          g_th_crrntly_slctd_tr_nd: resultId.slice(7),
          num: 0
        });
      }
    });
  },
  // 请求终端数据
  handleTermialList() {
    const _this = this
    byGet(_this.data.c_link + u_termialList.URL, {}).then(response => {
      const rspns = response.data.content
      this.setData({
        s_termial: rspns,
        termial_active: rspns[0].id,
        tabs_bg: rspns[0].id == '-1' ? _this.data.s_client_bg : (rspns[0].id == 222 ? _this.data.s_channel_bg : _this.data.s_service_bg)
      }, () => {
        _this.initialQuickEntry({
          id: rspns[0].id
        })
      })

    })
  },
  onLoad: function (options) {
    wx.hideTabBar();
    this.initialGetBanner()
    this.handleTermialList()
    if (options?.scene||options?.query) {
      this.setData({
        sn_state: true,
        sn_specific_value: options?.scene || options?.query
      }, () => {
          wx.setStorageSync('scene', options?.scene || options?.query);
      })
    }
  },
  triggerChildEvent(){
    // / 使用 this.selectComponent('#myChild') 来获取子组件实例
    const child = this.selectComponent('#myChild');
    if (child) {
      // 调用子组件的方法，并传递参数
      child.childMethod('来自父组件的消息');
    }
  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },

  onShow: function (e) {

  },
  onUnload: function () {
    this.setData({
      sn_state_num: 0
    })
  }
})