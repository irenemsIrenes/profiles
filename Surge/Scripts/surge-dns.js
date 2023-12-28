let preferIPv6 = false
if ($network.v6 && $network.v6.primaryAddress) {
    console.log("will use IPv6")
    preferIPv6 = true
}

const dnsData = $persistentStore.read("dns")
if (!dnsData) {
    $notification.post("DNS Error", "No dns data set.", "")
    $done({})
} else {
    const dns = JSON.parse(dnsData)
    if (dns.hasOwnProperty($domain)) {
        const domainDns = dns[$domain]
        if (preferIPv6 && domainDns.hasOwnProperty("ipv6") && domainDns.ipv6) {
            console.log("domain " + $domain + " use ipv6")
            $done({addresses: domainDns.ipv6, ttl: 600});
        } else {
            console.log("domain " + $domain + " use ipv4")
            $done({addresses: domainDns.ipv4, ttl: 600});
        }
    } else {
        console.log("domain " + $domain + " is not found in local dns")
        $done({})
    }
}
