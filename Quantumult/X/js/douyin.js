const path1 = /\/v\d+\/feed\//; // 推荐
const path2 = /\/v\d+\/aweme\/post\//; //作品
const path3 = /\/v\d+\/follow\/feed\//; // 关注
const path4 = /\/v\d+\/nearby\/feed\//; // 同城
const path5 = /\/v\d+\/search\/item\//; // 视频
const path6 = /\/v\d+\/general\/search\//; // 综合
const path7 = /\/v\d+\/hot\/search\/video\//; // 热搜
const path8 = /\/v\d+\/familiar\/feed\//; //朋友

const nicknamePattern = /电视|电影|電影|剪辑|剪剧|影视|剪刀|影剪|侃剧|明星|看剧|追剧|撩剧|撩大片|手游|综艺|剪影|商贸|配音|娱乐|PM|追星|影院|编程|说大片|整形|观影|渣剪/
const customVerify = /娱乐|自媒体/

try {
  let url = $request.url
  if (path1.test(url)) {
    feed();
  } else if (path2.test(url)) {
    post();
  } else if (path3.test(url)) {
    follow();
  } else if (path4.test(url)) {
    nearby();
  } else if (path5.test(url)) {
    item();
  } else if (path6.test(url)) {
    search();
  } else if (path7.test(url)) {
    hot();
  } else if (path8.test(url)) {
    friends()
  } else {
    $done({});
  }
} catch (e) {
  console.log(`douyin.js: ${e.message}, ${e.stack}`)
  $done($response.body);
}

function log_body_if_match() {
  if ($response.body.indexOf('剪映') != -1) {
    console.log($response.body)
  }
}

function feed() {
  let obj = JSON.parse($response.body);
  let arr = obj.aweme_list;
  let total = arr.length
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i].is_ads != false || is_block_content(arr[i])) {
      arr.splice(i, 1);
    } else {
      let play = arr[i].video.play_addr.url_list;
      arr[i].video.download_addr.url_list = play;
      let download = arr[i].video.download_addr;
      arr[i].video.download_suffix_logo_addr = download;
      arr[i].video.misc_download_addrs = {};
      arr[i].status.reviewed = 1;
      arr[i].video_control.allow_download = true;
      arr[i].author.room_id = 0;
      arr[i].anchors = null;
      if (arr[i].anchor_info) {
        arr[i].anchor_info = {}
      }
    }
  }
  console.log(`recommend feed: removed ${total - arr.length}`)
  $done({ body: JSON.stringify(obj) });
}

function is_block_content(aweme) {
  let author = aweme.author
  if (!author) {
    return false
  }

  if (author.nickname && nicknamePattern.test(author.nickname)) {
    return true
  }

  if (author.custom_verify && customVerify.test(author.custom_verify)) {
    return true
  }

  return false
}

function post() {
  let obj = JSON.parse($response.body);
  let arr = obj.aweme_list;
  if (arr != null) {
    for (var i = arr.length - 1; i >= 0; i--) {
      arr[i].status.reviewed = 1;
      arr[i].video_control.allow_download = true;
      let play = arr[i].video.play_addr.url_list;
      arr[i].video.download_addr.url_list = play;
      let download = arr[i].video.download_addr;
      arr[i].video.download_suffix_logo_addr = download;
    }
  }
  $done({ body: JSON.stringify(obj) });
}

function follow() {
  let obj = JSON.parse($response.body);
  let arr = obj.data;
  for (var i = arr.length - 1; i >= 0; i--) {
    arr[i].aweme.status.reviewed = 1;
    arr[i].aweme.video_control.allow_download = true;
    let play = arr[i].aweme.video.play_addr.url_list;
    arr[i].aweme.video.download_addr.url_list = play;
    let download = arr[i].aweme.video.download_addr;
    arr[i].aweme.video.download_suffix_logo_addr = download;
    arr[i].aweme.anchor_info = {}
    arr[i].aweme.commerce_info = {}
  }
  $done({ body: JSON.stringify(obj) });
}

function nearby() {
  let obj = JSON.parse($response.body);
  if (obj.aweme_list) {
    for (var i = obj.aweme_list.length - 1; i >= 0; i--) {
      if (obj.aweme_list[i].video) {
        if (obj.aweme_list[i].status.reviewed != 1) {
          obj.aweme_list[i].status.reviewed = 1;
          obj.aweme_list[i].video_control.allow_download = true;
        }
        if (obj.aweme_list[i].video.download_addr) {
          let play = obj.aweme_list[i].video.play_addr.url_list;
          obj.aweme_list[i].video.download_addr.url_list = play;
        }
        if (obj.aweme_list[i].video.download_suffix_logo_addr) {
          let download = obj.aweme_list[i].video.download_addr;
          obj.aweme_list[i].video.download_suffix_logo_addr = download;
        }
      } else {
        obj.aweme_list.splice(i, 1);
      }
    }
  }
  $done({ body: JSON.stringify(obj) });
}

function item() {
  let obj = JSON.parse($response.body);
  if (obj.aweme_list) {
    for (var i = obj.aweme_list.length - 1; i >= 0; i--) {
      if (obj.aweme_list[i].video) {
        if (obj.aweme_list[i].status.reviewed != 1) {
          obj.aweme_list[i].status.reviewed = 1;
          obj.aweme_list[i].video_control.allow_download = true;
        }
        if (obj.aweme_list[i].video.download_addr) {
          let play = obj.aweme_list[i].video.play_addr.url_list;
          obj.aweme_list[i].video.download_addr.url_list = play;
        }
        if (obj.aweme_list[i].video.download_suffix_logo_addr) {
          let download = obj.aweme_list[i].video.download_addr;
          obj.aweme_list[i].video.download_suffix_logo_addr = download;
        }
      }
    }
  }
  $done({ body: JSON.stringify(obj) });
}

function search() {
  let obj = JSON.parse($response.body);
  let arr = obj.data;
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i].type == 1) {
      if (arr[i].aweme_info.is_ads) {
        arr.splice(i, 1);
      }
      if (arr[i].aweme_info.video) {
        let play = arr[i].aweme_info.video.play_addr.url_list;
        arr[i].aweme_info.video.download_addr.url_list = play;
        let download = arr[i].aweme_info.video.download_addr;
        arr[i].aweme_info.video.download_suffix_logo_addr = download;
        arr[i].aweme_info.status.reviewed = 1;
        arr[i].aweme_info.video_control.allow_download = true;
      }
    }
  }
  $done({ body: JSON.stringify(obj) });
}

function hot() {
  let obj = JSON.parse($response.body);
  if (obj.aweme_list) {
    for (var i = obj.aweme_list.length - 1; i >= 0; i--) {
      if (obj.aweme_list[i].video.download_addr) {
        let play = obj.aweme_list[i].video.play_addr.url_list;
        obj.aweme_list[i].video.download_addr.url_list = play;
      }
      if (obj.aweme_list[i].video.download_suffix_logo_addr) {
        let download = obj.aweme_list[i].video.download_addr;
        obj.aweme_list[i].video.download_suffix_logo_addr = download;
      }
      if (obj.aweme_list[i].video.misc_download_addrs) {
        obj.aweme_list[i].video.misc_download_addrs = {};
      }
    }
  }
  $done({ body: JSON.stringify(obj) });
}

function friends() {
  follow()
}
