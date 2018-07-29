//index.js
//获取应用实例
const app = getApp()
var utilMd5 = require('../../utils/md5.js')

Page({
  data: {
    goldTime: '',
    time: '',
    datas: "sdsdssdssdsds",
    hideName: true,
    userInfo: {},
    input_val: '',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    targetId: true,
    openId: '',
    unionId: '',
    appID: '',
    successfn: true
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
  onShow(){
    var _self = this;
    var timeS = (Date.parse(new Date()) - this.data.time) / 1000;
    if (timeS - this.data.goldTime > 0 ) {
      console.log(timeS);

      var times = Date.parse(new Date()),
        key = "ce3e7c8d567106cd",
        md5str = "openid=" + _self.data.openId + "&code=" + _self.data.input_val + "&time=" + times,
        sign = utilMd5.hexMD5(md5str + key);
      wx.request({
        url: 'https://testad.midongtech.com/api/ads/miniok',
        method: 'post',//仅为示例，并非真实的接口地址
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
          // console.log("奖励请求成功");
          // console.log(res.data);
        },
        fail: function(res) {
          _self.setData({
            input_val: '',
            hideName: true
          })
        }
      });
    }else {
      _self.setData({
        input_val: '',
        hideName: true
      })
    }
  },
  CinputFn(e) {
    this.setData({
      input_val: e.detail.value
    })
  },
  commitFn() {
    var _self = this;
    if (this.data.input_val == "") {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none',
        duration: 2000
      });
    }else {
      var times = Date.parse(new Date()),
          key = "ce3e7c8d567106cd",
          md5str = "openid="+ _self.data.openId+"&code="+_self.data.input_val+"&time="+times,
          sign = utilMd5.hexMD5(md5str + key);
      wx.request({
        url: 'https://testad.midongtech.com/api/ads/codecheck',
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
          if (res.data.code == 1 ) {
            var AppID = res.data.data.wxid;
            _self.setData({
              goldTime: res.data.data.duration  
            })
            wx.showToast({
              title: '加载中',
              icon: 'loading',
              duration: 500
            });
            setTimeout(function(){
              wx.navigateToMiniProgram({
                appId: AppID,
                path: 'pages/index/index',
                extraData: {},
                envVersion: 'release',
                success(res) {
                  // 打开成功
                }
              });
              _self.setData({
                time: Date.parse(new Date())
              });
            },600);
          } else {
            // console.log(res.data.msg);
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
  getUserInfo: function(e) {
    var _self =this;
    wx.login({
      success: function (res) {
        if (res.code) {
          var l = 'https://testad.midongtech.com/api/ads/jscode2session?appid=wx8c334da29b35b92e&secret=2de0b85430a4e5fe32a39f6f28097e7d&js_code=' + res.code + '&grant_type=authorizationCode';
          wx.request({
            url: l,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
            // header: {}, // 设置请求的 header  
            success: function (res) {
              _self.setData({
                openId: res.data.openid,
                unionId: res.data.unionid
              })
              console.log(res.data.openid);
              // obj.openid = res.data.openid;
              // obj.unionid = res.data.unionid;
              // obj.expires_in = Date.now() + res.data.expires_in;
              //console.log(obj);
              // wx.setStorageSync('user', obj);//存储openid  
              // console.log(_self.data.openId);
              // _self.data.userInfro = e.detail.userInfo;
              e.detail.userInfo.openId = _self.data.openId;
              e.detail.userInfo.unionId = _self.data.unionId;
              
              var Str = JSON.stringify(e.detail.userInfo);
              var times = Date.parse(new Date()),
                key = "ce3e7c8d567106cd",
                md5str = "wxminiid=wx4a6e5569f8158947&userinfo=" + Str + "&time=" + times;
              console.log(Str);
              var sign = utilMd5.hexMD5(md5str + key);
              console.log(sign);
              if (e.detail.errMsg == "getUserInfo:ok") {
                _self.setData({
                  hideName: false
                });
                wx.request({
                  url: 'https://testad.midongtech.com/api/ads/miniadusersave',
                  method: 'post',//仅为示例，并非真实的接口地址
                  data: {
                    wxminiid: 'wx4a6e5569f8158947',
                    userinfo: Str,
                    time: times,
                    sign: sign
                  },
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    console.log(res.data);
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
    
      // https://testad.midongtech.com
    
    // app.globalData.userInfo = e.detail.userInfo
    // this.setData({
    //   hasUserInfo: true
    // })
  }
})
