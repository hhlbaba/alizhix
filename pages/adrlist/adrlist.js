var wxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    thispage: 1,  //当前页
    winSwiperindex: 1,  //swiper弹窗当前页
    msgicon: [
      { 'name': '当天8：00前预订' },
      { 'name': '不可退' },
      { 'name': '下单1小时后入园' },
    ],
    tickid: '',  //门票id
    baseurl: '',  //
    ticket: '',  //门票信息
    kefunum: '',   //客服手机号
    supplierId: '',
    qrbol: false,  //qrcode 展示
    qrimg: '',   //二维码链接
    sdata: '',
    dailyStock: 0,  //总库存
    minBookNum: 0,  //最少订
  },
  onLoad(options) {
    const app = getApp();
    this.setData({
      tickid: options.id,
      baseurl: app.globalData.baseurl,
      supplierId: app.globalData.supplierId
    })
    this.gettickmsg(options.id);
    this.getdata();
  },
  getdata() {
    let url = this.data.baseurl + '/api/product/ticketMobile/directSellingTicketInfo';
    let data = {
      ticketId: this.data.tickid
    };
    my.httpRequest({
      url: url,
      data: data,
      success: (res) => {
        this.setData({
          sdata: res.data.data
        })
      }
    })
  },
  closebol() {
    this.setData({
      qrbol: false
    })
  },
  openmodel(res) {
    this.setData({
      qrimg: res.target.dataset.src,
      qrbol: true
    })
  },
  gettickmsg() {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/product/ticketMobile/directTicketDetail',
      data: { 'ticketId': this.data.tickid },
      success: (res) => {
        if (res.data.code == 0) {
          var omsg = res.data.data;
          omsg.images = JSON.parse(omsg.images)
          var article = omsg.feeIncludes;
          var nofee = omsg.feeNotIncludes;
          var joinway = omsg.reachWay;
          var refundNote = omsg.refundNote;
          var bookNote = omsg.bookNote;
          wxParse.wxParse('article', 'html', article, _self, 0);
          wxParse.wxParse('nofee', 'html', nofee, _self, 0);
          wxParse.wxParse('joinway', 'html', joinway, _self, 0);
          wxParse.wxParse('refundNote', 'html', refundNote, _self, 0);
          wxParse.wxParse('bookNote', 'html', bookNote, _self, 0);
          _self.setData({
            ticket: omsg
          })
          if (_self.data.kefunum == '') {
            _self.setData({
              kefunum: res.data.data.phone
            })
          }
        }
      },
    });
  },
  thisindex(e) {
    this.setData({
      thispage: e.detail.current + 1
    })
  },
  winSwiper(e) {
    this.setData({
      winSwiperindex: e.detail.current + 1
    })
  },
  buy() {
    if (this.data.ticket.dailyStock > this.data.ticket.minBookNum || this.data.ticket.dailyStock === -1) {
      var that = this;
      var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key

      if (openid) {
        this.jumpto();
      } else {
        my.getAuthCode({   //首次打开用户授权获取authCode
          scopes: 'auth_base',
          success: (res) => {
            my.httpRequest({
              url: this.data.baseurl + '/api/order/directSelling/getUserId', // 目标服务器url
              data: { authCode: res.authCode, merchantId: this.data.supplierId },
              success: (res2) => {
                if (res2.data.code == 0) {
                  my.setStorageSync({
                    key: 'userid',
                    data: res2.data.data
                  })
                  that.jumpto();
                }
              },
            });
          }
        })
      }
    }
    else {
      my.showToast({
        content: '库存不足，无法下单',
        duration: 2000,
      });
    }
  },
  jumpto() {
    //判断是否绑定手机号
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    var that = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/user/DSUser/getUserInfo',
      data: { wxopenid: openid },
      success: (res2) => {
        if (res2.data.code === -2) {
          my.navigateTo({
            url: '../login/login'
          })
        }
        else {
          my.httpRequest({
            url: this.data.baseurl + '/api/product/ticketMobile/getStatusByTicketId',
            data: { ticketId: this.data.tickid },
            success: (data) => {
              if (data.data.code == 0 && data.data.data == 1) {
                my.navigateTo({
                  url: '../addorder/addorder?tickid=' + that.data.tickid
                });
              }
            }
          })
        }
      },
    });
  },
  // getuserinfo() {
  //   var _self = this;
  //   my.getAuthCode({   //首次打开用户授权获取authCode
  //     scopes: 'auth_user',
  //     success: (res) => {
  //       my.setStorageSync({
  //         key: 'authcode',
  //         data: res.authCode,
  //       });
  //       my.getAuthUserInfo({    //获取头像和名字
  //         success: (userInfo) => {
  //           my.setStorageSync({
  //             key: 'nickName',
  //             data: userInfo.nickName,
  //           });
  //           my.setStorageSync({
  //             key: 'avatar',
  //             data: userInfo.avatar,
  //           });
  //           this.setData({
  //             username: my.getStorageSync({
  //               key: userInfo.nickName, // 缓存数据的key
  //             }).data,
  //             userpic: my.getStorageSync({
  //               key: userInfo.avatar
  //             }).data
  //           })
  //         },
  //         fail(res) {
  //           console.log(res)
  //         }
  //       });
  //     },
  //     fail: (res) => {
  //       _self.getuserinfo()
  //     }
  //   });
  // },
  call() {   //联系客服按钮
    my.makePhoneCall({ number: this.data.kefunum });
  }
});
