/**
 * @supported 00D3992C8F27 8B87B7345981
 */
const userPattern = /.*(娱乐|肖战).*/;
const textPattern = /.*(肖战).*/;
const verifiedPattern = /.*(娱乐|综艺|电视团|剧评人|电视剧).*/;


var obj = JSON.parse($response.body);
if (obj.data && obj.data.cards) {
  for (var i = obj.data.cards.length - 1; i >= 0; i--) {
      let card = obj.data.cards[i];
      if (card.uve && card.uve.type == "ad") {
          obj.data.cards.splice(i, 1);
      } else if(card.mblog) {
        if(card.mblog.user && ( verifiedPattern.test(card.mblog.user.verified_reason) || userPattern.test(card.mblog.user.screen_name))) {
           obj.data.cards.splice(i, 1);
        } else if (textPattern.test(card.mblog.text)) {
          obj.data.cards.splice(i, 1);
        }
     }
  }
}
$done(JSON.stringify(obj));
