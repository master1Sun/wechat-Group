const api = require('../../../utils/apiCloud.js');
var app = getApp()
var p = new Promise(function(resolve, reject) { //创建promise，确保页面加载数据前已经加载了openid!
  wx.login({
    success: function(res) {
      if (res.code) {
        api.getopenid({
          success: res => {
            app.globalData.openid = res.result.openid;
            resolve();
          }
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  });
})
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
Page({
  data: {
    voteid: '',
    taskData: '',
    optionData: '',
    uniqueClickState: '', //定义选择被选中的状态
    okWord: '', //当前用户是否投票
    shareHidden: true, //分享面板隐藏
  },
  onLoad: function(opt) {
    this.islogin()
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.hideShareMenu()
    this.setData({
      voteid: opt.voteid,
      okWord: '确 认 决 定'
    })
    if (opt.isbool == 'true') {
      if (app.globalData.enterGId && app.globalData.enterGId != '') {
        this.storeVoteGId(app.globalData.enterGId);
      }
    }
  },
  loadData() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    api.getVoteTask({
      data: {
        voteid: that.data.voteid,
      },
      success: function(res) {
        var data0 = res.result.data[0]
        var optionData0 = data0.optionData;
        var uniqueClickState = {};
        for (let i = 0; i < optionData0.length; i++) {
          let value = optionData0[i].unique
          uniqueClickState[value] = false;
        }
        that.setData({
          taskData: data0,
          optionData: data0.optionData,
          uniqueClickState: uniqueClickState,
        })
        if (app.globalData.openid) {
          that.istoupiaao(that)
        } else {
          p.then(function() {
            that.istoupiaao(that)
          })
        }
        wx.hideLoading();
      }
    })
  },
  islogin() {
    let that = this;
    wx.checkSession({
      success() {
        wx.getUserInfo({
          success: () => {
            that.loadData()
          },
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
  istoupiaao(that) {
    /************判断用户是否已投票可以遍历投票中是否含该用户的openid**********/
    var joinerData = that.data.optionData;
    for (var i = 0; i < joinerData.length; i++) {
      for (var j = 0; j < joinerData[i].joiner.length; j++) {
        if (joinerData[i].joiner[j][0] == app.globalData.openid) {
          that.setData({
            okWord: '已决定',
          })
          return false;
        }
      }
    }
  },
  storeVoteGId: function(gid) {
    var that = this;
    api.storeVoteGId({
      data: {
        groupid: gid,
        voteid: that.data.voteid,
      },
      success: function(res) {}
    })
  },
  onShareAppMessage: function(res) {
    var that = this;
    return {
      title: '我最怕选择了，大家来给我做个决定吧！！',
      path: '/pages/vote/choose/choose?voteid=' + that.data.voteid + '&isbool=true',
    }
  },
  voteOne: function(e) { //配置单选/多选的选择状态
    var that = this;
    if (that.data.okWord != '已决定' && that.data.taskData.radio == 0) { //未投票，且是单选
      var optionData0 = that.data.taskData.optionData; //每次重新获取uniqueClickState的状态
      var uniqueClickState = {};
      for (let i = 0; i < optionData0.length; i++) {
        let value = optionData0[i].unique
        uniqueClickState[value] = false;
      }
      uniqueClickState[e.currentTarget.dataset.unique] = !uniqueClickState[e.currentTarget.dataset.unique];
      that.setData({ //保存当前状态
        uniqueClickState: uniqueClickState,
      })
    } else if (that.data.okWord != '已决定' && that.data.taskData.radio == 1) {
      var uniqueClickState = that.data.uniqueClickState
      uniqueClickState[e.currentTarget.dataset.unique] = !uniqueClickState[e.currentTarget.dataset.unique];
      that.setData({ //保存当前状态
        uniqueClickState: uniqueClickState,
      })
    } else {
      wx.showToast({
        title: '您已决定过啦！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  ok: function() {
    var that = this;
    var hasSelected = false; //初始状态用户未选择选项
    for (var i = 0; i < that.data.optionData.length; i++) {
      if (that.data.uniqueClickState[that.data.optionData[i].unique]) { //若选项中存在true，则说明用户选了选项
        hasSelected = true;
        break;
      }
    }
    let date = utils.year + '-' + ('0' + utils.month).substr(-2) + '-' + ('0' + utils.date).substr(-2);
    if (date > that.data.taskData.date) {
      wx.showToast({
        title: '决定已过期！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (!hasSelected) { //判断当前用户是否选择了选项
      wx.showToast({
        title: '请勾选您的选项！',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.showLoading({
        title: '加载中...',
      })
      api.getVoteTask({
        data: {
          voteid: that.data.voteid,
        },
        success: function(res) {
          /****************获取最新的数据库数据，并将点击选项后的数据在本地更新******************/
          var data0 = res.result.data[0]
          var optionData0 = data0.optionData;

          var totalNumber = 0;
          for (var i = 0; i < optionData0.length; i++) { //计算总投票数
            totalNumber = totalNumber + optionData0[i].number;
          }
          for (var j = 0; j < optionData0.length; j++) {
            if (that.data.uniqueClickState[optionData0[j].unique]) {
              optionData0[j].number = optionData0[j].number + 1;
              totalNumber = totalNumber + 1;
              optionData0[j].joiner.push([app.globalData.openid, app.globalData.userInfo.avatarUrl]); // 在当前选项中压入openid和图片
            }
          }
          for (var k = 0; k < optionData0.length; k++) { //所有数据加完以后再次计算投票百分比
            optionData0[k].percent = parseInt((optionData0[k].number / totalNumber) * 100)
          }
          /************将本地的数据提交到数据库**********/
          that.submit(optionData0);
        }
      })
    }
  },
  submit: function(joinerData) { //提交用户投票数据
    var that = this;
    api.storeVoteOne({
      data: {
        voteid: that.data.voteid,
        optionData: joinerData
      },
      success: function(res) {
        wx.hideLoading();
        that.setData({
          optionData: joinerData,
        })
        that.setData({
          okWord: '已决定',
        });
        wx.showToast({
          title: '决定成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
  },
  showShare: function() {
    var that = this;
    that.setData({
      shareHidden: !that.data.shareHidden
    })
  },
})