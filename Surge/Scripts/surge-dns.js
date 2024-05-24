// let preferIPv6 = false
// if ($network.v6 && $network.v6.primaryAddress) {
//     console.log("will use IPv6")
//     preferIPv6 = true
// }

const dnsData = $persistentStore.read("dns")
if (!dnsData) {
    $notification.post("DNS Error", "No dns data set.", "")
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
