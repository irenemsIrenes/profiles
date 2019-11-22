/**
 * @supported 00D3992C8F27
 * The above random generated device ID can be found at the bottom of Quantumult X additional menu, and may be changed when system restored.
 * Indicate what device are supported by the file. This is necessary when the file is not loaded from local("On My iPhone - Quantumult X - Scripts").
 */

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
