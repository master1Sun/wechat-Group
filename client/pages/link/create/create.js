const api = require('../../../utils/apiCloud.js');
var utils = (function() {
  var time = new Date()
  return {
    year: time.getFullYear(),
    month: time.getMonth() + 1,
    date: time.getDate(),
    hours: time.getHours(),
    minutes: time.getMinutes()
  }
})()
var app = getApp()
Page({
  data: {
    taskid: '', //接龙的id号
    title: '', //接龙标题
    date: '', //活动日期
    time: '', //活动时间
    address: '',
    name: '',
    tel: '',
    remark: '',
    peopleNumber: '', //活动人数
    noName: false, //是否公开参与活动人员
  },
  onLoad: function() {
    this.islogin()
    var that = this;
    that.setData({
      date: utils.year + '-' + ('0' + utils.month).substr(-2) + '-' + ('0' + utils.date).substr(-2),
      time: ('0' + utils.hours).substr(-2) + ':' + ('0' + utils.minutes).substr(-2)
    })
    wx.getUserInfo({
      success: (res) => {
        that.setData({
          name: res.userInfo.nickName
        })
      },
    })
  },
  islogin() {
    let that = this;
    wx.checkSession({
      success() {
        wx.getUserInfo({
          fail: () => {
            app.globalData.islogin = true
            wx.switchTab({
              url: '../../notice/index/index',
            })
          }
        })
      },
      fail() {
        app.globalData.islogin = true
        wx.switchTab({
          url: '../../notice/index/index',
        })
      }
    })
  },
  bindDateChange: function(e) {
    var that = this;
    that.setData({
      date: e.detail.value,
    })
  },
  bindTimeChange: function(e) {
    var that = this;
    that.setData({
      time: e.detail.value,
    })
  },
  bindTitleInput: function(e) {
    var that = this;
    that.setData({
      title: e.detail.value,
    });
  },
  bindAddressInput: function(e) {
    var that = this;
    that.setData({
      address: e.detail.value,
    });
  },
  bindNameInput: function(e) {
    var that = this;
    that.setData({
      name: e.detail.value,
    });
  },
  bindTelInput: function(e) {
    var that = this;
    that.setData({
      tel: e.detail.value,
    });
  },
  bindRemarkInput: function(e) {
    var that = this;
    that.setData({
      remark: e.detail.value,
    });
  },
  bindNumberInput: function(e) {
    var that = this;
    that.setData({
      peopleNumber: e.detail.value,
    });
  },
  switchChange: function(e) {
    var that = this;
    that.setData({
      noName: e.detail.value,
    })
  },
  getMap: function() {
    var that = this;
    var chooseAddress = function() {
      wx.chooseLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function(res) {
          var latitude = res.latitude
          var longitude = res.longitude
          that.setData({
            address: res.name + '(' + res.address + ')'
          })
        }
      })
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            fail() {
              wx.openSetting()
            }
          })
        } else {
          chooseAddress()
        }
      }
    })
  },
  ok: function() {
    var that = this;
    if (that.data.title == '') {
      wx.showModal({
        title: '警告!',
        content: '活动标题必需填写',
        confirmColor: "#5677FC",
        showCancel: false
      })
    } else {
      wx.showLoading({
        title: '创建中...',
      })
      that.setData({
        taskid: new Date().getTime().toString() + parseInt(Math.random() * 10000000) //创建时间+随机数
      })
      console.log('创建页面的openid为:' + app.globalData.openid)
      api.link_creatjielongtask({
        data: {
          taskid: that.data.taskid, //用创建的时间作为接龙的id号
          title: that.data.title, //接龙标题
          date: that.data.date, //活动日期
          time: that.data.time, //活动时间
          address: that.data.address,
          name: that.data.name,
          tel: that.data.tel,
          remark: that.data.remark,
          peopleNumber: that.data.peopleNumber || 0,
          noName: that.data.noName
        },
        success: function(res) {
          wx.hideLoading();
          wx.redirectTo({
            url: '../enroll/enroll?taskid=' + that.data.taskid + '&isbool=false'
          })
        }
      })
    }
  }
})