Component({
  properties: {
    range: {
      type: Object,
      value: {}
    },
    filter: {
      type: String,
      value: '所有'
    }
  },


  data: {
    btnRender: false
  },

  methods: {
    updateBtnRenderState(state) {
      this.setData({
        btnRender: state
      })
    },

    handleChange(evt) {
      this.triggerEvent('Transmit', {
        key: evt.detail.value
      })
      this.updateBtnRenderState(false)
    },
    handleTap() {
      this.updateBtnRenderState(true)
    },
    handleBindCancel() {
      this.updateBtnRenderState(false)
    }
  }
})



// 示例
// JS
// data参数：
// filter_aggregate: [{
//   id: 1,
//   name: '所有状态',
//   btnRender: false,
//   params: 'a',
//   filter_work_status: filterWorkStatus
// }
// ],

// JavaScript
// bindPickerChange(e) {
//   const filterAggregate = this.data.filter_aggregate;
//   const {
//     id: targetId
//   } = e.currentTarget.dataset;
//   const {
//     key: selectedKey
//   } = e.detail;
//   const targetIndex = filterAggregate.findIndex(item => item.id === targetId);
//   if (targetIndex === -1) {
//     return;
//   }
//   const targetItem = {
//     ...filterAggregate[targetIndex]
//   };
//   const statusOptions = targetItem.filter_work_status || [];
//   if (selectedKey >= statusOptions.length) {
//     return;
//   }
//   const selectedStatus = statusOptions[selectedKey] || {};
//   const dynamicParams = {
//     [selectedStatus.params || targetItem.params]: selectedStatus.value ?? targetItem.value
//   };
//   const updatedAggregate = filterAggregate.map((item, index) =>
//     index === targetIndex ? {
//       ...item,
//       name: selectedStatus.name || item.name
//     } : item
//   );
//   this.setData({
//     filter_aggregate: updatedAggregate,
//     ...dynamicParams
//   }, () => {
//     this.getCarList();
//   });
// },
// WXML
/* <view class="search-drop">
<block wx:for="{{filter_aggregate}}" wx:key="index">
  <drop-filter-com data-id="{{item.id}}" range="{{item.filter_work_status}}" filter="{{item.name}}" bindTransmit="bindPickerChange" />
</block>
</view> */

// JSON
// "usingComponents": {
//   "drop-filter-com": "/components/DropFilterCom/index"
// },