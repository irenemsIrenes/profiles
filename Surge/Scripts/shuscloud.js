const url = $persistentStore.read("shuscloudurl")

if (url == null) {
    $notification.post("Shuscloud", "url is not set", "")
} else {
    $httpClient.get(url, function (error, response, data) {

       if (error != null) {
           console.log(error)
           console.log(response)
           console.log(data)
           $notification.post("Shuscloud", JSON.stringify(error), "")
       } else {
           const info = JSON.parse(data)
           if (!info.success) {
               $notification.post("Shuscloud", data, "")
           } else {
               const used = info.data.traffic.limit*info.data.traffic.used
               $notification.post("Shuscloud", `${new Date().toDateString()} Total ${info.data.traffic.limit} GB, used ${used.toPrecision(2)} GB`, "")
           }

       }
       $done();
    });
}

