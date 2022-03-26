

function filterBlocks(blocks) {
	for(var i = blocks.length - 1; i >= 0; i--) {
		let block = blocks[i];
		let actions = block.actions
		if (!actions) {
			continue;
		}
		let clickEvent = actions.click_event;
		if (!clickEvent) {
			continue;
		}

		if (clickEvent.statistics && clickEvent.statistics.ad_area) {
			blocks.splice(i, 1);
		}
	}
}

try {
    let obj = JSON.parse($response.body);
    if (obj.cards) {
        for(var i = obj.cards.length - 1; i >= 0; i--) {
        	let card = obj.cards[i]
        	if (card.id.startsWith("ad_mobile_flow")) {
        		obj.cards.splice(i, 1);
        		continue;
        	}
        	if (card.blocks) {
        		filterBlocks(card.blocks)
        	}
        	
        }

    }
    if (obj.base) {
    	obj.base.statistics = {}
    }
    $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`qy_home.js: ${e.message}, ${e.stack}`)
  $done({});
}
