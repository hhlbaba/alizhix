Page({
  data: {
    //baseurl:app.globalData.baseurl,
    yzmpic: '',
    baseurl: '',
    pagesign: '',  //页面唯一标识
    picyzm: '',  //图片验证码
    // iptpicyzm: '',   //  图形验证码
    phonenum: '',  //  电话号码
    yzm: '',   //动态码
    yzmable: false,   //yzm  able
    supplierId: '',
    btntxt: '获取动态码',
  },
  onLoad() {
    const app = getApp();
    this.setData({
      baseurl: app.globalData.baseurl,
      supplierId: app.globalData.supplierId
    })
    // this.getsign();
    this.getuserid();
  },
  onshow() { },
  // getsign() {
  //   var _self = this;
  //   my.httpRequest({
  //     url: this.data.baseurl + '/api/user/DSUser/signValue', // 目标服务器url
  //     success: function (res) {
  //       _self.getpicyzm(res.data)
  //       _self.setData({
  //         pagesign: res.data
  //       })
  //       my.setStorageSync({
  //         key: 'pagesign', // 缓存数据的key
  //         data: res.data, // 要缓存的数据
  //       });
  //     },
  //     fail(res) {
  //       _self.getpicyzm(res.data)
  //       _self.setData({
  //         pagesign: res.data
  //       })
  //       my.setStorageSync({
  //         key: 'pagesign', // 缓存数据的key
  //         data: res.data, // 要缓存的数据
  //       });
  //     }
  //   });
  // },
  getpicyzm(sign) {
    this.setData({
      picyzm: this.data.baseurl + '/api/user/DSUser/getCaptcha?signValue=' + sign
    })
  },
  postyzm() {
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    if (this.data.phonenum == '') {
      my.showToast({
        content: '请填写手机号码',
        duration: 2000,
      });
      return false;
    }
    if (!(/^1[23456789]\d{9}$/.test(this.data.phonenum))) {
      my.showToast({
        content: '请填写正确的手机号码',
        duration: 2000,
      });
      return false;
    }
    // if (this.data.iptpicyzm == '') {
    //   my.showToast({
    //     content: '验证码错误',
    //     duration: 2000,
    //   });
    //   return false;
    // }
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/user/DSUser/xcxSendVCode', // 目标服务器url    http://192.168.10.56:8765/api/user/DSUser/sendVCode?
      data: {
        // 'signValue': '', 
        'inputVal': '',
        'phoneNum': this.data.phonenum,
        'wxopenid': openid,
        'type': 3
      },
      success: function (res) {
        if (res.data.code == 0) {
          my.showToast({
            type: 'success',
            content: '发送成功',
            duration: 1500,
          });
          _self.setData({
            yzmable: true,
            btntxt: 60
          })
          var timers = setInterval(function () {
            if (_self.data.btntxt == 1) {
              clearInterval(timers)
              return false;
            } else {
              _self.setData({
                btntxt: _self.data.btntxt - 1
              })
            }
          }, 1000)
          setTimeout(function () {
            _self.setData({
              yzmable: false,
              btntxt: '获取动态码'
            })
          }, 60000)
        } else {
          my.showToast({
            type: 'fail',
            content: res.data.msg,
            duration: 1500,
          });
        }
      },
    });
  },
  // picyzm(val) {
  //   this.setData({
  //     iptpicyzm: val.detail.value
  //   })
  // },
  phonenum(val) {
    this.setData({
      phonenum: val.detail.value
    })
  },
  yzm(val) {
    this.setData({
      yzm: val.detail.value
    })
  },
  // changepicyzm() {
  //   this.getsign();
  // },
  getuserid() {
    my.getAuthCode({   //首次打开用户授权获取authCode
      scopes: 'auth_base',
      success: (res) => {
        my.httpRequest({
          url: this.data.baseurl + '/api/order/directSelling/getUserId', // 目标服务器url
          data: { authCode: res.authCode, merchantId: this.data.supplierId },
          success: (res) => {
            if (res.data.code == 0) {
              my.setStorageSync({
                key: 'userid',
                data: res.data.data
              })
            }
          },
        });
        my.setStorageSync({
          key: 'authcode',
          data: res.authCode,
        });
      }
    });
  },
  nextgo() {
    var _self = this;
    var userid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    if (this.data.phonenum !== '' && this.data.yzm !== '') {
      if (!(/^1[23456789]\d{9}$/.test(this.data.phonenum))) {
        my.showToast({
          content: '请填写正确的手机号码',
          duration: 2000,
        });
        return false;
      }
      my.httpRequest({
        url: this.data.baseurl + '/api/auth/jwt/directSellinglogin',
        method: 'post',
        headers: { 'content-type': 'application/json;charset=UTF-8' },
        data: {
          'phone': this.data.phonenum.toString(),
          'signValue': this.data.pagesign.toString(),
          'verifyCode': this.data.yzm.toString(),
          // 'verifyCodeImg': this.data.iptpicyzm.toString(), 
          'wxopenid': userid, 'type': 3
        },
        success(res) {
          if (res.data.code == 0) {
            my.setStorageSync({
              key: 'token',
              data: res.data.data
            });
            my.navigateBack({
              delta: 1
            })
            my.navigateTo({
              url: "../index/index"
            });
          } else {
            my.alert({
              title: '登录失败',
              content: res.data.msg,
              buttonText: '重新登录',
            });
          }
        }
      })
    } else {
      my.showToast({
        content: '动态码错误',
        duration: 2000,
      });
    }
  },
});
