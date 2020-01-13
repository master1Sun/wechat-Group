// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'mybase-sun'
})

const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command


//生成日期格式
const formatTimeDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

let time = new Date()
time.setHours(time.getHours() + 8);
let ft = formatTimeDay(time);
let myDate = new Date();
myDate.setDate(myDate.getDate() - 7);
let nightDay = formatTimeDay(myDate); //获取7天前日期

// 云函数入口函数
exports.main = async(event, context) => {
  if (event.NODEJS == 'creatjielongtask') {
    return await creatjielongtask(event);
  } else if (event.NODEJS == "getGIDTask") {
    return await getGIDTask(event);
  } else if (event.NODEJS == "getTaskJoiner") {
    return await getTaskJoiner(event);
  } else if (event.NODEJS == "getjielongtask") {
    return await getjielongtask(event);
  } else if (event.NODEJS == "isEnrolled") {
    return await isEnrolled(event);
  } else if (event.NODEJS == "joinjielongtask") {
    return await joinjielongtask(event)
  } else if (event.NODEJS == "myCreate") {
    return await myCreate(event);
  } else if (event.NODEJS == "storeGId") {
    return await storeGId(event);
  } else if (event.NODEJS == "viewjielongtask") {
    return await viewjielongtask(event);
  } else if (event.NODEJS == "myJoin") {
    return await myJoin(event);
  }
}

async function creatjielongtask(event) {
  const wxContext = cloud.getWXContext()
  return await db.collection('link_task').add({
    data: {
      openid: wxContext.OPENID,
      taskid: event.taskid,
      title: event.title,
      address: event.address,
      tel: event.tel,
      date: event.date,
      time: event.time,
      name: event.name,
      remark: event.remark,
      peopleNumber: event.peopleNumber,
      noName: event.noName,
      createTime: ft
    }
  })
}

async function getGIDTask(event) {
  let data = await db.collection('link_chatgroup').aggregate()
    .lookup({
      from: "link_task",
      localField: "taskid",
      foreignField: "taskid",
      as: "noticeList",
    })
    .match({
      groupid: event.groupid,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data;
}

async function getTaskJoiner(event) {
  //获取参加活动用户
  let joiner = await db.collection('link_user').aggregate()
    .lookup({
      from: "wxuser",
      localField: "userid",
      foreignField: "openid",
      as: "noticeList",
    })
    .match({
      taskid: event.taskid,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()


  //获取浏览的用户
  let viewer = await db.collection('link_user').aggregate()
    .lookup({
      from: "wxuser",
      localField: "viewerid",
      foreignField: "openid",
      as: "noticeList",
    })
    .match({
      taskid: event.taskid,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()

  //获取参与用户
  let joinerList = [];
  if (joiner.list.length > 0) {
    joiner.list.forEach(function(v) {
      if (v.userid) {
        joinerList.push(v)
      }
    })
  }

  //获取浏览用户
  let viewerList = [];
  if (viewer.list.length > 0) {
    viewer.list.forEach(function (v) {
      if (v.viewerid) {
        viewerList.push(v)
      }
    })
  }
  return {
    joinerList,
    viewerList
  }
}

async function getjielongtask(event) {
  return await db.collection('link_task').where({
    taskid: event.taskid,
    createTime: _.gte(nightDay)
  }).get()
}

async function isEnrolled(event) {
  return await db.collection('link_user').where({
    taskid: event.taskid,
    createTime: _.gte(nightDay)
  }).get()
}

async function joinjielongtask(event) {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('link_user').where({
    taskid: event.taskid,
    viewerid: wxContext.OPENID
  }).update({
    data: {
      userid: wxContext.OPENID,
      joinerName: event.joinerName,
      joinerTel: event.joinerTel,
      joinerRemark: event.joinerRemark,
      updateTime: ft
    }
  })
  let data1 = await db.collection('wxuser').where({
    openid: wxContext.OPENID
  }).update({
    data: {
      joinerName: event.joinerName,
    }
  })
  if (data && data1) {
    return 'success'
  } else {
    return 'fail'
  }
}

async function myCreate(event) {
  const wxContext = cloud.getWXContext()
  return await db.collection('link_task').where({
    openid: wxContext.OPENID,
    createTime: _.gte(nightDay)
  }).get()
}

async function myJoin(event) {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('link_user').aggregate()
    .lookup({
      from: "link_task",
      localField: "taskid",
      foreignField: "taskid",
      as: "noticeList",
    })
    .match({
      userid: wxContext.OPENID,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data;
}


async function storeGId(event) {
  let data = await db.collection('link_chatgroup').where({
    taskid: event.taskid,
    groupid: event.groupid
  }).get()
  if (data.data.length <= 0) {
    await db.collection('link_chatgroup').add({
      data: {
        taskid: event.taskid,
        groupid: event.groupid,
        createTime: ft
      }
    })
    return 'taskid加入群ID成功'
  } else {
    return 'taskid没加入群ID数据';
  }
}



async function viewjielongtask(event) {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('link_user').where({
    taskid: event.taskid,
    viewerid: wxContext.OPENID
  }).get()
  if (data.data.length <= 0) {
    await db.collection('link_user').add({
      data: {
        taskid: event.taskid,
        viewerid: wxContext.OPENID,
        createTime: ft
      }
    })
  }
  return await db.collection('link_user').where({
    taskid: event.taskid
  }).get()
}