const { contextBridge, ipcRenderer } = require("electron");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(__dirname + "/sqlite_db/unobusDB.db");
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

var realtime_markers = []

window.onload = () => {
    show_map()
}

contextBridge.exposeInMainWorld(
    "api", {
    //rendererからの送信用//
    send: (channel, data) => {
        if (channel == "update_marker") {
            update_gtfs_realtime()
        }
        else {
            ipcRenderer.send(channel, data);
        }
    },
    //rendererでの受信用, funcはコールバック関数//
    on: (channel, func) => {
        if(channel == "start") {
            console.log(...args)
        }
        else {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

function show_map() {
    global.L = require('leaflet');
    global.map = L.map('mapid').setView([34.6657429, 133.9306472], 14);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(map)

    const redMarker = { icon: L.divIcon({ className: 'red marker', iconSize: [10, 10] }) }

    db.serialize(function () {
        db.each("select stop_name, stop_lat, stop_lon from stops", function (err, row) {
            L.marker([row.stop_lat, row.stop_lon], redMarker).addTo(map).bindPopup(row.stop_name)//.openPopup()
        })
    })
    db.close()

    show_gtfs_realtime()
}

function show_gtfs_realtime() {
    console.log("----")
    console.log(global.RT_URL)
    const blueMarker = { icon: L.divIcon({ className: 'blue marker', iconSize: [10, 10] }) }
    var requestSettings = {
        method: 'GET',
        url: global.RT_URL,
        encoding: null
    };
    request(requestSettings, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
            feed.entity.forEach(function (entity) {
                if (entity.vehicle) {
                    realtime_marker = L.marker([entity.vehicle.position.latitude, entity.vehicle.position.longitude], blueMarker).addTo(map).bindPopup("BUS")//.openPopup()
                    realtime_markers.push(realtime_marker)
                }
            });
            ipcRenderer.send("gtfs_RT_data", feed);
        }
    });
}

function update_gtfs_realtime() {
    for (let i = 0; i < realtime_markers.length; i++) {
        map.removeLayer(realtime_markers[i])
    }
    realtime_markers = []
    show_gtfs_realtime()
}