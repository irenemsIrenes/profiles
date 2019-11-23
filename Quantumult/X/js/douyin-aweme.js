/**
 * @supported 00D3992C8F27
 */

$notify("douyin", "ads", "not remvoved");

var obj = JSON.parse($response.body);
if (obj.aweme_list) {
  for (var i = obj.aweme_list.length - 1; i >= 0; i--) {
    if (obj.aweme_list[i].raw_ad_data ||
          obj.aweme_list[i].is_ads == true) {
      obj.aweme_list.splice(i, 1);
      $notify("douyin", "ads", "remvoved");
    }
  }
}
$done(JSON.stringify(obj));
