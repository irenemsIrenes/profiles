var obj = JSON.parse($response.body);
if (obj.aweme_list) {
  for (var i = obj.aweme_list.length - 1; i >= 0; i--) {
    if (obj.aweme_list[i].raw_ad_data ||
          obj.aweme_list[i].is_ads == true) {
      obj.aweme_list.splice(i, 1);
    }
    if (obj.aweme_list[i].poi_info) {
      delete obj.aweme_list[i].poi_info;
    }
    if (obj.aweme_list[i].sticker_detail) {
      delete obj.aweme_list[i].sticker_detail;
    }
    if (obj.aweme_list[i].simple_promotions) {
      delete obj.aweme_list[i].simple_promotions;
    }
    obj.aweme_list[i].status.reviewed = 1;
    obj.aweme_list[i].video_control = arr;
  }
}
$done(JSON.stringify(obj));
