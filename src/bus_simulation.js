window.onload = function () {
    setInterval(update_gtfs_realtime, 15000);
}

// 受信
window.api.on("send_RT_data", (arg) => {
    show_gtfs_realtime_table(arg)
});

function update_gtfs_realtime() {
    window.api.update_marker();
    console.log("update")
}

function show_gtfs_realtime_table(RT_data) {
    var table = document.getElementById("entity_table");

    while (table.firstChild) {
        table.removeChild(table.firstChild)
    }

    var colum_name = ["id", "lat", "lon"]
    var thead = document.createElement("thead")
    var tr = document.createElement("tr")
    for (var i = 0; i < colum_name.length; i++) {
        var th = document.createElement("th")
        th.textContent = colum_name[i]
        tr.appendChild(th)
    }
    thead.appendChild(tr)
    table.appendChild(thead)

    for (var i = 0; i < Object.keys(RT_data.entity).length; i++) {
        var tr = document.createElement("tr")

        var th = document.createElement("th")
        th.textContent = RT_data.entity[i].id
        tr.appendChild(th)

        var td = document.createElement("td")
        td.textContent = RT_data.entity[i].vehicle.position.latitude;
        tr.appendChild(td)

        var td = document.createElement("td")
        td.textContent = RT_data.entity[i].vehicle.position.longitude;
        tr.appendChild(td)

        table.appendChild(tr)
    }
}