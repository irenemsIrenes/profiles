const dnsData = $persistentStore.read("plugin-dns")
if (!dnsData) {
    $notification.post("Pugin DNS Error", "No dns data set.", "")
    $done({})
} else {
    const dns = JSON.parse(dnsData)
    if (dns.hasOwnProperty($domain)) {
        ipaddrs = []
        const domainDns = dns[$domain]
        if (domainDns.hasOwnProperty("ipv6") && domainDns.ipv6) {
            ipaddrs = ipaddrs.concat(domainDns.ipv6)
        }
        if (domainDns.hasOwnProperty("ipv4") && domainDns.ipv4) {
            ipaddrs = ipaddrs.concat(domainDns.ipv4)
        }
        $done({addresses: ipaddrs, ttl: 600});
    } else {
        console.log("domain " + $domain + " is not found in local dns")
        $done({})
    }
}
