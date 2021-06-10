const { contextBridge, ipcRenderer } = require("electron");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(__dirname + "/sqlite_db/unobusDB.db");
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const log = require('electron-log');

var realtime_marker_dict = {}
var stops_list

window.onload = () => {
    show_map()
}

contextBridge.exposeInMainWorld(
    "api", {
    // 受信
    update_marker: (arg) => update_gtfs_realtime(arg),
    get_RT_data: () => ipcRenderer.send("get_RT_data", (event, arg) => arg),
    get_RT_URL: () => ipcRenderer.send("get_RT_URL"),
    open_child_window: () => ipcRenderer.send("open_child_window"),

    // 送信
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});

ipcRenderer.on('close_child_win', async (event, message) => {
    RT_info = await ipcRenderer.invoke("get_new_RT_info");
    if (RT_info) {
        stops_list = await ipcRenderer.invoke("get_stops_list", RT_info["zip_path"])
        ipcRenderer.send("start_update", RT_info);
        plot_stops_from_list()
        show_gtfs_realtime(RT_info["RT_URL"])
    }
})

function show_map() {
    global.L = require('leaflet');
    global.map = L.map('mapid').setView([34.6657429, 133.9306472], 14);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(map)
}

function plot_stops_db() {
    const redMarker = { icon: L.divIcon({ className: 'red marker', iconSize: [10, 10] }) }

    db.serialize(function () {
        db.each("select stop_name, stop_lat, stop_lon from stops", function (err, row) {
            L.marker([row.stop_lat, row.stop_lon], redMarker).addTo(map).bindPopup(row.stop_name)//.openPopup()
        })
    })
    db.close()
}

function plot_stops_from_list() {
    const redMarker = { icon: L.divIcon({ className: 'red marker', iconSize: [10, 10] }) }

    stops_list.forEach(function (row) {
        var Keys = Object.keys(row)
        if (row[Keys[4]] && row[Keys[5]] && row[Keys[2]]) {
            var stop_lat = Number(row[Keys[4]].replace(/[\"]/g, ""))
            var stop_lon = Number(row[Keys[5]].replace(/[\"]/g, ""))
            var stop_name = row[Keys[2]].replace(/[\"]/g, "")
            L.marker([stop_lat, stop_lon], redMarker).addTo(map).bindPopup(stop_name)
        }
    })
}

function show_gtfs_realtime(RT_URL) {
    const blueMarker = { icon: L.divIcon({ className: 'blue marker', iconSize: [10, 10] }) }
    var requestSettings = {
        method: 'GET',
        url: RT_URL,
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
            var realtime_markers = []
            feed.entity.forEach(function (entity) {
                if (entity.vehicle) {
                    realtime_marker = L.marker([entity.vehicle.position.latitude, entity.vehicle.position.longitude], blueMarker).addTo(map).bindPopup("BUS")//.openPopup()
                    realtime_markers.push(realtime_marker)
                }
            });
            realtime_marker_dict[RT_URL] = realtime_markers
            ipcRenderer.send("get_RT_data", [RT_URL, feed]);
        }
    });
}

function update_gtfs_realtime(RT_URL) {
    console.log(realtime_marker_dict)
    for (let i = 0; i < realtime_marker_dict[RT_URL].length; i++) {
        map.removeLayer(realtime_marker_dict[RT_URL][i])
    }
    realtime_marker_dict[RT_URL] = []
    show_gtfs_realtime(RT_URL)
}