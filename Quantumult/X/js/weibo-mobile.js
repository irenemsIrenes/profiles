/**
 * @supported 00D3992C8F27 8B87B7345981
 */
const userPattern = /.*(娱乐|肖战|圈内|整形).*/;
const textPattern = /.*(肖战).*/;
const verifiedPattern = /.*(娱乐|综艺|知名情感博主|电视团|剧评人|电视剧|超话|职业投资|营养师|美妆|时尚|运动|体育|健身|好物发现).*/;
const fromPattern = /.*(超话).*/;


var obj = JSON.parse($response.body);
if (obj.data && obj.data.cards) {
  for (var i = obj.data.cards.length - 1; i >= 0; i--) {
      let card = obj.data.cards[i];
      if (card.uve && card.uve.type == "ad") {
          obj.data.cards.splice(i, 1);
      } else if(card.mblog) {
        if (card.mblog.is_vote == 1) {
          obj.data.cards.splice(i, 1);
        }
        else if(card.mblog.user && ( verifiedPattern.test(card.mblog.user.verified_reason) || userPattern.test(card.mblog.user.screen_name)
                              )) {
           obj.data.cards.splice(i, 1);
        } else if (textPattern.test(card.mblog.text) || fromPattern.test(card.mblog.source)) {
          obj.data.cards.splice(i, 1);
        }
     }
  }
}
$done(JSON.stringify(obj));
