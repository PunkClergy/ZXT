const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList,
  u_logo,
  u_getUserinfo,
  u_updateUserName
} = require('../../utils/request/home')
const {
  byGet,
  byPost,
  isLogin
} = require('../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
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
    s_quick_entrance_height: 90, //快捷入口高度 70为一行 140为两行 210为三行...
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
    logoSrc: '/assets/images/login/logo.png',
    c_send_key_show_momal: false,
    c_send_key_show_type: null,
    account: null,
    image_state: false,
    imageWidth: 0,
    imageHeight: 0
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
  handleJumpInfo(evt) {
    const path = evt?.currentTarget?.dataset?.item?.path
    wx.switchTab({
      url: path,
    })
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
    const url = `${this.data.c_link}${u_midMenulist.URL}`;
    const terminalId = e?.id || e?.currentTarget?.dataset?.item?.id;
    if (!terminalId) {
      return;
    }
    const params = { terminalId };
    byGet(url, params).then(response => {
      wx.getStorage({
        key: 'quickEntry',
        success: (res) => {
          var data = res.data.filter(item => !item.isHidden);
          process.call(this, data);
        },
        fail: () => {
          var data = response.data?.content;
          process.call(this, data);
        }
      });

      // 内联处理函数（避免重复）
      function process(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
          console.warn('No valid data to process');
          return;
        }

        const chunk = Array.from(
          { length: Math.ceil(rawData.length / 5) },
          (_, i) => rawData.slice(i * 5, i * 5 + 5)
        );

        const tabsBg = terminalId === '-1'
          ? this.data.s_client_bg
          : (terminalId == 222 ? this.data.s_channel_bg : this.data.s_service_bg);

        this.setData({
          g_before_passing_by_icon: chunk,
          termial_active: terminalId,
          g_quickIndex: 0,
          tabs_bg: tabsBg
        }, () => {
          const firstId = rawData[0]?.id;
          if (firstId) {
            this.handleGetMenuList({ id: firstId });
            this.handleRightSideData({ id: firstId });
          }
        });
      }
    }).catch(err => {
      console.error('Request failed:', err);
    });
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
    getApp().data.funAreaId = menuId
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
        sn_state: menuId == 540 ? true : false,
        menuId: menuId
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
    console.log(evt.detail.current)
    const currentIndex = evt.detail.current;
    const newData = {
      g_quickIndex: currentIndex,
      // s_quick_entrance_height: currentIndex === 1 ? 120 : 120 //此处为行高的设置
    };
    this.setData(newData);
  },
  // 跳转功能页面
  handleJumpPage: function (e) {
    const _this = this
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
    if (item.name == '退出登录') {
      wx.showModal({
        title: '提示',
        content: '确定要退出吗？',
        showCancel: true,
        cancelText: '取消',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            getApp().data.userInfo = '';
            try {
              wx.clearStorageSync();
            } catch (e) {
              wx.clearStorage();
            }
            _this.handleGetMenuList(_this?.data?.g_before_passing_by_icon?.[0][0])
            _this.setData({
              account: null
            })
          }
        }
      });
      return
    }
    if (item.name == '手机号登录增设账号登录') {
      console.log(getApp())
      _this.setData({
        mobie_info: getApp()?.data?.userInfo?.mobile,
        c_send_key_show_momal: true,
      })
      return
    }
    // 1、分享朋友 2、订单采购 3、群二维码 4、充值页面
    if (item.path === '/pages/redShare/index' || item.path === '/pages/orderList/orderList' || item.path === '/pages/groupQrCode/index' || item.path == '/pages/Shops/index') {
      wx.switchTab({
        url: item.path
      });
    } else {
      wx.navigateTo({
        url: item.path
      });
    }
  },
  // 确认修改用户名或密码
  handleFormSubmit(evt) {
    const _this = this
    const {
      name_1,
      name_3,
      name_4,
    } = evt?.detail.value


    if (name_1.length < 6) {
      showToast('账号长度不能小于6位')
      return
    }

    if (name_3.length < 6) {
      showToast('密码长度不能小于6位')
      return
    }
    if (name_3 != name_4) {
      showToast('密码两次输入不一致')
      return
    }
    const params = {
      [u_updateUserName.newUserName]: name_1,
      [u_updateUserName.newPassword]: name_3,
      [u_updateUserName.userId]: getApp().data.userInfo.id
    }
    byPost(getApp().data.k1swUrl + u_updateUserName.URL, params, (res) => {
      const data = res.data;
      if (data.code == 1000) {
        showToast('修改成功')
        _this.setData({
          c_send_key_show_momal: false,
          c_send_key_show_type: null
        })
      } else {
        wx.showToast({
          title: data?.msg,
          icon: 'none'
        })
      }
    });

  },
  // 取消修改用户名或密码
  handleHideSengKeyModal() {
    this.setData({
      c_send_key_show_momal: false,
      c_send_key_show_type: null
    })
  },
  // 右侧面板滑动方法
  handleBinddragstart(evt) {
    const scrollTop = Math.floor(evt.detail.scrollTop);
    this.setData({
      num: this.data.num + 1
    }, () => {
      if (scrollTop < 10) {
        this.setData({
          g_th_crrntly_slctd_tr_nd: this.sections[0]?.id.slice(7),
          num: 0
        });
        return;
      }
      const baseTop = scrollTop + (this.sections[0]?.top - 60);
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
        getApp().data.reflag = 0
        _this.initialQuickEntry({
          id: rspns[0].id
        })
      })

    }).catch((err) => {
      wx.getStorage({
        key: 'bluetoothData',
        success(res) {
          wx.redirectTo({
            url: '/pages/privateCar/indexUrgent',
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
    })
  },
  initLogo() {
    const _this = this
    byGet(_this.data.c_link + u_logo.URL, {}).then(response => {
      const rspns = response.data.content
      const {
        c_link
      } = this.data;
      const logoSrc = `${c_link}/img/${rspns.img}`;
      this.setData({
        logoSrc
      });
    })
  },
  onLoad: function (options) {
    wx.hideTabBar();
    this.initialGetBanner()
    this.handleTermialList()
    if (options?.scene || options?.query) {
      if ((options?.scene || options?.query).startsWith('blue_')) {
        console.log(options)
        wx.navigateTo({
          url: `/pages/privateCar/index?scene=${options?.scene || options?.query}`,
        })
        return
      }
      console.log(options?.scene || options?.query)
      this.setData({
        sn_state: true,
        sn_specific_value: options?.scene || options?.query
      }, () => {
        wx.setStorageSync('scene', options?.scene || options?.query);
      })
    }
  },
  triggerChildEvent() {
    // / 使用 this.selectComponent('#myChild') 来获取子组件实例
    const child = this.selectComponent('#myChild');
    if (child) {
      // 调用子组件的方法，并传递参数
      child.childMethod('来自父组件的消息');
    }
  },
  // 校验参数
  initialGetUserInfo() {
    console.log(getApp().data.k1swUrl)
    if (getApp().data.k1swUrl.length) {
      byGet(this.data.c_link + u_getUserinfo.URL, {}).then(response => {
        console.log(response)
        if (response.data.code == 1000) {
          wx.setStorageSync('userKey', response.data.content);
        } else {
          wx.clearStorageSync();
        }
      })
    }
  },
  handleLogin() {
    wx.navigateTo({
      url: '/pages/system/managerLoginView/loginView',
    })
  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },

  onShow: function (e) {
    this.hadleImage()
    if (getApp()?.data?.reflag == 1) {
      this.handleTermialList()
    }

    const _this = this
    wx.getStorage({
      key: 'userKey', // 替换为你的缓存键值
      success(res) {
        console.log("获取成功", res.data); // 成功时的数据
        _this.setData({
          account: res?.data?.realname || res?.data?.username
        })
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
      }
    });
    // 查询是否显示弹出
    wx.getStorage({
      key: 'image_state', // 替换为你的缓存键值
      success(res) {
        console.log("获取成功", res.data); // 成功时的数据
        if (!res?.data) {
          _this.setData({
            image_state: true
          })
        }
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
        _this.setData({
          image_state: true
        })
      }
    });

    // 暂时取消更新token
    this.initialGetUserInfo()
    this.initLogo()
    const scene = wx.getStorageSync('scene');
    this.setData({
      sn_specific_value: this.data.sn_specific_value || ''
    })
  },
  handleImageClose() {
    this.setData({
      image_state: false
    }, () => {
      wx.setStorageSync('image_state', true)
    })
  },
  hadleImage() {
    const imgUrl = 'https://k3a.wiselink.net.cn/img/video/createShortcuts.gif';
    // 使用 wx.getImageInfo 获取图片信息
    wx.getImageInfo({
      src: imgUrl,
      success: (res) => {
        const proportion = res?.width / 700;
        this.setData({
          imageWidth: res.width,
          imageHeight: res.height / proportion
        });
      },
      fail: (err) => {
        console.error('获取图片信息失败', err);
        this.setData({
          imageWidth: '加载失败',
          imageHeight: '加载失败'
        });
      }
    });
  },
  onUnload: function () {
    this.setData({
      sn_state_num: 0
    })
  }
})