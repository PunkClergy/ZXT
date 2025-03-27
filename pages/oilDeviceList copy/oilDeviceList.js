// index.js
Page({
  data: {
    filterItems: [{
        type: 'category',
        label: '所有类型',
        value: '',
        active: false
      },
      {
        type: 'status',
        label: '所有状态',
        value: '',
        active: false
      },
      {
        type: 'time',
        label: '所有时间',
        value: '',
        active: false
      },
      {
        type: 'date',
        icon: '/assets/images/home/date.png',
        active: false
      }
    ],
    showPicker: false,
    selectedValue: '', // 选中的值
    pickerIndex: [0], // 当前选中索引
    pickerType: '',
    pickerData: [ // 单列数据
    ]
  },

  // 显示选择器
  handleFilterPicker(e) {
    const type = e.currentTarget.dataset.type;
    const typeMapping = {
      'category': [{
        key: '122',
        value: 'Category A'
      }],
      'status': [{
        key: '122',
        value: 'status A'
      }],
      'time': [{
        key: '122',
        value: 'time A'
      }],
      'date': [{
        key: '122',
        value: 'date A'
      }]
    };
    if (type in typeMapping) {
      this.setData({
        pickerType: type,
        pickerData: typeMapping[type],
        showPicker: true
      });
      return;
    }
  },

  // 隐藏选择器
  hidePicker() {
    this.setData({
      showPicker: false
    })
  },

  // 选择变化事件
  bindPickerChange(e) {
    const index = e.detail.value[0]
    this.setData({
      pickerIndex: [index],
      selectedValue: this.data.pickerData[index]
    })
  },

  // 确认选择
  handleConfirm() {
    this.hidePicker()
    console.log('当前选中：', this.data.selectedValue)
    // 这里可以执行确认后的业务逻辑
  }
})