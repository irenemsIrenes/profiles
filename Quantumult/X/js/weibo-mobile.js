/**
 * @supported 00D3992C8F27 8B87B7345981
 */


var obj = JSON.parse($response.body);
if (obj.data && obj.data.cards) {
  for (var i = obj.data.cards.length - 1; i >= 0; i--) {
      let card = obj.data.cards[i];
      if (card.uve && card.uve.type == "ad") {
          obj.data.cards.splice(i, 1);
          //$notify("weibo", "ads", "remvoved");
      }
  }
}
$done(JSON.stringify(obj));
