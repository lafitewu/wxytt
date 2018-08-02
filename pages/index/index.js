//index.js
//获取应用实例
const app = getApp()
var utilMd5 = require('../../utils/md5.js')
var zhmd5 = require('../../utils/zhmd5.js')

Page({
  data: {
    secret: '2de0b85430a4e5fe32a39f6f28097e7d',
    appid: 'wx8c334da29b35b92e',
    goldTime: '',
    time: '',
    hideName: true,
    userInfo: {},
    input_val: '',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    targetId: true,
    openId: '',
    unionId: '',
    successfn: true,
    hostname: '',
    desc: '',
    Jumpurl: ''
  },
  //事件处理函数
  footerFn() {
    this.setData({
      hideName: false
    })
  },
  closeFn() {
    this.setData({
      hideName: true
    })
  },
  onShow() {
    var _self = this;
    var ts = Date.parse(new Date()),
      md5str2 = "wxminiid=" + _self.data.appid + "&time=" + times,
      Sign = zhmd5.md5(md5str2 + key);
    // 动态配置api地址
    wx.request({
      url: 'https://ad.midongtech.com/api/ads/miniadconfig',
      method: 'POST',
      data: {
        wxminiid: _self.data.appid,
        time: times,
        sign: Sign
      },
      success: function (res) {
        console.log(res.data.data.baseurl);
        _self.setData({
          hostname: res.data.data.baseurl
        })
      }
    })
    // 获取用户体验时间
    var timeS = (Date.parse(new Date()) - this.data.time) / 1000;
    // 判断是否有目标时间
    if (_self.data.goldTime != 0) {
      if (timeS - this.data.goldTime > 0) {
        console.log(timeS);

        var times = Date.parse(new Date()),
          key = "ce3e7c8d567106cd",
          md5str = "openid=" + _self.data.openId + "&code=" + _self.data.input_val + "&time=" + times,
          sign = zhmd5.md5(md5str + key);
        // 奖励接口
        wx.request({
          url: _self.data.hostname + '/api/ads/miniok',
          method: 'post',
          data: {
            unionid: _self.data.unionId,
            openid: _self.data.openId,
            code: _self.data.input_val,
            time: times,
            sign: sign
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            _self.setData({
              input_val: '',
              hideName: true
            })
            console.log("奖励请求成功" + res.data);
            // 判断请求返回值
            if (res.data.code == 1) {
              wx.showToast({
                title: '奖励领取成功！',
                icon: 'success',
                duration: 2000
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail: function (res) {
            _self.setData({
              input_val: '',
              hideName: true
            })
          }
        });
      } else {
        _self.setData({
          input_val: '',
          hideName: true,
          goldTime: ''
        })
        var Toast = _self.data.desc;
        wx.showToast({
          title: Toast,
          icon: 'none',
          duration: 4000
        })
      }
    }
  },
  CinputFn(e) {
    this.setData({
      input_val: e.detail.value
    })
  },
  commitFn() {
    var _self = this;
    // 判断输入框值
    if (this.data.input_val == "") {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none',
        duration: 2000
      });
    } else {
      var times = Date.parse(new Date()),
        key = "ce3e7c8d567106cd",
        md5str = "openid=" + _self.data.openId + "&code=" + _self.data.input_val + "&time=" + times,
        sign = zhmd5.md5(md5str + key);
      // 判断输入框值
      wx.request({
        url: _self.data.hostname + '/api/ads/codecheck',
        method: 'post',
        data: {
          unionid: _self.data.unionId,
          openid: _self.data.openId,
          code: _self.data.input_val,
          time: times,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          if (res.data.code == 1 && res.data.data.wxid != "") {
            var AppID = res.data.data.wxid;
            var Duration = res.data.data.duration;
            var jumpurl = res.data.data.jumpurl;
            _self.setData({
              desc: res.data.data.guide,
              Jumpurl: jumpurl
            })
            wx.showToast({
              title: '加载中',
              icon: 'loading',
              duration: 500
            });
            var ContentToast = res.data.data.guide;
            setTimeout(function () {
              console.log(AppID);
              console.log(jumpurl);
              wx.showModal({
                title: '温馨提示',
                content: ContentToast,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateToMiniProgram({
                      appId: AppID,
                      path: jumpurl,
                      extraData: {},
                      envVersion: 'release',
                      success(res) {
                        // 打开成功
                        wx.request({
                          url: _self.data.hostname + '/api/ads/minijump',
                          method: 'post',
                          data: {
                            unionid: _self.data.unionId,
                            openid: _self.data.openId,
                            code: _self.data.input_val,
                            jumpurl: _self.data.Jumpurl,
                            jumpresult: '1',
                            time: times,
                            sign: sign
                          },
                          header: {
                            'content-type': 'application/json'
                          },
                          success: function (res) {
                            console.log(res);
                            console.log("程序跳转成功！");
                          }
                        });
                        _self.setData({
                          goldTime: Duration,
                          time: Date.parse(new Date())
                        });
                      },
                      fail: function (res) {
                        wx.request({
                          url: _self.data.hostname + '/api/ads/minijump',
                          method: 'post',
                          data: {
                            unionid: _self.data.unionId,
                            openid: _self.data.openId,
                            code: _self.data.input_val,
                            jumpurl: _self.data.Jumpurl,
                            jumpresult: '0',
                            time: times,
                            sign: sign
                          },
                          header: {
                            'content-type': 'application/json'
                          },
                          success: function (res) {
                            console.log("程序跳转失败！");
                          }
                        });
                        wx.showModal({
                          title: '提示',
                          content: "微信ID错误，请重新配置！",
                          success: function (res) {
                            // 确认键
                            if (res.confirm) {
                              _self.setData({
                                hideName: true,
                                input_val: ''
                              })
                              // 取消键
                            } else if (res.cancel) {
                              _self.setData({
                                hideName: true,
                                input_val: ''
                              })
                            }
                          }
                        })
                      }
                    });
                  } else if (res.cancel) {
                    _self.setData({
                      hideName: true,
                      input_val: ''
                    })
                  }
                }
              })

            }, 600);
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              success: function (res) {
                if (res.confirm) {
                  _self.setData({
                    hideName: true,
                    input_val: ''
                  })
                } else if (res.cancel) {
                  _self.setData({
                    hideName: true,
                    input_val: ''
                  })
                }
              }
            })
          }
        }
      })
    }
  },
  getUserInfo: function (e) {
    var _self = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          var l = _self.data.hostname + '/api/ads/jscode2session?appid=' + _self.data.appid + '&secret=' + _self.data.secret + '&js_code=' + res.code + '&grant_type=authorizationCode';
          wx.request({
            url: l,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
            success: function (res) {
              _self.setData({
                openId: res.data.openid,
                unionId: res.data.unionid
              })
              e.detail.userInfo.openId = _self.data.openId;
              e.detail.userInfo.unionId = _self.data.unionId;

              var Str = JSON.stringify(e.detail.userInfo);
              var times = Date.parse(new Date()),
                key = "ce3e7c8d567106cd",
                md5str = "wxminiid=" + _self.data.appid + "&userinfo=" + Str + "&time=" + times;
              var sign = zhmd5.md5(md5str + key);
              if (e.detail.errMsg == "getUserInfo:ok") {
                _self.setData({
                  hideName: false
                });
                // 保存用户信息
                wx.request({
                  url: _self.data.hostname + '/api/ads/miniadusersave',
                  method: 'post',//仅为示例，并非真实的接口地址
                  data: {
                    wxminiid: _self.data.appid,
                    userinfo: Str,
                    time: times,
                    sign: sign
                  },
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    console.log(res.data);
                    console.log("miniadusersave接口请求成功");
                  }
                })
              }
            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
})
