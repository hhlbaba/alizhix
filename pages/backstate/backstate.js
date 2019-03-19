Page({
  data: {
    caseid : '',   
    baseurl:'',
    showmsg : '',
  },
  onLoad(res) {
    const app = getApp();
    this.setData({
      caseid : res.id,
      baseurl : app.globalData.baseurl
    });
    this.getcasemsg()
  },
  getcasemsg(){
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl+'/api/order/directSelling/refundProgress', // 目标服务器url
      headers:{'Authorization':my.getStorageSync({key: 'token'}).data},
      data:{'orderId':this.data.caseid},
      success: (res) => {
        if(res.data.code==0){
          _self.setData({
            showmsg : res.data.data
          })
        }
      },
    });
  },
  
});
