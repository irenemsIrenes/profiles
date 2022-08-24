
function getSurgePatch() {
	/*
		{
			"ruleSets": [
				{"url": "xx", "policy": "name"}
			]
		}
	 */
	const patchesKey = 'sub.patches'
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
			reject("Subscribe url is not set")
		}

		$httpClient.get(subUrl, function(error, response, data){
			if (error) {
				reject(error)
			} else if (response.header != 200) {
				reject(`Failed to download ${subUrl}, code: ${response.header}, response: ${data}`)
			} else {
				resolve(data)
			}

		})
	})
	return result
}

function parseCfg(subStr) {
	let parsedLines = []
	let currentCfg = {
		"name": "",
		"data": []
	}
	for (let line in subStr.split('\n')) {
		let trimmedLine = line.trim()
		if (/^\[[^\[\]]+\]$/i.test(trimmedLine)) {
			currentCfg = {
				"name": trimmedLine,
				"data": []
			}
			parsedLines.push(currentCfg)
			continue
		}
		parsedLines.data.push(line)
	}
	return parsedLines
}

function getAllConfKeys(parsedLines, name) {
	let cfgKeys = []
	for (let cfg in parsedLines) {
		if (cfg.name == name) {
			for (let line in cfg.data) {
				line = line.trim()
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
	for (let cfg in parsedLines) {
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
	let policyNames = getAllConfKeys(parsedLines, '[Policy Group]')

	let policyGroup = getConf(parsedLines, '[Policy Group]')
	let rule = getConf(parsedLines, '[Rule]')
	if (policyGroup == null || rule == null) {
		console.log(`rule == null: ${rule == null}, policyGroup == null: ${policyGroup == null}`)
		return parsedLines
	}
	let newRuleSets = []
	for (let ruleSet in ruleSets) {
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

	let lines = []
	for (let parsedLine in parsedLines) {
		lines.push(parsedLine.name)
		lines = lines.concat(parsedLine.data)
	}
	return lines.join('\n')
}

async function main() {
	let patches = getSurgePatch()

	let response = {
		status: 500,
		body: '',
		headers: {
			'Content-Type': 'text/plain;charset=UTF-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PATCH,PUT,DELETE',
			'Access-Control-Allow-Headers':
				'Origin, X-Requested-With, Content-Type, Accept',
		},
	}

	try {
		const subStr = await downloadSub()
		// handle data
		response.body = patchSub(subStr, patches)

	} catch (e) {
		console.log(`error to download subscribe: ${$response.body}`, ${e.message})
		// send error
	} finally {
		$done({
			response,
		})
	}
}

main()
