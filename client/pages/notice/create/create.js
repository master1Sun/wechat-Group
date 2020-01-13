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
    noticeid: '',
    date: '',
    fileNumber: '000',
    title: '',
    description: '',
    name: '',
    year: '',
  },
  onLoad: function() {
    this.islogin()
    this.setData({
      date: utils.year + '年' + utils.month + '月' + utils.date + '日',
      year: utils.year,
      name: app.globalData.userInfo.nickName
    })
    api.notice_task_count({
      success: res => {
        let count = Number(res.result.total) + 1
        this.setData({
          fileNumber: '0' + count,
        });
      }
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
              url: '../index/index',
            })
          }
        })
      },
      fail() {
        app.globalData.islogin = true
        wx.switchTab({
          url: '../index/index',
        })
      }
    })
  },
  bindTitleInput: function(e) {
    this.setData({
      title: e.detail.value,
    });
  },
  bindDescribeInput: function(e) {
    this.setData({
      description: e.detail.value,
    });
  },
  bindFileNumberInput: function(e) {
    this.setData({
      fileNumber: e.detail.value,
    });
  },
  bindNameInput: function(e) {
    this.setData({
      name: e.detail.value,
    });
  },
  ok: function() {
    var that = this;
    if (that.data.title == '') {
      wx.showModal({
        title: '警告!',
        content: '通知标题必需填写',
        confirmColor: "#5677FC",
        showCancel: false
      })
    } else if (that.data.description == '') {
      wx.showModal({
        title: '警告!',
        content: '通知内容必需填写',
        confirmColor: "#5677FC",
        showCancel: false
      })
    } else if (that.data.name == '') {
      wx.showModal({
        title: '警告!',
        content: '署名必需填写',
        confirmColor: "#5677FC",
        showCancel: false
      })
    } else {
      wx.showLoading({
        title: '创建中...',
      })
      that.setData({
        noticeid: new Date().getTime().toString() + parseInt(Math.random() * 10000000) //创建时间+随机数
      })
      api.createNoticeTask({
        data: {
          noticeid: that.data.noticeid,
          title: that.data.title,
          description: that.data.description,
          date: that.data.date,
          fileNumber: that.data.fileNumber,
          name: that.data.name
        },
        success: function(res) {
          wx.hideLoading();
          wx.redirectTo({
            url: '../noticeDetail/noticeDetail?noticeid=' + that.data.noticeid + '&isbool=false'
          })
        }
      })

    }
  }
})