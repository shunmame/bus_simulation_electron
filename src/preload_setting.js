const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    // 受信
    add_RT_data: (arg) => ipcRenderer.send("add_RT_data", arg),
    send_gtfs_zip: () => ipcRenderer.send("send_gtfs_zip"),

    //送信
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});