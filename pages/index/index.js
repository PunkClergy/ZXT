const {
  u_bannerlist20,
  u_getQrcodeImg,
  u_forceLogin,
  u_getHomeArea,
  u_navlist20,
  u_booklist,
  u_getposter,
  u_getnotice,
  u_termialList
} = require('../../utils/request/home')
const {
  u_carList
} = require('../../utils/request/car')
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
    // 专区入口数据
    zoneList: [],
    // 临时专区入口数据
    temporaryZoneList: [],
    // 底部tab数据
    tabList: [],
    // 使用指南数据
    fullBannerList: [],
    // 使用指南处轮播高度
    s_use_height: '',
    // 海报图片
    posterImg: 'https://picsum.photos/750/400?random=40',
    // 公告数据
    notice_data: '新版偷偷上线！体验更丝滑，速来体验～',
    // 短信进入携带参数
    options: {},
    servicePhone: '400-090-5050',
    // 日志
    Journal: [
      '首页增加更新日志显示功能,方便用户感知更新内容;',
      '用车人账号，内容显示逻辑优化',
    ],
    longPress: false,//长按操作
    // 日志弹窗是否显示
    JournalFlag: false,
    // 版本号
    version: 'v2026011401'
  },
  // 长按专区卡片执行事件
  handleLongPress() {
    this.setData({ longPress: !0, isLongPressShaking: !0 });
    setTimeout(() => this.setData({ isLongPressShaking: !1 }), 500);
  },
  // 取消自定义设定
  handleCancelSettings() {
    const t = this.data.zoneList;
    this.setData({ temporaryZoneList: [] }, () => this.setData({ longPress: !1, zoneList: t }));
  },
  // 点击卡片关掉具体卡片
  handleCloseZone(e) {
    if (this.data.temporaryZoneList?.length == 1)
      return wx.showToast({ title: '禁止关闭最后一项！', icon: 'none' });
    const i = e?.currentTarget?.dataset?.item?.id,
      t = this.data.temporaryZoneList?.length > 0 ? this.data.temporaryZoneList : this.data.zoneList,
      n = t.filter(item => item.id !== i);
    this.setData({ temporaryZoneList: n });
  },
  // 确认自定义设定
  handleConfirmSettings() {
    if (this.clickLock) return;
    this.clickLock = !0;
    const t = this.data.temporaryZoneList, z = this.data.zoneList,
      i = t.map(item => item.id).filter(id => id);
    try {
      wx.setStorageSync('temporaryZoneIds', i);
      console.log('临时区域ID已存入小程序缓存:', i);
    } catch (e) {
      console.error('缓存写入失败:', e);
    }
    this.setData({ longPress: !1 }, () =>
      this.setData({ temporaryZoneList: [], zoneList: t.length > 0 ? t : z }, () => {
        this.clickLock = !1;
      })
    );
    setTimeout(() => { this.clickLock = !1 }, 2000);
  },
  // 重置自定义设定
  handleResetSettings() {
    wx.removeStorage({
      key: 'temporaryZoneIds',
      success: () => this.setData({ longPress: false }, this.initZoneInfo),
      fail: (err) => err.errMsg.includes('key not found') && this.setData({ longPress: false }, this.initZoneInfo)
    });
  },
  // 点击banner跳转路径
  handleJumpInfo(evt) {
    const { item = {} } = evt?.currentTarget?.dataset || {};
    const { fileType, path: localPath, img } = item;

    const IMG_BASE_URL = 'https://k3a.wiselink.net.cn/img/';
    const targetPath = fileType === 1
      ? localPath
      : `${IMG_BASE_URL}${img || ''}`;
    const navigateUrl = fileType === 1
      ? targetPath
      : `/pages/agreementWebView/agreementWebView?url=${targetPath}`;

    if (!navigateUrl) {
      wx.showToast({ title: '跳转路径无效', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: navigateUrl,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' });
      }
    });
  },
  // 400拨号
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
  // 跳转到视频播放页面
  handlePlayVideo(evt) {
    console.log(evt)
    const path = evt?.currentTarget?.dataset?.url
    const title = evt?.currentTarget?.dataset?.title || '使用指南'
    if (path) {
      wx.navigateTo({
        url: '/pages/watchVideos/index?url=' + encodeURI(path) + '&title=' + title,
      })
    }
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
  async initZoneInfo() {
    const cacheIds = wx.getStorageSync('temporaryZoneIds') || [];
    const { statusCode, data: { content = [] } = {} } = await byGet(`${this.data.c_link}${u_getHomeArea.URL}`, {});
    if (statusCode !== 200 || !content.length) return;
    const zoneList = cacheIds.length
      ? content.filter(item => cacheIds.includes(item.id))
      : content;
    await new Promise(resolve => this.setData({ zoneList }, resolve));
    const { options } = this.data;
    if (options && typeof options === 'object' && Object.keys(options).length) {
      this.initjumpToCar();
    }
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
  // 获取海报和广告位
  initPoster() {
    byGet(this.data.c_link + u_getposter.URL, {}).then(response => {
      console.log(response)
      if (response.statusCode == 200) {
        this.setData({
          posterImg: response.data.content[0]
        })
      }
    })
  },
  // 获取公告数据
  initNotice() {
    byGet(this.data.c_link + u_getnotice.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          notice_data: response.data.content[0]
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
  // 判断参数是否为APPID
  isMiniProgramAppid(appid) {
    if (typeof appid !== 'string') {
      return false;
    }
    const appidReg = /^wx[0-9a-zA-Z]{16}$/;
    return appidReg.test(appid);
  },
  // 跳转其他小程序
  navigateToOtherMiniProgram(targetAppId, path = '', extraData = {}) {
    if (!wx.navigateToMiniProgram) {
      wx.showToast({
        title: '当前微信版本过低，无法支持跳转',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    wx.navigateToMiniProgram({
      appId: targetAppId,
      path: path,
      extraData: extraData,
      envVersion: 'release',
    });
  },
  // 保存OnLoad携带来的所有参数
  initSaveParameters(options) {
    this.setData({
      options: options || {}
    });
  },
  // 用车人进入
  initjumpToCar() {
    const { options = {}, zoneList } = this.data;
    const { scene, query } = options;
    const sceneParam = scene ?? query;
    if (!sceneParam || typeof sceneParam !== 'string' || sceneParam.length < 10) return;
    (() => {
      const [result] = sceneParam.split('_');
      const setGlobal = (id) => {
        getApp().data.funAreaId = id;
        wx.setStorageSync('scene', sceneParam);
      };
      const handlers = {
        blue: () => {
          const getId = (zList) => {
            if (!Array.isArray(zList)) return 0;
            const target = zList.find(item => item?.name?.includes('私家车'));
            return target?.id ?? 0;
          };
          setGlobal(getId(zoneList));
          wx.navigateTo({
            url: `/pages/ToCConsumer/privateCar/index?scene=${encodeURIComponent(sceneParam)}`
          });
        },
        default: () => {
          setGlobal(result);
          this.setData({
            sn_state: true,
            sn_specific_value: sceneParam
          }, () => {
            wx.setStorageSync('scene', sceneParam);
            if (sceneParam.length > 6) {
              wx.navigateTo({ url: '/pages/vehicleUser/index' });
            }
          });
        }
      };
      const handler = handlers[result] ?? handlers.default;
      typeof handler === 'function' && handler();
    })();
  },
  // 请求不通直接进入无网模式
  handleTermialList() {
    const _this = this
    // byGet(_this.data.c_link + u_termialList.URL, {}).then(response => {

    // }).catch((err) => {
    wx.getStorage({
      key: 'bluetoothData',
      success(res) {
        wx.redirectTo({
          url: '/pages/ToCConsumer/privateCar/indexUrgent',
        })
      },
      fail(err) {
        console.log('获取缓存失败:', err);
        wx.getStorage({
          key: 'networkBlue',
          success(res) {
            wx.redirectTo({
              url: '/pages/netCarurgent/index',
            })
          }
        });
      }
    });
    // })
  },

  // 心跳检测
  heartbeatDetection() {
    const heartbeatUrl = 'https://k1sw.wiselink.net.cn/deskapi/homeArea'
    return new Promise((resolve) => {
      wx.request({
        url: heartbeatUrl,
        method: 'GET',
        timeout: 3000,
        data: {},
        success: (res) => {
          if (res.statusCode === 200) {
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
            // 判断是否有缓存
            this.initQueryCacheAndRoles()
          } else {
            this.handleTermialList()
          }
        },
        fail: (err) => {
          this.handleTermialList()
        }
      });
    });
  },
  onLoad(options) {
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
      // 请求海报数据
      this.initPoster()
      // 获取公告数据
      this.initNotice()
      // 用车人短信进入
      this.initSaveParameters(options)
    })();
  },
  onHide() {
    // 执行取消设定逻辑
    this.handleCancelSettings()
  },
  // 当前版本
  async handleVersion() {
    try {
      const currentVersion = this.data.version;
      const cacheVersion = wx.getStorageSync('version') ?? '';
      this.setData({ JournalFlag: currentVersion !== cacheVersion });
    } catch (err) {
      this.setData({ JournalFlag: true });
    }
  },
  // 设置当前版本号
  handleSetVersion() {
    wx.setStorage({
      key: 'version',
      data: this.data.version,
      success: () => {
        // 读取缓存验证
        this.setData({
          JournalFlag: false
        })
      }
    });
  },
  onShow() {
    this.heartbeatDetection();
    // 更新日志是否显示
    this.handleVersion()
  },
  // 判断是否有缓存
  async initQueryCacheAndRoles() {
    const key = 'scene', code = 200, url = '/pages/vehicleUser/index';
    if (isLogin()) {
      try {
        const res = await byGet(this.data.c_link + u_carList.URL, { page: 1 });
        if (res?.statusCode == code && res?.data?.count == 0) {
          try {
            const sceneRes = await wx.getStorage({ key });
            sceneRes?.data && wx.redirectTo({ url });
          } catch (e) { console.warn('读取scene缓存失败：', e); }
        }
      } catch (e) { console.error('车辆列表请求失败：', e); }
    } else {
      try {
        const sceneRes = await wx.getStorage({ key });
        sceneRes?.data && wx.redirectTo({ url });
      } catch (e) { console.warn('读取scene缓存失败：', e); }
    }
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
    if (this.data.longPress) {
      return
    }
    const eventInfo = evt || {};
    const datasetInfo = eventInfo.currentTarget?.dataset?.info || {};
    const menuId = eventInfo.id ?? datasetInfo.id;
    const path = eventInfo.path ?? datasetInfo.path;
    const subtitle = eventInfo.subtitle ?? datasetInfo.subtitle;
    const stfontSize = eventInfo.stfontSize ?? datasetInfo.stfontSize;
    const name = eventInfo.name ?? datasetInfo.name;
    const bgcolor = eventInfo.bgcolor ?? datasetInfo.bgcolor;
    const externalPath = eventInfo.externalPath ?? datasetInfo.externalPath;
    const miniProgramConfig = {
      'wxcdd55b1d2e790195': { needToken: true },
      'wxf2c0e435976f0ca6': { needToken: false }
    };
    if (this.isMiniProgramAppid(path) && miniProgramConfig[path]) {
      const { needToken } = miniProgramConfig[path];
      const extraData = needToken ? { token: getApp()?.data?.userInfo?.token } : {};
      this.navigateToOtherMiniProgram(path, externalPath, extraData);
      return;
    }
    getApp().data.funAreaId = menuId;
    const isDeskPath = path.includes('desk');

    if (isDeskPath) {
      wx.switchTab({ url: path });
    } else {
      wx.navigateTo({
        url: `${path}?bgcolor=${bgcolor}&name=${name}&subtitle=${subtitle}&stfontSize=${stfontSize}`
      });
    }
  },
  // 点击使用指南跳转
  handleUseJump(evt) {
    const info = evt?.currentTarget?.dataset?.info
    wx.navigateTo({
      url: `/${info?.bookPath}`,
    })
  },
  // 点击公告执行跳转
  handleNotice(evt) {
    const info = evt?.currentTarget?.dataset?.info
    if (info?.path) {
      wx.navigateTo({
        url: `/${info?.path}`,
      })
    }
  }
})