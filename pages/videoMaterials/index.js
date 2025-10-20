const {
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_promotionalApi,
  u_promotionalApiWxBooklist
} = require('../../utils/request/car')

const {
  byGet
} = require('../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_midMenulist,
} = require('../../utils/request/home')
const filter_sort = [
  { value: 'asc', name: '升序' },
  { value: 'desc', name: '降序' },
]
const filter_type = [
  { value: null, name: '全部' },
  { value: 1, name: '图片' },
  { value: 2, name: '视频' },
  { value: 3, name: '文档' },
  { value: 4, name: '其他' },
]
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    g_param: {},//筛选字段
    g_triggered: false, //下拉刷新状态
    pageType: 0,
    filter_industry: [],
    filter_aggregate: [{
      id: 1,
      name: '默认排序',
      btnRender: false,
      params: 'a',
      filter_work_status: filter_sort
    },
    {
      id: 2,
      name: '所有类型',
      btnRender: false,
      params: 'a',
      filter_work_status: filter_type
    },
    {
      id: 3,
      name: '所有行业',
      btnRender: false,
      params: 'a',
      filter_work_status: []
    },
    ],
  },

  // 查询行业数据
  initialQuickEntry() {
    const url = `${getApp().data.k1swUrl}${u_midMenulist.URL}`;
    const params = { terminalId: -1 };

    byGet(url, params)
      .then(response => {
        const content = response.data?.content || [];
        const info = content.map(({ id, name }) => ({ value: id, name }));
        const infoWithAll = [{ value: null, name: '全部' }, ...info];

        const { filter_aggregate } = this.data;
        if (Array.isArray(filter_aggregate) && filter_aggregate[2]) {
          const updatedFilterAggregate = [...filter_aggregate];
          updatedFilterAggregate[2] = {
            ...updatedFilterAggregate[2],
            filter_work_status: infoWithAll
          };

          this.setData({ filter_aggregate: updatedFilterAggregate, filter_industry: infoWithAll });
        }
      })
      .catch(err => {
        console.error('Failed to fetch quick entry data:', err);
      });
  },
  // 全屏背景图
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    },];
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
  bindPickerChange(evt) {
    const flag = evt?.currentTarget?.dataset?.id; // '1', '2', '3'
    const key = evt?.detail?.key; // 选中项的索引（或 key）

    const { g_param, filter_aggregate, filter_industry } = this.data;

    // 映射配置：id → 参数名 + 数据源
    const config = {
      '1': { targetKey: 'sort', sourceList: filter_sort },
      '2': { targetKey: 'fileType', sourceList: filter_type },
      '3': { targetKey: 'industry', sourceList: filter_industry }
    };

    const setting = config[flag];
    if (!setting) return;

    const { targetKey, sourceList } = setting;
    const selectedItem = sourceList?.[key];

    if (!selectedItem) return;

    // 1. 更新 g_param
    const newGParam = { ...g_param, [targetKey]: selectedItem.value };

    // 2. 更新 filter_aggregate 对应项的 name 为选中项的 name
    const newFilterAggregate = [...filter_aggregate];
    const index = newFilterAggregate.findIndex(item => item.id == flag); // 注意：id 是数字，flag 是字符串
    if (index !== -1) {
      newFilterAggregate[index] = {
        ...newFilterAggregate[index],
        name: selectedItem.name // 👈 关键：复用 name 字段
      };
    }

    // 3. setData 并刷新列表
    this.setData({
      g_param: newGParam,
      filter_aggregate: newFilterAggregate
    }, () => {
      this.initList();
    });
  },
  handleBlur(evt) {
    const inputValue = evt?.detail?.value ?? '';
    const { g_param } = this.data;
    this.setData({
      g_param: {
        ...g_param,
        name: inputValue
      }
    }, () => {
      this.initList();
    });
  },
  // 列表数据
  initList(evt) {
    console.log(this.data?.g_param)
    const param = {
      page: this.data.g_page,
      ...this.data.g_param
    };
    byGet(getApp().data.k1swUrl + (evt ? u_promotionalApiWxBooklist : u_promotionalApi).URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  // 触底请求
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.initList(this.data.pageType);
    });
  },
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList(this.data.pageType);
    });
  },
  /**
 * 根据链接后缀判断类型：图片、视频、文档 或 其他
 * @param {string} url - 链接地址
 * @returns {string} 返回类型：'image' | 'video' | 'document' | 'unknown'
 */
  getLinkTypeByExtension(url) {
    const match = url.match(/\.([a-zA-Z0-9]+)(\?|#|$)/);
    if (!match) return 'unknown';
    const ext = match[1].toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'flv', 'mkv'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'md', 'zip', 'rar'];

    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    if (documentExtensions.includes(ext)) return 'document';
    return 'unknown';
  },
  hadleCopyLink(evt) {
    const info = evt?.currentTarget?.dataset?.item
    wx.setClipboardData({
      data: `${info?.title} https://k3a.wiselink.net.cn/img/${encodeURI(info.filepath)}`,
      success: function () {
        wx.showToast({ title: '已复制到剪贴板', icon: 'none' },);
      },
      fail: function (err) {
        wx.showToast({ title: '复制失败', icon: 'none' });
        console.error('复制失败:', err);
      }
    });
  },
  hadleView(evt) {
    const path = `https://k3a.wiselink.net.cn/img/${evt?.currentTarget?.dataset?.item.filepath}`
    const info = this.getLinkTypeByExtension(path)
    wx.navigateTo({
      url: `/pages/agreementWebView/agreementWebView?url=${path}`,
    })
  },
  onLoad(options) {
    this.setData({
      pageType: options?.type
    }, () => {
      this.initList(options?.type)
    })

  },
  onShow() {
    this.initialiImageBaseConversion()
    this.initialQuickEntry()
  },
  onReady() {

  },
  onShareAppMessage(evt) {
    const info = `https://k3a.wiselink.net.cn/img/${encodeURI(evt?.target?.dataset?.item?.filepath)}`
    return {
      title: evt?.target?.dataset?.item?.title,
      path: `/pages/agreementWebView/agreementWebView?url=${info}`,
      imageUrl: info
    }
  }
})