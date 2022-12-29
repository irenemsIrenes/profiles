const urlPattern = new RegExp("^https:\/\/api.*\.amemv\.com\/aweme\/v\d\/feed\/.+", 'mi')

if (urlPattern.test($request.url)) {
	$done({ url: $request.url.replace(/^https:\/\/.*\.amemv\.com\/aweme\/v\d\//, "https://aweme.snssdk.com/aweme/v1/") });

} else {
	$done({})
}
