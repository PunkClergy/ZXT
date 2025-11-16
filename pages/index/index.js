const {
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList,
  u_logo,
  u_getUserinfo,
  u_updateUserName,
  u_getQrcodeImg,
  u_getNotHaveMidMenulist,
  u_applyMenus,
  u_forceLogin
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
    zoneList: [
      { id: 1, name: '私家车钥匙服务', bgcolor: '#EFF1FC', icon: 'privateCar.png' },
      { id: 2, name: '租车钥匙服务', bgcolor: '#FAF6E9', icon: 'carRental.png' },
      { id: 3, name: '网约车钥匙服务', bgcolor: '#FCEFF3', icon: 'onlineCarHailing.png' },
      { id: 4, name: '企业钥匙服务', bgcolor: '#EAF8F7', icon: 'enterpriseVehicles.png' },
      { id: 5, name: '停运补偿服务', bgcolor: '#EFF1FC', icon: 'suspensionGuarantee.png' },
      { id: 6, name: '物流钥匙服务', bgcolor: '#FCEFF3', icon: 'insideSales.png' },
      { id: 7, name: '渠道合作中心', bgcolor: '#FAF6E9', icon: 'channelCooperation.png' },
      { id: 8, name: '风控钥匙服务', bgcolor: '#EAF8F7', icon: 'installationServices.png' },
      { id: 0, name: 'K7安装服务', bgcolor: '#EAF8F7', icon: 'installationServices.png' },
      { id: 10, name: '内部销售专区', bgcolor: '#FCEFF3', icon: 'insideSales.png' },
    ],

    // 全宽轮播图数据（网络图片）
    fullBannerList: [
      'https://picsum.photos/750/200?random=30',
      'https://picsum.photos/750/200?random=31'
    ],

    // 海报图片（网络图片）
    posterImg: 'https://picsum.photos/750/400?random=40',

    // 底部tab数据（网络图片）
    tabList: [
      { icon: 'https://picsum.photos/50/50?random=50', name: '首页', path: '/pages/index/index' },
      { icon: 'https://picsum.photos/50/50?random=51', name: '采购下单', path: '/pages/orderList/orderList' },
      { icon: 'https://picsum.photos/50/50?random=53', name: '我的', path: '/pages/myPersonalCenter/index' }
    ],


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
  // 动态改变banner高度
  LoadOnImageLoad(e) {
    const [$$, { detail: { width: α, height: β } = {} }] = [this, e ?? {}];
    (async () => {
      try {
        if (!α || !β || typeof α !== 'number' || typeof β !== 'number') throw Symbol();
        const γ = await wx.getSystemInfo({});
        const δ = γ?.windowWidth;
        if (!δ || typeof δ !== 'number') throw Symbol();
        const ε = β / α * δ;
        $$.setData({ s_banner_height: isFinite(ε) ? ε : 0 });
      } catch (ζ) { ζ.description || console.error('σθλ:', ζ); }
    })();
  },


  onLoad() {
    // 图片转BASE64
    this.initialiImageBaseConversion()
    // 请求头部banner资源
    this.initialGetBanner()
  },
  onShow() {
    // 获取系统头部各区域高度
    this.initSystemInfo()
  },
  onReady() {
    // 获取是否要显示优惠券弹窗
    this.initforceLogin()
    // 获取登录状态
    this.initLoginStatus()
    // 获取入群二维码
    this.initQrCode()
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
    const index = evt?.currentTarget?.dataset?.index
    console.log(this.data.tabList[index]?.path)
    wx.navigateTo({
      url: this.data.tabList[index]?.path,
    })
  },
  // 点击专区跳转逻辑
  handleGetMenuList(evt) {
    console.log(evt)
    const menuId = evt?.id ?? evt?.currentTarget?.dataset?.info?.id;
    getApp().data.funAreaId = menuId
    wx.navigateTo({
      url: '/pages/ZoneHome/index',
    })
  }
})