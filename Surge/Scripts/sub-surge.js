
function getSurgePatch() {
	/*
		{
			"ruleSets": [
				{"url": "xx", "policy": "name"}
			]
		}
	 */
	const patchesKey = 'sub.patches'
	console.log($response.body)
	try {
		let obj = JSON.parse($response.body)
		$persistentStore.write($response.body, patchesKey)
		return obj

	} catch (e) {
		console.log(`error to parse policies data: ${$response.body} ${e.message}`)
	}
	let lastPoliciesStr = $persistentStore.read(patchesKey)
	if (lastPoliciesStr) {
		return JSON.parse(lastPoliciesStr)
	}
	return null
}

function downloadSub() {
	const subUrlKey = 'sub.url'
	

	const result = new Promise((resolve, reject) => {
		let subUrl = $persistentStore.read(subUrlKey)
		if (!subUrl) {
			reject(new Error("Subscribe url is not set"))
		}
		/*let cache = $persistentStore.read(subUrl)
		if (cache) {
			 resolve(cache)
		}*/

		$httpClient.get(subUrl, function(error, response, data){
			if (error) {
				reject(new Error(error))
			} else if (response.status != 200) {
				reject(new Error(`Failed to download ${subUrl}, code: ${response.status}, response: ${data}`))
			} else {
				//$persistentStore.write(data, subUrl)
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
	let patches = getSurgePatch()
	console.log(patches)
	let confName = $argument
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
		console.log(`error to download subscribe: ${e.message}, ${e.stack}`)
		// send error
	} finally {
		$done({
			status: response.status,
			headers: response.headers,
			body: response.body,
		})
	}
}

main()
