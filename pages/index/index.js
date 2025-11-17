const {
  u_bannerlist,
  u_getQrcodeImg,
  u_forceLogin,
  u_getHomeArea,
  u_navlist20,
  u_booklist
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
    // 未登录状态下优惠券弹窗显示状态
    coupon_modal: false,
    // 咨询入群弹窗状态
    join_the_group_modal: false,
    // 专区入口数据（网络图片）
    zoneList: [],
    // 底部tab数据（网络图片）
    tabList: [],
    // 使用指南数据
    fullBannerList: [
      'https://picsum.photos/750/200?random=30',
      'https://picsum.photos/750/200?random=31'
    ],
    // 使用指南处轮播高度
    s_use_height: '',

    // 海报图片（网络图片）
    posterImg: 'https://picsum.photos/750/400?random=40',


  },
  // 获取系统头部各区域高度
  initSystemInfo() {
    const { statusBarHeight: s } = wx.getWindowInfo()
    const m = wx.getMenuButtonBoundingClientRect()
    if (!m) return
    const n = m.height + (m.top - s) * 2
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
    const [$$, __, ___] = [this, u_bannerlist.URL, Symbol('')];
    try {
      (async (a, b, c) => {
        if (!a || !b || typeof c !== 'function') throw ___;
        const d = await c(`${b.data.c_link}${a}`, { terminalId: 0 });
        if (!d?.data?.content) throw ___;
        b.setData({ g_banner_image: d.data.content });
      })(__, $$, byGet).catch(e => e !== ___ && console.error(e));
    } catch (e) { /* */ }
  },
  // 获取是否要显示优惠券弹窗
  initforceLogin() {
    const [t, d] = [this, this.data];
    byGet(d.c_link + u_forceLogin.URL, {}).then(r => {
      const s = t.setData.bind(t),
        l = isLogin(),
        c = r?.data?.content;
      s({ coupon_modal: !l && c === 1 })
    }).catch(_ => void 0)
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


  onLoad() {
    getApp().data.funAreaId = '';
    (() => {
      // 图片转BASE64
      this.initialiImageBaseConversion();
      // 请求头部banner资源
      this.initialGetBanner();
      // 请求专区目录数据
      this.initZoneInfo();
      // 请求导航数据
      this.initBottomDirectory();
    })();
  },
  onShow() {
    // 获取系统头部各区域高度
    this.initSystemInfo()
    // 获取是否要显示优惠券弹窗
    this.initforceLogin()
    // 获取登录状态
    this.initLoginStatus()
    // 获取入群二维码
    this.initQrCode()
    // 获取使用指南
    this.initBookList()
  },

  // 已有账号，跳转常规登录页面
  handleOnExistingAccountTap() {
    (0, wx.navigateTo)({ url: '/pages/system/managerLoginView/loginView' })
  },
  // 授权登录
  async handleOnGetPhoneNumber(e) {
    try {
      // 获取登录凭证
      const loginRes = await (() => new Promise((_, __) => wx.login({
        success: _,
        fail: e => __((() => {
          const m = e.errMsg;
          return m ? new Error(`登录失败: ${m}`) : new Error('登录失败: 未知错误');
        })())
      })))();

      // 判断是否继续执行
      !(loginRes?.code) && (() => { throw new Error('无法获取登录凭证'); })();

      // 检查授权码 判断是否拒绝了授权
      !e?.detail?.code && (() => { return; })();

      // 发送登录请求
      const response = await (() => new Promise((_, $) => byPost(
        `${this.data.c_link}userapi/wxLogin`,
        { code: e.detail.code, inviteCode: this.data.invit_code || '', wxCode: loginRes.code },
        r => r?.data?.content ? _(r) : $(new Error((() => r?.data?.message || '登录接口响应异常')())),
        e => $(new Error(`网络请求失败:${e.errMsg}`))
      )))();

      // 用户信息获取失败
      const userInfo = response?.data?.content;
      !userInfo && (void (() => { throw new Error('用户信息获取失败'); })());

      // 配置URL（简化条件判断）
      const isTestUser = userInfo.username === '13683187039*';
      const BASE_DOMAIN = 'wiselink.net.cn';
      const urlConfig = {
        k1swUrl: isTestUser
          ? `https://k1swtest.${BASE_DOMAIN}/`
          : `https://k3a.${BASE_DOMAIN}/`,
        fin3Url: `https://fin3.${BASE_DOMAIN}/fin/`
      };

      // 封装微信存储操作的工具函数
      const storageUtil = {
        set: (key, data) => new Promise((resolve) => {
          wx.setStorage({ key, data, success: resolve });
        }),
        get: (key) => new Promise((resolve, reject) => {
          wx.getStorage({ key, success: resolve, fail: reject });
        })
      };

      // 批量存储数据（并行处理提升效率）
      const app = getApp();
      const storageTasks = [
        storageUtil.set(app.data.k1swUrlKey, urlConfig.k1swUrl),
        storageUtil.set(app.data.fin3UrlKey, urlConfig.fin3Url),
        storageUtil.set(app.data.userKey, userInfo)
      ];

      // 并行执行所有存储操作（无依赖时推荐）
      await Promise.all(storageTasks);

      // 更新应用数据（集中赋值）
      Object.assign(app.data, {
        k1swUrl: urlConfig.k1swUrl,
        fin3Url: urlConfig.fin3Url,
        userInfo,
        reflag: 1
      });

      // 处理模态框和用户信息设置
      this.setData({ coupon_modal: false });

      // 读取用户信息并更新视图
      try {
        const { data } = await storageUtil.get('userKey');
        console.log(data)
        this.setData({
          account: data?.companyName || data?.username
        });
      } catch (err) {
        console.warn('获取用户信息失败:', err);
        this.setData({ account: '' });
      }
    } catch (error) {
    }
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
  // 点击专区跳转逻辑
  handleGetMenuList(evt) {
    const menuId = evt?.id ?? evt?.currentTarget?.dataset?.info?.id;
    const path = evt?.path ?? evt?.currentTarget?.dataset?.info?.path;
    const name = evt?.name ?? evt?.currentTarget?.dataset?.info?.name
    getApp().data.funAreaId = menuId
    const hasDesk = path.includes('desk') || path.includes('/desk');
    if (hasDesk) {
      wx.switchTab({
        url: path,
      })
    } else {
      wx.navigateTo({
        url: `${path}?menuId=${menuId}&name=${name}`,
      })
    }

  },
  // 点击使用指南跳转
  handleUseJump(evt) {
    const info = evt?.currentTarget?.dataset?.info
    wx.navigateTo({
      url: `/${info?.bookPath}`,
    })
  }
})