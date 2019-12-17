/**
 * @supported 00D3992C8F27 8B87B7345981
 */


var obj = JSON.parse($response.body);
if (obj.data) {
  for (var i = obj.data.length - 1; i >= 0; i--) {
      let item = obj.data[i];
      if (item.view_type == 'advert') {
          obj.data.splice(i, 1);
          $notify("people news", "ads", "remvoved");
      }
  }
}
$done(JSON.stringify(obj));
