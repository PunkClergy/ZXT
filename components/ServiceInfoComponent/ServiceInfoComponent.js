const appUtil = require('../../utils/app-util');
const urlUtil = require('../../utils/url-util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Array,
      value: []
    },
    item: {
      type: Number,
      value: 0
    }

  },
  /**
   * 组件的初始数据
   */
  data: {
    collectionOfLocationInformationTypes: [
      '手动输入详细位置', '选择地图位置', '选择当前车辆GPS位置', '选择车务宝热点位置', '选择已租车位位置', '选择内部网点位置'
    ],
    form: {},
    carParkingList: [],
    carHotspotList: [],
    rentedCarParklotList: []
  },

  lifetimes: {
    attached: function () {
      this.initializePickerValue();
      this.initialiMapTypePickerValue()
    },

  },

  methods: {
    initializePickerValue: function () {
      const items = this.properties.info;
      const updateData = items.reduce((acc, ele) => {
        if (ele.type === 'address') {
          acc[ele.name + 'type'] = 0;
        }
        return acc;
      }, {});
      this.setData({
        id: this.properties.item,
        updateData: updateData
      });
    },
    initialiMapTypePickerValue() {
      const _this = this;
      const k1swUrl = getApp().data.k1swUrl;
      const requestConfigs = [{
          url: urlUtil.carParkingList.URL,
          key: 'carParkingList'
        },
        {
          url: urlUtil.carHotspotList.URL,
          key: 'carHotspotList'
        },
        {
          url: urlUtil.rentedCarParklotList.URL,
          key: 'rentedCarParklotList'
        }
      ];
      requestConfigs.forEach(config => {
        appUtil.byGet(k1swUrl + config.url, {}, function (res) {
          if (res.data && res.data.content) {
            _this.setData({
              [config.key]: res.data.content
            });
          }
        });
      });
    },
    initCombineDateAndTimeKeys(obj) {
      const result = {};
      const keys = Object.keys(obj);

      for (let key of keys) {
        if (key.endsWith('date')) {
          const baseKey = key.slice(0, -4);
          const dateValue = obj[key];

          const timeKey = baseKey + 'time';
          if (keys.includes(timeKey) && obj.hasOwnProperty(timeKey)) {
            const timeValue = obj[timeKey];
            result[baseKey] = dateValue + ' ' + timeValue;
          }
        }
      }

      return result;
    },
    getFormData() {
      console.log(this.data.updateData, this.data.form)
      console.log(this.initCombineDateAndTimeKeys(this.data.updateData))
      const dateSet = this.initCombineDateAndTimeKeys(this.data.updateData)
      const temp = {
        ...this.data.updateData,
        ...dateSet
      }
      return temp
    },
    bindPickerChange: function (e) {
      const {
        name
      } = e.currentTarget.dataset.item;
      const selectedValue = e.detail.value;
      const dynamicPropertyName = name + 'type';
      this.setData({
        updateData: {
          ...this.data.updateData,
          [dynamicPropertyName]: selectedValue
        }
      });
    },
    handleJumpToMap(e) {
      wx.navigateTo({
        url: '/pages/mapSelection/map?id=' + this.data.id + '&name=' + e.currentTarget.dataset.item.name
      })
    },
    refresh() {
      const _this = this
      wx.getStorage({
        key: this.data.item,
        success: function (res) {
          const respons = res.data
          let temp = {
            form: respons,
            updateData: {
              ...respons,
              ..._this.data.updateData
            }

          }
          _this.setData({
            ...temp
          });
        }
      });


    },
    handleStorageUpdate(context, e, type) {
      const cacheKey = context.data.id;
      const previousName = e.currentTarget.dataset.item.name;
      const selectedValue = e.detail.value;

      let keySuffix = '';
      let finalValue = selectedValue;
      if (type === 'time') {
        keySuffix = 'time';
        wx.getStorage({
          key: cacheKey,
          success: (res) => {
            finalValue = `${res.data[previousName] || ''} ${selectedValue}`;
          }
        });
      } else if (type === 'date') {
        keySuffix = type || 'date';
      }

      wx.getStorage({
        key: cacheKey,
        success: (res) => updateObjectAndSave(context, res.data || {}, previousName, finalValue),
        fail: () => updateObjectAndSave(context, {}, previousName, finalValue)
      });

      function updateObjectAndSave(context, obj, name, value) {
        obj[name] = value;
        wx.setStorage({
          key: cacheKey,
          data: obj,
          success: () => {
            const key = name + keySuffix;
            context.setData({
              updateData: {
                ...context.data.updateData,
                [key]: type === 'time' ? selectedValue : value
              }
            });
          }
        });
      }
    },
    handleDateChange(e) {
      this.handleStorageUpdate(this, e, 'date');
    },
    handleTimeChange(e) {
      this.handleStorageUpdate(this, e, 'time');
    },
    handleBlur(e) {
      this.handleStorageUpdate(this, e);
      this.setData({
        form: {
          ...this.data.form,
          [e.currentTarget.dataset.item.name]: e.detail.value
        }
      })
    },
    handleBlurMap(e) {
      this.handleStorageUpdate(this, e);
    },
    handleCarParkingListChange(e) {
      const name = e.currentTarget.dataset.item.name
      this.handleStorageUpdate(this, e);
      this.setData({
        updateData: {
          ...this.data.updateData,
          [name]: e.detail.value
        }
      });
    },
  }
})