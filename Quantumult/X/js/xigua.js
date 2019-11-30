/**
 * @supported 00D3992C8F27 8B87B7345981
 */


var obj = JSON.parse($response.body);
if (obj.data) {
  for (var i = obj.data.length - 1; i >= 0; i--) {
    let content = JSON.parse(obj.data[i].content);
    if (content.raw_ad_data || content.label == '广告' || content.ad_id
    	|| content.ad_label)
    	obj.data.splice(i, 1);
      $notify("xi gua", "ads", "remvoved");
  }
}
$done(JSON.stringify(obj));
