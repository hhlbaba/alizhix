Page({
  data: {
    array: ['请选择退款原因', '行程取消', '门票预订错误', '未收到取票确认号', '景区无入园信息', '价格不优惠', '景区无法入园，景区爆满/闭园', '其他'],
    index: 0,
    showmsg: '',  //退款信息
    baseurl: '',
  },
  onLoad(res) {
    const app = getApp();
    this.setData({
      showmsg: res,
      baseurl: app.globalData.baseurl
    })
  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value,
    });
  },
  postback() {
    if (this.data.index == 0) {
      my.alert({
        title: '提示',
        content: '请选择退款原因',
        buttonText: '我知道了'
      });
    } else {
      var that = this;
      my.httpRequest({
        url: this.data.baseurl + '/api/order/direct/order/applyRefund', // 目标服务器url
        data: { 'orderId': this.data.showmsg.id, 'reason': this.data.array[this.data.index], 'refundNum': this.data.showmsg.num },
        method: 'post',
        headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data, 'content-type': 'application/json;charset=UTF-8' },
        success: (res) => {
          if (res.data.code == 0) {
            my.alert({
              title: '退款结果',
              content: '申请成功，请等待退款结果',
              buttonText: '我知道了',
              success: () => {
                my.navigateTo({
                  url: '../order/order?orderid=' + that.data.showmsg.id
                });
              },
            })
          } else {
            my.alert({
              title: '退款失败',
              content: '该订单已退款或无法退款',
              buttonText: '我知道了',
              success: () => {
                my.navigateBack({
                  detail: 1
                })
              },
            })
          }
        },
      });
    }
  }
});
