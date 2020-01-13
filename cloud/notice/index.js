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
let nightDay = formatTimeDay(myDate);//获取7天前日期

// 云函数入口函数
exports.main = async(event, context) => {
  if (event.NODEJS == 'myView') {
    return await myView();
  } else if (event.NODEJS == "myCreate") {
    return await myCreate();
  } else if (event.NODEJS == "createNoticeTask") {
    return await createNoticeTask(event);
  } else if (event.NODEJS == "getAllViewer") {
    return await getAllViewer(event);
  } else if (event.NODEJS == "getGIDTask") {
    return await getGIDTask(event);
  } else if (event.NODEJS == "getNoticeTask") {
    return await getNoticeTask(event)
  } else if (event.NODEJS == "storeNoticeGId") {
    return await storeNoticeGId(event);
  } else if (event.NODEJS == "storeViewerInfor") {
    return await storeViewerInfor(event);
  } else if (event.NODEJS == "notice_task_count") {
    return await notice_task_count(event);
  }
}

async function myView() {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('notice_user').aggregate()
    .lookup({
      from: "notice_task",
      localField: "noticeid",
      foreignField: "noticeid",
      as: "noticeList"
    })
    .match({
      openid: wxContext.OPENID,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data
}

async function myCreate() {
  const wxContext = cloud.getWXContext()
  return await db.collection('notice_task').where({
    openid: wxContext.OPENID,
    createTime: _.gte(nightDay)
  }).get()
}

async function createNoticeTask(event) {
  const wxContext = cloud.getWXContext()
  return await db.collection('notice_task').add({
    data: {
      openid: wxContext.OPENID,
      noticeid: event.noticeid,
      date: event.date,
      fileNumber: event.fileNumber,
      title: event.title,
      description: event.description,
      name: event.name,
      createTime: ft
    }
  })
}



async function getAllViewer(event) {
  let data = await db.collection('notice_user').aggregate()
    .lookup({
      from: "wxuser",
      localField: "openid",
      foreignField: "openid",
      as: "noticeList",
    })
    .match({
      noticeid: event.noticeid,
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



async function getGIDTask(event) {
  let data = await db.collection('notice_chatgroup').aggregate()
    .lookup({
      from: "notice_task",
      localField: "noticeid",
      foreignField: "noticeid",
      as: 'noticeList',
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



async function getNoticeTask(event) {
  if (event.noticeid) {
    return await db.collection('notice_task').where({
      noticeid: event.noticeid,
      createTime: _.gte(nightDay)
    }).get()
  }
  return [];
}


async function storeNoticeGId(event) {
  let data = await db.collection('notice_chatgroup').where({
    noticeid: event.noticeid,
    groupid: event.groupid
  }).get()
  if (data.data.length <= 0) {
    return await db.collection('notice_chatgroup').add({
      data: {
        noticeid: event.noticeid,
        groupid: event.groupid,
        createTime: ft
      }
    }).then(res => {
      return 'noticeid加入群ID成功'
    })
  } else {
    return 'noticeid没加入群ID数据'
  }
}


async function storeViewerInfor(event) {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('notice_user').where({
    openid: wxContext.OPENID,
    noticeid: event.noticeid
  }).get()
  if (data.data.length <= 0) {
    return await db.collection('notice_user').add({
      data: {
        noticeid: event.noticeid,
        openid: wxContext.OPENID,
        createTime: ft
      }
    }).then(res => {
      return '增加一名浏览用户'
    })
  } else {
    return '该用户已浏览过'
  }
}

async function notice_task_count(event){
  return await db.collection('notice_task').count();
}