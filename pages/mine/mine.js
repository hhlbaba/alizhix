Page({
  data: {
    username: '',
    userpic: '',
    kefunum: '',
    baseurl: '',
    supplierId: ''
  },
  onShow() {
  },
  onLoad() {
    const app = getApp();
    //app.islogin();
    if (!my.getStorageSync({ key: 'nickName', }).data || !my.getStorageSync({ key: 'avatar' }).data) {
      this.getuserinfo()
    } else {
      this.setData({
        username: my.getStorageSync({
          key: 'nickName', // 缓存数据的key
        }).data,
        userpic: my.getStorageSync({
          key: 'avatar'
        }).data,
      })
    }
    this.setData({
      baseurl: app.globalData.baseurl,
      supplierId: app.globalData.supplierId
    })
    this.getshopphone()
  },
  getshopphone() {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/product/ticketMobile/getPhoneBuySupplierId',
      data: {
        supplierId: this.data.supplierId,
        shopType: 'ZFBXCX'
      },
      success: (res) => {
        if (res.data.code == 0) {
          _self.setData({
            kefunum: res.data.data
          })
        }
      }
    });
  },
  callkefu() {
    my.makePhoneCall({ number: this.data.kefunum });
  },
  orderlist(obj) {
    var that = this;
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key

    if (openid) {
      this.jumpto(obj.target.dataset.state);
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
                that.jumpto(obj.target.dataset.state);
              }
            },
          });
        }
      })
    }
  },

  jumpto(state) {
    //判断是否绑定手机号
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    var that = this;
    my.httpRequest({
      url: that.data.baseurl + '/api/user/DSUser/getUserInfo',
      data: { wxopenid: openid },
      success: (res2) => {
        if (res2.data.code === -2) {
          my.navigateTo({
            url: '../login/login'
          })
        }
        else {
          my.navigateTo({
            url: '../mycase/mycase?state=' + state
          });
        }
      },
    });
  },

  getuserinfo() {
    var _self = this;
    my.getAuthCode({   //首次打开用户授权获取authCode
      scopes: 'auth_user',
      success: (res) => {
        my.setStorageSync({
          key: 'authcode',
          data: res.authCode,
        });
        my.getAuthUserInfo({    //获取头像和名字
          success: (userInfo) => {
            my.setStorageSync({
              key: 'nickName',
              data: userInfo.nickName,
            });
            my.setStorageSync({
              key: 'avatar',
              data: userInfo.avatar,
            });
            this.setData({
              userpic: userInfo.avatar
            })
          }
        });
      },
      fail: () => {
        _self.getuserinfo()
      }
    });
  },
});
