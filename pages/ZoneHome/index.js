const {
  u_bannerlist20,
  u_getQrcodeImg,
  u_navlist20,
  u_getHomeArea,
  u_booklist,
  u_isShowInfo
} = require('../../utils/request/home')
const {
  byGet,
  byPost,
  isLogin
} = require('../../utils/request/http')
Page({
  data: {
    // 底部tabbar高度
    tabBarHeight: 80,
    // 当前选中的底部tabbar索引
    currentTab: 0,
    // 原始链接
    c_link: 'https://k1sw.wiselink.net.cn/',
    // 头部轮播图数据
    g_banner_image: [],
    // 头部轮播图动态高度
    s_banner_height: '',
    // 咨询入群弹窗状态
    join_the_group_modal: false,
    // 使用指南数据
    fullBannerList: [],
    // 头部标题
    title_name: '',
    // 主题颜色
    bgcolor: '#fff',
    // 距离头部
    height_from_head: '',
    // 专区入口数据（网络图片）
    zoneList: [
      { id: 1, name: '钥匙分享', bgcolor: '#EFF1FC', icon: 'privateCar.png' },
    ],
    // 底部tab数据（网络图片）
    tabList: [],
    isShowInfo: false,
    servicePhone: '400-090-5050'
  },
  handleMakePhoneCallWithConfirm() {
    const { servicePhone } = this.data;
    // 第一步：弹出确认框，告知用户要拨打的号码
    wx.showModal({
      title: '拨打电话',
      content: `是否拨打客服电话：${servicePhone}`,
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: servicePhone,
            fail(err) {
              if (err.errMsg !== 'makePhoneCall:fail cancel') {
                wx.showToast({
                  title: '拨号失败，请稍后重试',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
  },
  handleOnExistingAccountTap() {
    (0, wx.navigateTo)({ url: '/pages/system/managerLoginView/loginView' })
  },
  // 获取系统头部各区域高度
  initSystemInfo() {
    const { statusBarHeight: s } = wx.getWindowInfo()
    const m = wx.getMenuButtonBoundingClientRect()
    if (!m) return
    const n = m.height + (m.top - s) * 2
    console.log(s)
    const c = wx.getWindowInfo().screenWidth - m.right
    this.setData({
      height_from_head: s,
      head_height: s + n,
      capsule_distance_to_the_right: c
    })
  },
  // 转换背景图base64
  initialiImageBaseConversion() {
    const [o, l] = [this, [{ path: "/assets/images/index/bg.png", key: "s_background_picture_of_the_front_page" }]];
    (new class {
      constructor(t) {
        this.t = t;
        this.p = wx.getFileSystemManager();
        this.run();
      }
      run() {
        Promise.all(this.t.map((i, _, a) => new Promise((r, j) => this.p.readFile({
          filePath: i.path,
          encoding: 'base64',
          success: (d) => r({ [i.key]: `data:image/png;base64,${d.data}` })
        })))).then((s) => this.t[0] && o.setData(s.reduce((_, c) => ({ ..._, ...c }), {})));
      }
    }(l));
  },
  // 获取头部banner资源
  initialGetBanner() {
    const [$$, __, ___] = [this, u_bannerlist20.URL, Symbol('')];
    try {
      (async (a, b, c) => {
        if (!a || !b || typeof c !== 'function') throw ___;
        const d = await c(`${b.data.c_link}${a}`, { terminalId: 0 });
        if (!d?.data?.content) throw ___;
        b.setData({ g_banner_image: d.data.content });
      })(__, $$, byGet).catch(e => e !== ___ && console.error(e));
    } catch (e) { /* */ }
  },
  // 获取当前登录状态
  initLoginStatus() {
    wx.getStorage({
      key: 'userKey', // 替换为你的缓存键值
      success: res => {
        this.setData({
          account: res?.data?.companyName || res?.data?.username
        })
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
      }
    });
  },
  // 请求入群码
  initQrCode() {
    byGet(this.data.c_link + u_getQrcodeImg.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          personal_qr_code: response.data.content.img
        })
      }
    })
  },
  // 获取底部导航数据
  initBottomDirectory() {
    byGet(this.data.c_link + u_navlist20.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          tabList: response.data.content
        })
      }
    })
  },
  // 获取专区目录
  initZoneInfo() {
    byGet(this.data.c_link + u_getHomeArea.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          zoneList: response.data.content
        })
      }
    })
  },
  // 获取使用指南
  initBookList() {
    byGet(this.data.c_link + u_booklist.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          fullBannerList: response.data.content
        })
      }
    })
  },
  // 动态改变轮播图高度
  LoadOnUseGuideImageLoad(e) {
    const [self, { currentTarget: { dataset: { flag: mark } = {} } = {} }] = [this, e ?? {}];
    (async () => {
      try {
        const { detail: { width: w, height: h } = {} } = e ?? {};
        if (!w || !h || typeof w !== 'number' || typeof h !== 'number') throw Symbol();
        const { windowWidth: winW } = await wx.getSystemInfo({});
        if (!winW || typeof winW !== 'number') throw Symbol();
        const ratioH = h / w * winW;
        const validH = isFinite(ratioH) ? ratioH : 0;
        mark === 'use' && self.setData({ s_use_height: validH });
        mark === 'banner' && self.setData({ s_banner_height: validH });
      } catch (err) { err.description || console.error('imgLoadErr:', err); }
    })();
  },
  // 跳转到视频播放页面
  handlePlayVideo(evt) {
    console.log(evt)
    return
    const path = evt?.currentTarget?.dataset?.bookPath || 'http://vd3.bdstatic.com/mda-rmrtu3rkqkfbsh19/360p/h264/1766777930691493092/mda-rmrtu3rkqkfbsh19.mp4'
    wx.navigateTo({
      url: '/pages/watchVideos/index?url=' + encodeURI(path) + '&title=' + '6677',
    })
  },
  // 获取是否显示温馨提示
  inIsShowInfo() {
    byGet(this.data.c_link + u_isShowInfo.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          isShowInfo: response.data.content
        })
      }
    })
  },

  onLoad(options) {
    // 图片转BASE64
    this.initialiImageBaseConversion()
    // 请求头部banner资源
    this.initialGetBanner()
    // 请求导航数据
    this.initBottomDirectory()
    // 功能区入口
    this.initZoneInfo()
    // 获取使用指南
    this.initBookList()
    if (options?.name) {
      this.setData({
        title_name: options?.name
      })
    }
    if (options?.bgcolor) {
      this.setData({
        bgcolor: options?.bgcolor
      })
    }
  },
  onShow() {
    // 获取系统头部各区域高度
    this.initSystemInfo()
    // 获取是否显示温馨提示
    this.inIsShowInfo()
  },
  onReady() {
    // 获取登录状态
    this.initLoginStatus()
    // 获取入群二维码
    this.initQrCode()
  },



  // 点击“咨询” 显示入群二维码
  handleShowContact() {
    this.setData({ join_the_group_modal: true })
  },
  // 点击关闭咨询&群二维码
  handleQRClose() {
    this.setData({
      join_the_group_modal: false
    })
  },
  // 预览图片使其放大
  handleQRShowImageMask() {
    wx.previewMedia({
      sources: [{
        url: this.data.personal_qr_code, // 图片路径
        type: 'image',
      },],
    });
  },
  // 切换底部导航
  handleSwitchTabNavigation(evt) {
    const { currentTarget: { dataset: { index: idx = null } = {} } = {} } = evt ?? {};
    if (idx === null) return;
    const { tabList = [] } = this.data;
    const { pagePath: targetUrl } = tabList[idx] ?? {};
    if (!targetUrl) return;
    const [currentPage] = getCurrentPages().slice(-1);
    const { route: currentPath } = currentPage ?? {};
    if (!currentPath) return;
    const targetPurePath = targetUrl.split('?')[0];
    console.log(currentPath, targetPurePath);
    currentPath !== targetPurePath && wx.redirectTo({ url: `/${targetUrl}` });
  },
  // 返回上一页面
  handleBackHome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  //  跳转功能页面
  handleGetMenuList(evt) {
    if (!isLogin()) {
      wx.redirectTo({
        url: '/pages/system/managerLoginView/loginView',
      })
      return
    }
    const path = evt?.path ?? evt?.currentTarget?.dataset?.info?.path;
    const hasDesk = path.includes('desk') || path.includes('/desk');
    if (hasDesk) {
      wx.switchTab({
        url: path,
      })
    } else {
      wx.navigateTo({
        url: `/${path}`,
      })
    }

  },

})