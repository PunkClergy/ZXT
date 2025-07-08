// page.js
Page({
  onLoad(options) {
    if(options?.souce){
      this.setData({
        pdfUrl: options?.souce
      })
    } 
  }
})