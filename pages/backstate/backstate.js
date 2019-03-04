Page({
  data: {
    caseid : '',   
    baseurl:'',
    showmsg : '',
  },
  onLoad(res) {
    console.log(res)
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
      url: this.data.baseurl+'/api/order/directSelling/orderDetail', // 目标服务器url
      headers:{'Authorization':my.getStorageSync({key: 'token'}).data},
      method:'get',
      data:{'orderId':this.data.caseid},
      success: (res) => {
        console.log(res)
        if(res.data.code==0){
          res.data.data.touristInfo = JSON.parse(res.data.data.touristInfo)
          _self.setData({
            showmsg : res.data.data
          })
        }
      },
    });
  },
  
});
