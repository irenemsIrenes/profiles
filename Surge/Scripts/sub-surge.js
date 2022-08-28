class PlatformAPI {
	constructor(name="Sub-surge", debug=false) {
		this.name = name
		this.debug = debug
		this.isSurge = typeof $httpClient !== 'undefined'
		this.isNode = eval(`typeof process !== "undefined"`)
		if (!this.isSurge && !this.isNode) {
			throw new Error("Must run in Surge or Node environment")
		}
		this.persistentStore = {}
		this.init()
		this.request = this.isNode
			? eval("require('request')")
			: $httpClient;
		this.argument = typeof $argument !== "undefined"? $argument : ""
	}

	init() {
		this.node = (() => {
			if (this.isNode) {
				const fs = eval("require('fs')");
				const os = eval("require('os')")
				return {
					fs,
					os,
				};
			} else {
				return null;
			}
		})();

		if (this.isNode) {
			let persistentStoreFile = this.node.os.homedir() + '/sub-surge.json';
			if (this.node.fs.existsSync(persistentStoreFile)) {
				this.persistentStore = JSON.parse(this.node.fs.readFileSync(persistentStoreFile));
			} else {
				this.persistentStore = {}
			}
		}

	}

	flush() {
		let persistentStoreFile = this.node.os.homedir() + '/sub-surge.json';
		this.node.fs.writeFileSync(
			persistentStoreFile,
			JSON.stringify(this.persistentStore, null, 2),
			{ flag: 'w' },
			(err) => console.log(err),
		)
	}

	write(data, key) {
		if (this.isSurge) {
			$persistentStore.write(data, key)
		} else {
			this.persistentStore[key] = data
			this.flush()
		}
	}

	read(key) {
		if (this.isSurge) {
			return $persistentStore.read(key)
		} else {
			return this.persistentStore[key]
		}
	}

	done(data = {}) {
		if (this.isSurge) {
			$done(data)
		} else {
			this.info(JSON.stringify(data))
		}
	}

	log(msg) {
		if (this.debug) console.log(`[${this.name}] LOG: ${msg}`);
	}

	info(msg) {
		console.log(`[${this.name}] INFO: ${msg}`);
	}

	error(msg) {
		console.log(`[${this.name}] ERROR: ${msg}`);
	}

	notify(title, subTitle, body) {
		if (this.isSurge) {
			$notification.post(title, subTitle, body)
		} else {
			this.info(`${title} -- ${subTitle} --${body}`)
		}
	}
}

const $ = new PlatformAPI();


function getSurgePatch() {
	/*
		{
			"ruleSets": [
				{"url": "xx", "policy": "name"}
			]
		}
	 */


	const patchesKey = 'sub.patches'
	const patchesUrlKey = 'sub.patches.url'

	const result = new Promise((resolve, reject) => {
		let patchesUrl = $.read(patchesUrlKey)
		if (!patchesUrl) {
			$.notify("Error", "", "sub.patches.url is not set")
			resolve(null)
			return
		}
		$.info(`downloading sub patches ${patchesUrl}`)
		$.request.get(patchesUrl, function(error, response, data){
			console.log(`error=${error},response=${JSON.stringify(response)}`)

			let status = error? 500: response.status || response.statusCode
			if (error || status != 200) {
				$.notify("Error", "", `failed to download ${patchesUrl}`)

				let lastPoliciesStr = $.read(patchesKey)
				if (lastPoliciesStr) {
					$.info("loaded patch from cache")
					resolve(JSON.parse(lastPoliciesStr))
				} else {
					resolve(null)
				}

			}  else {
				$.write(data, patchesKey)
				resolve(JSON.parse(data))
			}
		})

	})
	return result
}

function downloadSub() {
	const subUrlKey = 'sub.url'

	const result = new Promise((resolve, reject) => {
		let subUrl = $.read(subUrlKey)
		if (!subUrl) {
			$.notify("Error", "","Subscribe url is not set")
			reject(new Error("Subscribe url is not set"))
			return
		}
		/*let cache = $persistentStore.read(subUrl)
		if (cache) {
			 resolve(cache)
		}*/
		$.info(`downloading subscribe ${subUrl}`)
		$.request.get(subUrl, function(error, response, data){
			console.log(`error=${error},response=${JSON.stringify(response)}`)

			let status = error? 500: response.status || response.statusCode
			if (error || status != 200) {
				$.notify("Error", "", `failed to download ${subUrl}`)
				reject(new Error(`failed to download subscribe ${subUrl}`))
			} else {
				$.write(data, subUrl)
				resolve(data)
			}

		})
	})
	return result
}

function parseCfg(subStr) {
	let rawLines = subStr.split("\n")
	let parsedLines = []
	let currentCfg = {
		"name": "",
		"data": []
	}
	for (let i in rawLines) {
		let line = rawLines[i]
		let trimmedLine = line.trim()
		if (/^\[[^\[\]]+\]$/i.test(trimmedLine)) {
			console.log(trimmedLine)
			currentCfg = {
				"name": trimmedLine,
				"data": []
			}
			parsedLines.push(currentCfg)
			continue
		}
		currentCfg.data.push(line)
	}
	return parsedLines
}

function getAllConfKeys(parsedLines, name) {
	let cfgKeys = []
	for (let k in parsedLines) {
		let cfg = parsedLines[k]
		if (cfg.name == name) {
			for (let i in cfg.data) {
				let line = cfg.data[i].trim()
				if (line.startsWith("#") || line.startsWith("//") || line.startsWith("/*")) {
					continue
				}
				let cfgs = line.split("=")
				if (cfgs.length <= 1) {
					console.log(`invalid proxy line: ${line}`)
					continue
				}
				cfgKeys.push(cfgs[0].trim())
			}
			break
		}
	}

	return cfgKeys
}

function getConf(parsedLines, name) {
	for (let i in parsedLines) {
		let cfg = parsedLines[i]
		if (cfg.name == name) {
			return cfg
		}
	}
	return null
}

function patchRuleSets(parsedLines, ruleSets) {
	let proxyNames = getAllConfKeys(parsedLines, '[Proxy]')
	proxyNames.unshift('select')
	let proxyStr = proxyNames.join(',')
	let policyNames = getAllConfKeys(parsedLines, '[Proxy Group]')

	let policyGroup = getConf(parsedLines, '[Proxy Group]')
	let rule = getConf(parsedLines, '[Rule]')
	if (policyGroup == null || rule == null) {
		console.log(`rule == null: ${rule == null}, policyGroup == null: ${policyGroup == null}`)
		return parsedLines
	}
	let newRuleSets = []
	for (let i in ruleSets) {
		let ruleSet = ruleSets[i]
		newRuleSets.push(`RULE-SET,${ruleSet.url},${ruleSet.policy}`)
		if (!policyNames.includes(ruleSet.policy)) {
			policyNames.push(ruleSet.policy)
			policyGroup.data.push(`${ruleSet.policy} = ${proxyStr}`)
		}
	}
	newRuleSets.push("\n")
	rule.data = newRuleSets.concat(rule.data)
	return parsedLines
}

function patchSub(subStr, patches) {
	if (!patches) {
		return subStr
	}
	let parsedLines = parseCfg(subStr)

	parsedLines = patchRuleSets(parsedLines, patches.ruleSets)

	let lines = [`#!MANAGED-CONFIG ${$request.url} interval=86400 strict=true\n`]
	for (let i in parsedLines) {
		let parsedLine = parsedLines[i]
		lines.push(parsedLine.name)
		lines = lines.concat(parsedLine.data)
	}
	return lines.join('\n')
}

async function main() {
	let patches = await getSurgePatch()
	$.info("patches downloaded")
	let confName = $.argument
	if (confName == null || confName.length == 0) {
		confName = "sub-patched.conf"
	}
	console.log(`confName=${confName}`)

	let response = {
		status: 500,
		body: '',
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PATCH,PUT,DELETE',
			'Access-Control-Allow-Headers':
				'Origin, X-Requested-With, Content-Type, Accept',
			'Content-Disposition': `inline; filename="${confName}"`
		},
	}

	try {
		let subStr = await downloadSub()
		console.log("subscribe profile downloaded")
		// handle data
		response.body = patchSub(subStr, patches)
		response.status = 200

	} catch (e) {
		console.log(`${e.message}, ${e.stack}`)
		// send error
	} finally {
		// console.log(response.body)
		console.log(`write body to key 'sub-surge.result'`)
		$.write(response.body, 'sub-surge.result')
		if (response.body.length <= 15) {
			$.error("body length less than 15, may be invalid")
		}
		$.done({
			status: response.status,
			headers: response.headers,
			body: response.body,
		})
	}
}

if ($.isSurge) {
	main()
} else if ($.isNode) {
	module.exports = {$}
}
